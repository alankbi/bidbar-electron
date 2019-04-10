const {app, BrowserWindow, globalShortcut,
  ipcMain, Tray, nativeImage} = require('electron');
const {scripts} = require('./js/data.js');
const path = require('path');

let tray;
let window;
let webContents;

app.on('ready', () => {
  initializeDisplays();
  registerShortcuts();

  window.webContents.openDevTools(); // DEBUGGER
});

const initializeDisplays = () => {
  window = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  window.loadURL('file://' + path.join(__dirname, 'html/index.html'));
  webContents = window.webContents;

  const icon = nativeImage.createFromPath('./assets/logo.png');
  tray = new Tray(icon);

  tray.on('click', (event) => {
    toggleWindow();
  });
};

const registerShortcuts = () => {
  for (let i = 0; i < scripts.length; i++) {
    globalShortcut.register('Shift+CommandOrControl+Alt+' + (i + 1), () => {
      webContents.send('keyboard-shortcut-triggered', {'scriptNumber': i});
    });
  }
};

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
};

const showWindow = () => {
  const trayPos = tray.getBounds();
  const windowPos = window.getBounds();

  const x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
  let y = 0;

  if (process.platform === 'darwin') {
    y = Math.round(trayPos.y + trayPos.height);
  } else {
    y = Math.round(trayPos.y + trayPos.height * 5);
  }

  window.setPosition(x, y, false);
  window.show();
  window.focus();
};

ipcMain.on('show-window', () => {
  showWindow();
});

// Everything below this is for testing purposes
const getTray = () => {
  return tray;
};

const getWindow = () => {
  return window;
};

ipcMain.on('test-notification-clicked', () => {
  window.webContents.send('test-notification-clicked');
});

module.exports = {
  app: app,
  initializeDisplays: initializeDisplays,
  registerShortcuts: registerShortcuts,
  showWindow: showWindow,
  toggleWindow: toggleWindow,
  getTray: getTray,
  getWindow: getWindow,
};
