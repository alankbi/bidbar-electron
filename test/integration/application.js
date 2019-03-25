const {Application} = require('spectron');
const path = require('path');

const appPath = path.join(__dirname, '../../');
let electronPath = path.join(__dirname, '../../node_modules/.bin/electron');
if (process.platform === 'win32') {
  electronPath += '.cmd';
}

module.exports = {
  'app': new Application({
    path: electronPath,
    args: [appPath],
  }),
};
