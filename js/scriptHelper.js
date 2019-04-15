const {ipcRenderer, remote} = require('electron');
const {exec} = require('child_process');
const path = require('path');
const fixPath = require('fix-path');
const {scriptStore} = require('./data.js');

let window;

fixPath(); // to allow commands to work in a macOS packaged app

const runScript = (scriptNumber) => {
  let command;
  const scripts = scriptStore.get('scripts');
  if (scriptNumber >= 0 && scriptNumber < scripts.length) {
    command = scripts[scriptNumber].script;
  } else {
    command = 'echo No script currently assigned';
  }

  const start = new Date();
  exec(command, (err, stdout, stderr) => {
    let time = (new Date() - start) / 1000; // in seconds
    time = Math.round(time * 100) / 100; // round to two decimals

    window = new remote.BrowserWindow({
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

    const scripts = scriptStore.get('scripts');
    const text = (scriptNumber + 1) + '. ' + scripts[scriptNumber].title;

    window.webContents.on('did-finish-load', () => {
      window.webContents.send('output-data', {
        stdout: stdout,
        err: err ? err.message : err,
        title: 'Script ' + text,
      });
    });

    createNotification(text, time, err);
  });
};

const createNotification = (text, time, err) => {
  const n = new Notification(text, {
    body: (err ? 'Failure' : 'Success') + ' - ' + time + ' seconds',
    icon: path.join(__dirname, '../assets/' + (err ? 'n_f' : 'n_s') + '.png'),
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
