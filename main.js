const {app, BrowserWindow, globalShortcut,
  ipcMain, Tray, nativeImage} = require('electron');
const path = require('path');

let tray;
let window;
let webContents;

app.on('ready', () => {
  initializeDisplays();
  registerShortcuts();

  if (process.env.RUNNING_IN_SPECTRON === 'test') {
    window.webContents.openDevTools();
  }
});

const initializeDisplays = () => {
  window = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
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
  for (let i = 1; i <= 5; i++) {
    globalShortcut.register('Shift+CommandOrControl+Alt+' + i, () => {
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

// For testing purposes
const getTray = () => {
  return tray;
};

// For testing purposes
const getWindow = () => {
  return window;
};

module.exports = {
  'app': app,
  'initializeDisplays': initializeDisplays,
  'registerShortcuts': registerShortcuts,
  'toggleWindow': toggleWindow,
  'getTray': getTray,
  'getWindow': getWindow,
};
