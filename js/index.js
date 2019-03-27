const {ipcRenderer, remote} = require('electron');
const {exec} = require('child_process');
const path = require('path');

let window;

document.addEventListener('DOMContentLoaded', () => {
  // Add script items to page
  for (let i = 1; i <= 5; i++) {
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
            <button class="script-button" id="script-${scriptNumber}-button">
            </button>
          </div>`;
};

const scriptItemClicked = (scriptNumber) => {
  exec('ls', (err, stdout, stderr) => {
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
    window.show();
    window.focus();
  };
};

ipcRenderer.on('keyboard-shortcut-triggered', (event, data) => {
  scriptItemClicked(data.scriptNumber);
});
