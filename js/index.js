const {ipcRenderer, remote} = require('electron');
const {exec} = require('child_process');
const path = require('path');
const {scripts} = require('./scripts.js');

let window;

document.addEventListener('DOMContentLoaded', () => {
  // Add script items to page
  for (let i = 1; i <= scripts.length; i++) {
    const container = document.getElementById('container');
    container.innerHTML += createScriptItemHTML(i);
  }

  // Add event listener for each script item
  const scriptItems = document.querySelectorAll('.script-button');
  scriptItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      scriptItemClicked(index + 1);
    });
  });
});

const createScriptItemHTML = (scriptNumber) => {
  return `<div class="script-${scriptNumber}">
            <p>Script ${scriptNumber}</p>
            <button class="script-button" id="script-button-${scriptNumber}">
            </button>
          </div>`;
};

const scriptItemClicked = (scriptNumber) => {
  let command;
  // scriptNumber ranges from 1 -> N, scripts index ranges from 0 -> N-1
  if (scriptNumber > 0 && scriptNumber <= scripts.length) {
    command = scripts[scriptNumber - 1].script;
  } else {
    command = 'echo "No script currently assigned"';
  }

  exec(command, (err, stdout, stderr) => {
    if (err) {
      return;
    }

    window = new remote.BrowserWindow({
      parent: remote.getCurrentWindow(),
      width: 500,
      height: 400,
      show: false,
      center: true,
      resizable: true,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    window.loadURL('file://' + path.join(__dirname, '../html/output.html'));

    window.webContents.openDevTools(); // DEBUGGER

    window.webContents.on('did-finish-load', () => {
      window.webContents.send('output-data', {
        stdout: stdout,
        stderr: stderr,
      });
    });

    createNotification(scriptNumber);
  });
};

const createNotification = (scriptNumber) => {
  const n = new Notification('Script ' + scriptNumber + ' completed', {
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
  scriptItemClicked(data.scriptNumber);
});

ipcRenderer.on('test-notification-clicked', () => {
  focusOutputWindow();
});
