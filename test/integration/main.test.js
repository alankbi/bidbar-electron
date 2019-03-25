const {Application} = require('spectron');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const {app} = require(path.join(__dirname, '../application.js'));
// const appPath = path.join(__dirname, '../../');
// let electronPath = path.join(__dirname, '../../node_modules/.bin/electron');
// if (process.platform === 'win32') {
//   electronPath += '.cmd';
// }

// const app = new Application({
//   path: electronPath,
//   args: [appPath],
// });

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

  it('Test that the title is empty', () => {
    expect(app.client.waitUntilWindowLoaded().getTitle())
        .to.eventually.equal('');
  });
});
