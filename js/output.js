const {ipcRenderer} = require('electron');

let output;

ipcRenderer.on('output-data', (event, data) => {
  output = data;
  document.getElementById('stdout').innerText = output.stdout;
  document.getElementById('err').innerText = output.err;
});
