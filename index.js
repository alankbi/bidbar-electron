const {ipcRenderer} = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const n = new Notification('First notification', {
    body: 'It works!',
  });

  n.onclick = () => {
    ipcRenderer.send('show-window');
  };

  for (let i = 0; i < 5; i++) {
    const container = document.getElementById('container');
    container.innerHTML += `<div class="script-${i}">Script ${i}</div>`;
  }
});
