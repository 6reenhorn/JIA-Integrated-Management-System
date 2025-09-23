import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { ipcMain } from 'electron';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the main application window
app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 1200,
        minWidth: 1200,
        height: 600,
        minHeight: 600,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    mainWindow.menuBarVisible = false;

    if (isDev()) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'));
    }
});

// Handle window control events from renderer process
ipcMain.on('window-minimize', (event) => {
  BrowserWindow.getFocusedWindow()?.minimize();
});
ipcMain.on('window-maximize', (event) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});
ipcMain.on('window-close', (event) => {
  BrowserWindow.getFocusedWindow()?.close();
});