/* eslint-disable no-undef */
editor.commands.addCommand({
  name: 'tabBetweenWriteAndEntity',
  bindKey: { win: 'Ctrl-Shift-E', mac: 'Command-Shift-E' },
  exec() {
    if (window.location.pathname.match(/app\/write/)) {
      window.location.href = '/app/prompts';
    }
    if (window.location.pathname.match(/app\/prompts/)) {
      window.location.href = '/app/write';
    }
  },
});
