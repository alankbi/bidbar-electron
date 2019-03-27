const {ipcRenderer} = require('electron');

let output;

ipcRenderer.on('output-data', (event, data) => {
  alert('ipc');
  output = data;
  document.getElementById('stdout').innerText = output.stdout;
  document.getElementById('stderr').innerText = output.stderr;
});

document.addEventListener('DOMContentLoaded', () => {
  // document.getElementById('stdout').innerText = output.stdout;
  // document.getElementById('stderr').innerText = output.stderr;
});
