import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { fileURLToPath } from 'url';
import { syncFromPostgresToSQLite, syncFromSQLiteToPostgres } from '../server/src/db/sync.js';
import { initializeSQLite } from '../server/src/db/sqlite.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let syncInterval: NodeJS.Timeout | null = null;

// Create the main application window
app.on('ready', async () => {
    // Initialize SQLite database
    initializeSQLite();
    
    mainWindow = new BrowserWindow({
        width: 1200,
        minWidth: 1200,
        height: 600,
        minHeight: 600,
        frame: false,
        show: false,
        backgroundColor: '#02367B',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true
        }
    });

    // Set Content Security Policy to prevent unsafe-eval (only in production)
    if (!isDev()) {
        mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [
                        "default-src 'self'; " +
                        "script-src 'self'; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data: https:; " +
                        "font-src 'self'; " +
                        "connect-src 'self' http://localhost:3001 ws://localhost:3001; " +
                        "object-src 'none'; " +
                        "base-uri 'self'; " +
                        "form-action 'self';"
                    ]
                }
            });
        });
    }
    mainWindow.menuBarVisible = false;

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        mainWindow?.maximize();
    });

    if (isDev()) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        // Clear sync interval when window closes
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
        }
    });

    // 🔥 INITIAL SYNC - Try to sync on app start if online
    try {
        console.log('🚀 App started - checking connection...');
        await syncFromPostgresToSQLite();
        console.log('✅ Initial sync completed');
        
        // Start background sync (every 5 minutes)
        startBackgroundSync();
    } catch (error) {
        console.log('⚠️ Starting in offline mode:', error);
        // App will use SQLite cache
    }
});

// 🔄 Background sync function
function startBackgroundSync() {
    syncInterval = setInterval(async () => {
        try {
            console.log('🔄 Background sync starting...');
            await syncFromSQLiteToPostgres(); // Push local changes first
            await syncFromPostgresToSQLite(); // Then pull latest data
            console.log('✅ Background sync completed');
        } catch (error) {
            console.log('⚠️ Background sync failed (offline?):', error);
        }
    }, 5 * 60 * 1000); // Every 5 minutes
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        app.emit('ready');
    }
});

// Handle window control events from renderer process
ipcMain.on('window-minimize', () => {
    mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.on('window-close', () => {
    mainWindow?.close();
});

// 🌐 Handle online/offline events from renderer
ipcMain.on('online', async () => {
    console.log('🌐 Connection restored - syncing...');
    try {
        await syncFromSQLiteToPostgres(); // Push any offline changes
        await syncFromPostgresToSQLite(); // Pull latest data
        console.log('✅ Online sync completed');
        
        // Restart background sync if it was stopped
        if (!syncInterval) {
            startBackgroundSync();
        }
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
});

ipcMain.on('offline', () => {
    console.log('📴 Connection lost - entering offline mode');
    // Stop background sync to avoid errors
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
});

// 🔄 Manual sync trigger (optional - for a "Sync Now" button in UI)
ipcMain.handle('manual-sync', async () => {
    try {
        console.log('🔄 Manual sync triggered...');
        await syncFromSQLiteToPostgres();
        await syncFromPostgresToSQLite();
        return { success: true, message: 'Sync completed successfully' };
    } catch (error: any) {
        console.error('❌ Manual sync failed:', error);
        return { success: false, message: error.message };
    }
});