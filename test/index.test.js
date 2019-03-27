const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const {app} = require('./application.js');

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
    expect(app.browserWindow.isVisible()).to.eventually.be.true;
  });
});
