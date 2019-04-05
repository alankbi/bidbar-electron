const Store = require('electron-store');
const defaultText = '"Edit this script or add a new one below!"';
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
    maxItems: 5, // TODO: store paid status and make this infinity if paid
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

const onAddScript = () => {
  const title = document.getElementById('script-title');
  const cmd = document.getElementById('script-cmd');

  scriptStore.set('scripts', [
    ...scripts,
    {
      title: title.value,
      script: cmd.value,
    },
  ]);

  title.value = '';
  cmd.value = '';
};

document.addEventListener('DOMContentLoaded', () => {
  console.log(scripts);
  document.getElementById('add-script-button').addEventListener('click', () => {
    onAddScript();
  });
});

module.exports = {
  scripts: scripts,
};
