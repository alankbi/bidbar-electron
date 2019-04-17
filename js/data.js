const Store = require('electron-store');
const defaultText = 'Add a script';

const scriptLimit = 99; // TODO: store paid status & make this infinite if paid

const schema = {
  scripts: {
    type: 'array',
    contains: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        script: {
          type: 'string',
        },
      },
      required: ['title', 'script'],
    },
    maxItems: scriptLimit,
    default: [{
      title: defaultText,
      script: 'echo ' + defaultText,
    }],
  },
};
const scriptStore = new Store({
  schema: schema,
  name: 'scripts',
});

module.exports = {
  defaultText: defaultText,
  scriptStore: scriptStore,
  scriptLimit: scriptLimit,
};
