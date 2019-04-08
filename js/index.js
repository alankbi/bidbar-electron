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
      container.appendChild(createScriptItemHTML(scripts.length - 1));
      attachScriptsToItem(scripts.length - 1);
    }
  });
});

const createScriptItemHTML = (scriptNumber) => {
  let scriptItem = document.createElement('div');
  scriptItem.innerHTML =
    `<div class="script-container" id="script-container-${scriptNumber}">
      <h3 id="script-${scriptNumber}-header">Script ${scriptNumber + 1}</h3>

      <input type="text" id="script-${scriptNumber}-title" 
        value="${scripts[scriptNumber].title}" readonly>
      
      <input type="text" id="script-${scriptNumber}-command" 
        value="${scripts[scriptNumber].script}" readonly>

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

const editItemClicked = (scriptNumber) => {
  const button = document.getElementById('edit-button-' + scriptNumber);
  const title = document.getElementById('script-' + scriptNumber + '-title');
  const script = document.getElementById('script-' + scriptNumber + '-command');

  if (button.innerText === 'Edit') {
    button.innerText = 'Save';
    title.readOnly = false;
    script.readOnly = false;
  } else {
    button.innerText = 'Edit';
    scripts[scriptNumber].title = title.value;
    scripts[scriptNumber].script = script.value;
    scriptStore.set('scripts', scripts);

    title.readOnly = true;
    script.readOnly = true;
  }
};

// Possible TODO: replace with template strings to make it more
// obviously matched with the HTML and thus more readable
const deleteItemClicked = (scriptNumber) => {
  scripts.splice(scriptNumber, 1);
  scriptStore.set('scripts', scripts);

  const first = document.getElementById('script-container-' + scriptNumber);
  first.parentNode.removeChild(first);

  // Fix the script numbers that are shifted due to the removal
  for (let i = scriptNumber; i < scripts.length; i++) {
    const prefix = 'script-' + (i + 1) + '-';
    const suffix = '-button-' + (i + 1);

    const header = document.getElementById(prefix + 'header');
    header.id = 'script-' + i + '-header';
    header.innerHTML = 'Script ' + (i + 1);

    const title = document.getElementById(prefix + 'title');
    title.id = 'script-' + i + '-title';
    // title.value = scripts[i].title;

    const command = document.getElementById(prefix + 'command');
    command.id = 'script-' + i + '-command';
    // command.value = scripts[i].script;

    document.getElementById('run' + suffix).id = 'run-button-' + i;
    document.getElementById('edit' + suffix).id = 'edit-button-' + i;
    document.getElementById('delete' + suffix).id = 'delete-button-' + i;

    const container = document.getElementById('script-container-' + (i + 1));
    container.id = 'script-container-' + i;
    container.outerHTML = container.outerHTML; // Clear old event listeners

    attachScriptsToItem(i);
  }
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

  scripts.push({
    title: title.value,
    script: cmd.value,
  });

  scriptStore.set('scripts', scripts);

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
