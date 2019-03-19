const {ipcRenderer} = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const n = new Notification('First notification', {
    body: 'It works!',
  });

  n.onclick = () => {
    ipcRenderer.send('show-window');
  };
});
