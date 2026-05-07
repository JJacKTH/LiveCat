const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    connect: (username) => ipcRenderer.send('tiktok-connect', username),
    disconnect: () => ipcRenderer.send('tiktok-disconnect'),
    onStatusChanged: (callback) => {
        ipcRenderer.removeAllListeners('status-changed');
        ipcRenderer.on('status-changed', callback);
    },
    onNewEvent: (callback) => {
        ipcRenderer.removeAllListeners('new-event');
        ipcRenderer.on('new-event', callback);
    },
    onViewerCount: (callback) => {
        ipcRenderer.removeAllListeners('viewer-count');
        ipcRenderer.on('viewer-count', callback);
    },
    toggleOverlay: () => ipcRenderer.send('toggle-overlay'),
    setAlwaysOnTop: (value) => ipcRenderer.send('set-always-on-top', value),
    clearChat: () => ipcRenderer.send('clear-chat'),
    getTTSAudio: (text) => ipcRenderer.invoke('get-tts-audio', text),
});
