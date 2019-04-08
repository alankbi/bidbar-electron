const {ipcRenderer, remote} = require('electron');
const {exec} = require('child_process');
const path = require('path');
const {scripts, scriptStore, scriptLimit} = require('./scripts.js');

let window;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');

  // Add script items to page
  for (let i = 0; i < scripts.length; i++) {
    container.appendChild(createScriptItemHTML(i));
    attachScriptsToItem(i);
  }

  document.getElementById('add-script-button').addEventListener('click', () => {
    const success = onAddScript();
    if (success) {
      container.appendChild(createScriptItemHTML(scripts.length));
      attachScriptsToItem(scripts.length);
    }
  });
});

const createScriptItemHTML = (scriptNumber) => {
  let scriptItem = document.createElement('div');
  scriptItem.innerHTML =
    `<div class="script-container">
      <h3 id="script-${scriptNumber}-header">Script ${scriptNumber + 1}</h3>

      <input type="text" id="script-${scriptNumber}-title" 
        value="${scripts[scriptNumber].title}" readonly>
      <!--<h4>${scripts[scriptNumber].title}</h4>-->
      
      <input type="text" id="script-${scriptNumber}-command" 
        value="${scripts[scriptNumber].script}" readonly>
      <!--<p>${scripts[scriptNumber].script}</p>-->

      <button class="run-script-button"
        id="run-button-${scriptNumber}">Run</button>

      <button class="edit-script-button"
        id="edit-button-${scriptNumber}">Edit</button>

      <button class="delete-script-button"
        id="delete-button-${scriptNumber}">Delete</button>
    </div>`;

  scriptItem = scriptItem.firstChild;
  return scriptItem;
};

const attachScriptsToItem = (scriptNumber) => {
  const suffix = '-button-' + scriptNumber;
  document.getElementById('run' + suffix).addEventListener('click', () => {
    runItemClicked(scriptNumber);
  });
  document.getElementById('edit' + suffix).addEventListener('click', () => {
    editItemClicked(scriptNumber);
  });
  document.getElementById('delete' + suffix).addEventListener('click', () => {
    deleteItemClicked(scriptNumber);
  });
};

const runItemClicked = (scriptNumber) => {
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

    window.webContents.openDevTools(); // DEBUGGER

    window.webContents.on('did-finish-load', () => {
      window.webContents.send('output-data', {
        stdout: stdout,
        err: err ? err.message : err,
      });
    });

    createNotification(scriptNumber);
  });
};

const editItemClicked = () => {
  return;
};

const deleteItemClicked = () => {
  return;
};

const createNotification = (scriptNumber) => {
  const n = new Notification('Script ' + (scriptNumber + 1) + ' completed', {
    body: 'Finished in 1.0 seconds',
  });

  n.onclick = () => {
    focusOutputWindow();
  };
};

// Returns whether a new script item was successfully created
const onAddScript = () => {
  if (scripts.length >= scriptLimit) {
    const errorMessage = document.getElementById('add-script-error');
    errorMessage.style.display = 'initial';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 5000);
    return false;
  }

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

  return true;
};

const focusOutputWindow = () => {
  window.show();
  window.focus();
};

ipcRenderer.on('keyboard-shortcut-triggered', (event, data) => {
  runItemClicked(data.scriptNumber);
});

ipcRenderer.on('test-notification-clicked', () => {
  focusOutputWindow();
});
