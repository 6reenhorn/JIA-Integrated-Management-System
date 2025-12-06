const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // Online/Offline detection
  onOnline: () => ipcRenderer.send('online'),
  onOffline: () => ipcRenderer.send('offline'),
  
  // Manual sync trigger
  manualSync: () => ipcRenderer.invoke('manual-sync'),
  
  // Check current network status
  isOnline: () => navigator.onLine
});