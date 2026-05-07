import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import TikTokConnector from './tiktokConnector.js';
import https from 'https';

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let overlayWindow;
let connector;

// IPC for TTS to bypass browser restrictions
ipcMain.handle('get-tts-audio', async (event, text) => {
    return new Promise((resolve, reject) => {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=th&client=tw-ob`;
        
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
                'Referer': 'https://translate.google.com/'
            }
        }, (res) => {
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                resolve(`data:audio/mp3;base64,${buffer.toString('base64')}`);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
});

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 750,
        minWidth: 400,
        minHeight: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "LiveCat - TikTok LIVE Chat Reader",
        backgroundColor: '#0F172A',
        icon: path.join(__dirname, app.isPackaged ? '../../dist/branding/icon.png' : '../../public/branding/icon.png')
    });

    mainWindow.setMenu(null);

    const isDev = !app.isPackaged;
    const devUrl = 'http://localhost:3033';

    if (isDev) {
        mainWindow.loadURL(devUrl);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (overlayWindow) overlayWindow.close();
    });
}

function createOverlayWindow() {
    overlayWindow = new BrowserWindow({
        width: 400,
        height: 600,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        backgroundColor: '#00000000', // Transparent
    });

    const isDev = !app.isPackaged;
    const devUrl = 'http://localhost:3033';

    if (isDev) {
        overlayWindow.loadURL(`${devUrl}/overlay.html`);
    } else {
        overlayWindow.loadFile(path.join(__dirname, '../../dist/overlay.html'));
    }

    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });

    overlayWindow.hide();
}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createMainWindow();
    createOverlayWindow();

    connector = new TikTokConnector(mainWindow, overlayWindow);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.on('tiktok-connect', (event, username) => {
    connector.connect(username);
});

ipcMain.on('tiktok-disconnect', () => {
    connector.disconnect();
});

ipcMain.on('toggle-overlay', () => {
    if (overlayWindow) {
        if (overlayWindow.isVisible()) {
            overlayWindow.hide();
        } else {
            overlayWindow.show();
        }
    }
});

ipcMain.on('set-always-on-top', (event, value) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(value);
    }
});
