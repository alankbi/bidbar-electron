const {BrowserWindow, Tray} = require('electron');
const chai = require('chai');
const expect = chai.expect;

const main = require('../../main');

describe('Main script', () => {
  it('Ensure display is intitialized', () => {
    main.initializeDisplays();

    expect(main.getWindow()).to.be.instanceOf(BrowserWindow);
    expect(main.getTray()).to.be.instanceOf(Tray);
  });

  it('Window should be toggled open', () => {
    main.initializeDisplays();
    main.toggleWindow();
    expect(main.getWindow().isVisible()).to.be.true;
  });
});
