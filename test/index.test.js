const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const {app} = require('./application.js');

describe('Tray window', () => {
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

  it('Two windows should appear when script is clicked', () => {
    app.client.element('#script-button-1').click();

    // Tray window should still be in focus
    expect(app.browserWindow.getTitle()).to.eventually.equal('Bidbar');
    expect(app.client.getWindowCount()).to.eventually.equal(2);
  });

  it('Output window should be focused on notification clicked', () => {
    app.client.element('#script-button-1').click();
    app.electron.ipcRenderer.send('test-notification-clicked');

    expect(app.browserWindow.getTitle()).to.eventually.equal('Script Output');
  });
});
