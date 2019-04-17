const {shell} = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  Array.from(document.getElementsByClassName('link')).forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      shell.openExternal(e.target.href);
    });
  });
});
