const {ipcRenderer} = require('electron');

ipcRenderer.on('output-data', (event, data) => {
  if (data.stdout) {
    document.getElementById('stdout').innerText = data.stdout;
    document.getElementById('stdout-header').style.display = 'initial';
  }
  if (data.err) {
    document.getElementById('err').innerText = data.err;
    document.getElementById('err-header').style.display = 'initial';
  }
});
