const {app, BrowserWindow, ipcMain, Tray, nativeImage} = require('electron');
const path = require('path');

let tray;
let window;

app.on('ready', () => {
  window = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
  });
  window.loadURL('file://' + path.join(__dirname, 'index.html'));
  window.webContents.openDevTools(); // DEBUGGER

  const icon = nativeImage.createFromPath('./assets/logo.png');
  tray = new Tray(icon);

  tray.on('click', (event) => {
    toggleWindow();
  });
});

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

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
};

ipcMain.on('show-window', () => {
  showWindow();
});
