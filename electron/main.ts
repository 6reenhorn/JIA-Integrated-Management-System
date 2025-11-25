import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { ipcMain } from 'electron';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// Create the main application window
app.on('ready', () => {
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
    });
});

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