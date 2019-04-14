const {ipcRenderer, remote} = require('electron');
const {exec} = require('child_process');
const path = require('path');
const {scriptStore} = require('./data.js');

let window;

const runScript = (scriptNumber) => {
  let command;
  const scripts = scriptStore.get('scripts');
  if (scriptNumber >= 0 && scriptNumber < scripts.length) {
    command = scripts[scriptNumber].script;
  } else {
    command = 'echo No script currently assigned';
  }

  exec(command, (err, stdout, stderr) => {
    window = new remote.BrowserWindow({
      parent: remote.getCurrentWindow(),
      width: 600,
      height: 480,
      show: false,
      center: true,
      resizable: true,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    window.loadURL('file://' + path.join(__dirname, '../html/output.html'));

    // window.webContents.openDevTools(); // DEBUGGER

    window.webContents.on('did-finish-load', () => {
      window.webContents.send('output-data', {
        stdout: stdout,
        err: err ? err.message : err,
      });
    });

    createNotification(scriptNumber);
  });
};

const createNotification = (scriptNumber) => {
  const n = new Notification('Script ' + (scriptNumber + 1) + ' completed', {
    body: 'Finished in 1.0 seconds',
  });

  n.onclick = () => {
    focusOutputWindow();
  };
};

const focusOutputWindow = () => {
  window.show();
  window.focus();
};

ipcRenderer.on('keyboard-shortcut-triggered', (event, data) => {
  runScript(data.scriptNumber);
});

// Used in old tests
ipcRenderer.on('test-notification-clicked', () => {
  focusOutputWindow();
});

module.exports = {
  runScript: runScript,
};
