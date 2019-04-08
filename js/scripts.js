const Store = require('electron-store');
const defaultText = '"Edit this script or add a new one below!"';

const scriptLimit = 5; // TODO: store paid status and make this infinity if paid

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

const scripts = scriptStore.get('scripts');

module.exports = {
  scriptStore: scriptStore,
  scripts: scripts,
  scriptLimit: scriptLimit,
};
