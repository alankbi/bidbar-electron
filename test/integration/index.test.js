const {Application} = require('spectron');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const appPath = path.join(__dirname, '../../');
let electronPath = path.join(__dirname, '../../node_modules/.bin/electron');
if (process.platform === 'win32') {
  electronPath += '.cmd';
}

const app = new Application({
  path: electronPath,
  args: [appPath],
});

describe('Menu bar window', () => {
  beforeEach(() => {
    return app.start().then(() => {
      app.client.waitUntilWindowLoaded().then(() => {
        app.electron.ipcRenderer.send('show-window');
      });
    });
  });

  afterEach(() => {
    return app.stop();
  });

  it('Menu should be open', () => {
    expect(app.browserWindow.isVisible()).eventually.to.be.true;
  });
});
