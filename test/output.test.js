const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const {app} = require('./application.js');

describe('Output window', () => {
  beforeEach(() => {
    return app.start().then(() => {
      app.client.waitUntilWindowLoaded().then(() => {
        app.electron.ipcRenderer.send('show-window');
        app.client.element('#script-button-1').click();
        app.electron.ipcRenderer.send('test-notification-clicked');
      });
    });
  });

  afterEach(() => {
    return app.stop();
  });

  it('Standard output text should be "hello"', () => {
    expect(app.client.getText('#stdout')).to.eventually.equal('hello');
    expect(app.client.getText('#stderr')).to.eventually.equal('');
  });
});
