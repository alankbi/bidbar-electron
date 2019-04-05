const {ipcRenderer, remote} = require('electron');
const {exec} = require('child_process');
const path = require('path');
const {scripts, scriptStore} = require('./scripts.js');

let window;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');

  // Add script items to page
  for (let i = 0; i < scripts.length; i++) {
    container.appendChild(createScriptItemHTML(i));
  }

  document.getElementById('add-script-button').addEventListener('click', () => {
    onAddScript();
    container.appendChild(createScriptItemHTML(scripts.length));
  });
});

const createScriptItemHTML = (scriptNumber) => {
  let scriptItem = document.createElement('div');
  scriptItem.innerHTML =
    `<div class="script-${scriptNumber}">
      <h3>Script ${scriptNumber + 1}</h3>
      <h4>${scripts[scriptNumber].title}</h4>
      <p>${scripts[scriptNumber].script}</p>
      <button class="script-button" value="Run" 
        id="script-button-${scriptNumber}"></button>
    </div>`;

  scriptItem = scriptItem.firstChild;
  scriptItem.addEventListener('click', () => {
    scriptItemClicked(scriptNumber);
  });
  return scriptItem;
};

const scriptItemClicked = (scriptNumber) => {
  let command;
  // scriptNumber ranges from 1 -> N, scripts index ranges from 0 -> N-1
  if (scriptNumber >= 0 && scriptNumber < scripts.length) {
    command = scripts[scriptNumber].script;
  } else {
    command = 'echo "No script currently assigned"';
  }

  exec(command, (err, stdout, stderr) => {
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

const onAddScript = () => {
  const title = document.getElementById('script-title');
  const cmd = document.getElementById('script-cmd');

  scriptStore.set('scripts', [
    ...scripts,
    {
      title: title.value,
      script: cmd.value,
    },
  ]);

  title.value = '';
  cmd.value = '';
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
