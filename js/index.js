const {ipcRenderer} = require('electron');

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
  const n = new Notification('Script ' + scriptNumber + ' completed', {
    body: 'Finished in 1.0 seconds',
  });

  n.onclick = () => {
    ipcRenderer.send('show-window');
  };
};

ipcRenderer.on('keyboard-shortcut-triggered', (event, data) => {
  scriptItemClicked(data.scriptNumber);
});
