const {app, BrowserWindow, globalShortcut,
  ipcMain, Tray, nativeImage, Menu} = require('electron');
const {scriptStore} = require('./js/data.js');
const path = require('path');

let tray;
let window;
let webContents;
let settings;

app.on('ready', () => {
  initializeDisplays();
  registerShortcuts();
  createMenu();
  window.webContents.openDevTools(); // DEBUGGER
});

const initializeDisplays = () => {
  window = new BrowserWindow({
    width: 360,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: path.join(__dirname, './assets/icons/png/64x64.png'),
  });
  window.loadURL('file://' + path.join(__dirname, 'html/index.html'));
  webContents = window.webContents;

  window.on('blur', () => {
    window.hide();
  });

  const logoPath = path.join(__dirname, './assets/logo.png');
  const icon = nativeImage.createFromPath(logoPath);
  tray = new Tray(icon);

  tray.on('click', (event) => {
    toggleWindow();
  });
};

const registerShortcuts = () => {
  const maxKey = Math.max(scriptStore.get('scripts').length, 10);
  for (let i = 0; i < maxKey; i++) {
    const key = (i + 1) % 10;
    globalShortcut.register('Shift+CommandOrControl+Alt+' + key, () => {
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

  // Open window on current desktop
  window.setVisibleOnAllWorkspaces(true);
  window.focus();
  window.setVisibleOnAllWorkspaces(false);
};

const createMenu = () => {
  const application = {
    label: 'Application',
    submenu: [
      {
        label: 'About Bidbar',
        click: () => {
          settings = new BrowserWindow({
            width: 550,
            height: 650,
            center: true,
            resizable: true,
            webPreferences: {
              nodeIntegration: true,
            },
          });
          settings.loadURL('file://' + path.join(__dirname, 'html/settings.html'));
          // settings.webContents.openDevTools(); // DEBUGGER
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Close Window',
        accelerator: 'CmdOrCtrl+W',
        click: () => {
          const currentWindow = BrowserWindow.getFocusedWindow();
          if (!currentWindow || currentWindow == window) {
            app.quit();
          } else {
            currentWindow.close();
          }
        },
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  };

  const edit = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectAll',
      },
    ],
  };

  const template = [application, edit];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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

ipcMain.on('script-item-added', () => {
  const index = scriptStore.get('scripts').length - 1;
  if (index >= 10) {
    return;
  }

  const key = (index + 1) % 10;
  globalShortcut.register('Shift+CommandOrControl+Alt+' + key, () => {
    webContents.send('keyboard-shortcut-triggered', {'scriptNumber': index});
  });
});

ipcMain.on('script-item-deleted', () => {
  const index = scriptStore.get('scripts').length;
  if (index >= 10) {
    return;
  }

  globalShortcut.unregister('Shift+CommandOrControl+Alt+' + (index + 1) % 10);
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
