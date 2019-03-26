const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const {app} = require('../application.js');

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
