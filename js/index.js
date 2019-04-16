const {ipcRenderer} = require('electron');
const {defaultText, scriptStore, scriptLimit} = require('./data.js');
const {runScript} = require('./scriptHelper.js');

const errorMessages = {
  emptyValueError: 'Please enter a value for the script title and command.',
  scriptLimitError: 'You have reached your limit of 5 scripts. Please ' +
    'upgrade to the pro version ($5) to gain unlimited scripts.',
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');

  // Add script items to page
  for (let i = 0; i < scriptStore.get('scripts').length; i++) {
    container.appendChild(createScriptItemHTML(i));
    attachScriptsToItem(i);
  }

  document.getElementById('add-script-button').addEventListener('click', () => {
    onAddScript();
  });
});

const createScriptItemHTML = (scriptNumber) => {
  let scriptItem = document.createElement('div');
  const scripts = scriptStore.get('scripts');
  scriptItem.innerHTML =
    `<div class="row">
    <div class="script-container row l1" id="script-container-${scriptNumber}">
      <div class="left">
        <h3 id="script-${scriptNumber}-header" class="script-header">
          ${scriptNumber + 1}. </h3>

        <input type="text" id="script-${scriptNumber}-title" placeholder="Title"
          class="script-title" value="${scripts[scriptNumber].title}">
        
        <textarea id="script-${scriptNumber}-command" placeholder="Command"
          class="script-command">${scripts[scriptNumber].script}</textarea><br>
      </div>

      <div class="script-buttons right" id="script-${scriptNumber}-buttons">
        <button class="run-script-button script-button"
          id="run-button-${scriptNumber}">Run</button><br>

        <button class="delete-script-button script-button"
          id="delete-button-${scriptNumber}">Delete</button><br>
      </div>
    </div>

    <div class="arrow-buttons r1" id="arrow-buttons-${scriptNumber}">
      <button class="arrow-button up" id="arrow-up-button-${scriptNumber}">
        <img src="../assets/arrow_up.svg" alt="Up">
      </button>
      <button class="arrow-button" id="arrow-down-button-${scriptNumber}">
        <img src="../assets/arrow_down.svg" alt="Up">
      </button>
    </div>
    </div>`;

  scriptItem = scriptItem.firstChild;
  return scriptItem;
};

const attachScriptsToItem = (scriptNumber) => {
  const suffix = '-button-' + scriptNumber;
  document.getElementById('run' + suffix).addEventListener('click', () => {
    runItemClicked(scriptNumber);
  });

  const title = document.getElementById('script-' + scriptNumber + '-title');
  title.addEventListener('input', () => {
    itemEdited(scriptNumber);
  });
  title.addEventListener('focusout', () => {
    itemLosesFocus(scriptNumber);
  });

  const cmd = document.getElementById('script-' + scriptNumber + '-command');
  cmd.addEventListener('input', () => {
    itemEdited(scriptNumber);
  });
  cmd.addEventListener('blur', () => {
    itemLosesFocus(scriptNumber);
  });

  document.getElementById('delete' + suffix).addEventListener('click', () => {
    deleteItemClicked(scriptNumber);
  });

  const up = document.getElementById('arrow-up-button-' + scriptNumber);
  up.addEventListener('click', () => {
    swapItems(scriptNumber - 1, scriptNumber);
  });

  const down = document.getElementById('arrow-down-button-' + scriptNumber);
  down.addEventListener('click', () => {
    swapItems(scriptNumber, scriptNumber + 1);
  });
};

const runItemClicked = (scriptNumber) => {
  runScript(scriptNumber);
};

const itemEdited = (scriptNumber) => {
  const title = document.getElementById('script-' + scriptNumber + '-title');
  const cmd = document.getElementById('script-' + scriptNumber + '-command');

  const scripts = scriptStore.get('scripts');
  scripts[scriptNumber].title = title.value;
  scripts[scriptNumber].script = cmd.value;
  scriptStore.set('scripts', scripts);
};

const itemLosesFocus = (scriptNumber) => {
  const title = document.getElementById('script-' + scriptNumber + '-title');
  const cmd = document.getElementById('script-' + scriptNumber + '-command');

  if (!title.value && !cmd.value) {
    deleteItemClicked(scriptNumber);
  }
};

const deleteItemClicked = (scriptNumber) => {
  const scripts = scriptStore.get('scripts');
  if (scripts.length === 1) {
    setItem(scriptNumber, defaultText, 'echo ' + defaultText);
    return;
  }
  scripts.splice(scriptNumber, 1);
  scriptStore.set('scripts', scripts);

  const last = document.getElementById('script-container-' + scripts.length);
  last.parentNode.removeChild(last);
  const lastArrows = document.getElementById('arrow-buttons-' + scripts.length);
  lastArrows.parentNode.removeChild(lastArrows);

  for (let i = scriptNumber; i < scriptStore.get('scripts').length; i++) {
    const command = document.getElementById('script-' + i + '-command');
    const title = document.getElementById('script-' + i + '-title');
    title.value = scriptStore.get('scripts')[i].title;
    command.value = scriptStore.get('scripts')[i].script;
  }

  ipcRenderer.send('script-item-deleted');
};

const swapItems = (first, second) => {
  const scripts = scriptStore.get('scripts');
  if (first < 0 || second >= scripts.length) {
    return;
  }

  [scripts[first], scripts[second]] = [scripts[second], scripts[first]];
  scriptStore.set('scripts', scripts);

  let title = document.getElementById('script-' + first + '-title');
  let script = document.getElementById('script-' + first + '-command');
  title.value = scripts[first].title;
  script.value = scripts[first].script;

  title = document.getElementById('script-' + second + '-title');
  script = document.getElementById('script-' + second + '-command');
  title.value = scripts[second].title;
  script.value = scripts[second].script;
};

const setItem = (scriptNumber, titleText, scriptText) => {
  const title = document.getElementById('script-' + scriptNumber + '-title');
  const script = document.getElementById('script-' + scriptNumber + '-command');

  title.value = titleText;
  script.value = scriptText;

  const scripts = scriptStore.get('scripts');
  scripts[scriptNumber].title = titleText;
  scripts[scriptNumber].script = scriptText;
  scriptStore.set('scripts', scripts);
};

// Returns whether a new script item was successfully created
const onAddScript = () => {
  const scripts = scriptStore.get('scripts');
  if (scripts.length >= scriptLimit) {
    displayAddError(errorMessages.scriptLimitError);
    return false;
  }

  scripts.push({
    title: '',
    script: '',
  });
  scriptStore.set('scripts', scripts);

  const container = document.getElementById('container');

  container.appendChild(createScriptItemHTML(scripts.length - 1));
  attachScriptsToItem(scripts.length - 1);
  document.getElementById('script-' + (scripts.length - 1) + '-title').focus();

  ipcRenderer.send('script-item-added');
};

const displayAddError = (errorMessage) => {
  const errorElement = document.getElementById('error');
  errorElement.innerHTML = errorMessage;
  errorElement.style.display = 'block';
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
};
