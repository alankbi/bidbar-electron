const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const {app} = require('./application.js');
const main = require('../main');

describe('Main script', () => {
  beforeEach(() => {
    return app.start();
  });

  afterEach(() => {
    return app.stop();
  });

  it('Ensure display is initialized', () => {
    expect(app.browserWindow.isVisible()).to.eventually.be.false;
  });

  it('Window should be toggled open', () => {
    app.electron.ipcRenderer.send('show-window');
    expect(app.browserWindow.isVisible()).to.eventually.be.true;
  });

  it('Menu should be centered with tray icon', () => {
    main.initializeDisplays();
    main.toggleWindow();

    const tray = main.getTray().getBounds();
    const window = main.getWindow().getBounds();

    expect(Math.round(window.x + window.width / 2) ===
      Math.round(tray.x + tray.width / 2)).to.be.true;
  });
});
