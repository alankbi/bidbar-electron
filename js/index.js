const {ipcRenderer} = require('electron');
const {defaultText, scripts, scriptStore, scriptLimit} = require('./data.js');
const {runScript} = require('./scriptHelper.js');

const errorMessages = {
  emptyValueError: 'Please enter a value for the script title and command.',
  scriptLimitError: 'You have reached your limit of 5 scripts. Please ' +
    'upgrade to the pro version ($5) to gain unlimited scripts.',
};

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
    `<div class="script-container row" id="script-container-${scriptNumber}">
      <div class="left">
        <h3 id="script-${scriptNumber}-header" class="script-header">
          ${scriptNumber + 1}. </h3>

        <input type="text" id="script-${scriptNumber}-title"
          class="script-title"value="${scripts[scriptNumber].title}">
        
        <textarea id="script-${scriptNumber}-command" 
          class="script-command">${scripts[scriptNumber].script}</textarea><br>
      </div>

      <div class="script-buttons right" id="script-${scriptNumber}-buttons">
        <button class="run-script-button script-button"
          id="run-button-${scriptNumber}">Run</button><br>

        <button class="delete-script-button script-button"
          id="delete-button-${scriptNumber}">Delete</button><br>
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
  const cmd = document.getElementById('script-' + scriptNumber + '-command');
  cmd.addEventListener('input', () => {
    itemEdited(scriptNumber);
  });

  document.getElementById('delete' + suffix).addEventListener('click', () => {
    deleteItemClicked(scriptNumber);
  });
};

const runItemClicked = (scriptNumber) => {
  runScript(scriptNumber);
};

const itemEdited = (scriptNumber) => {
  const title = document.getElementById('script-' + scriptNumber + '-title');
  const cmd = document.getElementById('script-' + scriptNumber + '-command');

  if (!title.value || !cmd.value) {
    displayAddError(errorMessages.emptyValueError);
    return;
  }
  scripts[scriptNumber].title = title.value;
  scripts[scriptNumber].script = cmd.value;
  scriptStore.set('scripts', scripts);
};

const deleteItemClicked = (scriptNumber) => {
  if (scripts.length === 1) {
    setItem(scriptNumber, defaultText, 'echo ' + defaultText);
    return;
  }
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
    header.innerHTML = (i + 1) + '. ';

    const title = document.getElementById(prefix + 'title');
    title.id = 'script-' + i + '-title';

    const command = document.getElementById(prefix + 'command');
    command.id = 'script-' + i + '-command';

    document.getElementById('script-' + (scriptNumber + 1) + '-buttons').id =
      'script-' + scriptNumber + '-buttons';

    document.getElementById('run' + suffix).id = 'run-button-' + i;
    document.getElementById('delete' + suffix).id = 'delete-button-' + i;

    const container = document.getElementById('script-container-' + (i + 1));
    container.id = 'script-container-' + i;
    container.outerHTML = container.outerHTML; // Clear old event listeners

    attachScriptsToItem(i);
  }

  ipcRenderer.send('script-item-deleted');
};

const setItem = (scriptNumber, titleText, scriptText) => {
  const title = document.getElementById('script-' + scriptNumber + '-title');
  const script = document.getElementById('script-' + scriptNumber + '-command');

  title.value = titleText;
  script.value = scriptText;
  scripts[scriptNumber].title = titleText;
  scripts[scriptNumber].script = scriptText;
  scriptStore.set('scripts', scripts);
};

// Returns whether a new script item was successfully created
const onAddScript = () => {
  if (scripts.length >= scriptLimit) {
    displayAddError(errorMessages.scriptLimitError);
    return false;
  }

  const title = document.getElementById('script-title');
  const cmd = document.getElementById('script-command');

  if (!title.value || !cmd.value) {
    displayAddError(errorMessages.emptyValueError);
    return false;
  }

  scripts.push({
    title: title.value,
    script: cmd.value,
  });

  scriptStore.set('scripts', scripts);

  title.value = '';
  cmd.value = '';

  ipcRenderer.send('script-item-added');

  return true;
};

const displayAddError = (errorMessage) => {
  const errorElement = document.getElementById('error');
  errorElement.innerHTML = errorMessage;
  errorElement.style.display = 'block';
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
};
