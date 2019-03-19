const {app, BrowserWindow, ipcMain, Tray, nativeImage} = require('electron');
const path = require('path');

let tray;
let window;

app.on('ready', () => {
  window = new BrowserWindow({
    width: '300px',
    height: '500px',
    show: false,
    frame: false,
    resizable: false,
  });
  window.loadURL('file://' + path.join(__dirname, 'index.html'));

  const icon = nativeImage.createFromPath('./assets/logo.png');
  tray = new Tray(icon);

  tray.on('click', (event) => {
    toggleWindow();
  });
});

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    window.show();
    window.focus();
  }
};

ipcMain.on('show-window', () => {
  window.show();
  window.focus();
});
