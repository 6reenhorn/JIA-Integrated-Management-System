import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from './util.js';

type test = string

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 1200,
        minWidth: 1200,
        height: 600,
        minHeight: 600,
    });
    mainWindow.menuBarVisible = false;

    if (isDev()) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'));
    }
});