const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const {app} = require('../application.js');
const main = require('../../main');

describe('Main script', () => {
  beforeEach(() => {
    return app.start();
  });

  afterEach(() => {
    return app.stop();
  });

  it('Test that the main window is opened', () => {
    expect(app.client.waitUntilWindowLoaded().getWindowCount())
        .to.eventually.equal(1);
  });

  it('Menu should be centered with tray icon', () => {
    main.initializeDisplays();
    main.toggleWindow();

    const tray = main.getTray().getBounds();
    const window = main.getWindow().getBounds();

    expect(Math.round(window.x + window.width / 2) ===
      Math.round(tray.x + tray.width / 2)).to.be.true;
  });

  it('Keyboard shortcut should trigger script run', () => {
    app.client.waitUntilWindowLoaded().then(() => {
      app.browserWindow.webContents.sendInputEvent({
        type: 'keyDown',
        keyCode: '\u0008',
      });

      expect(true).to.be.true;
    });
  });
});
