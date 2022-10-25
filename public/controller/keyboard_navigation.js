// eslint-disable-next-line no-undef
editor.commands.addCommand({
  name: 'tabBetweenWriteAndEntity',
  bindKey: { win: 'Ctrl-Shift-E', mac: 'Command-Shift-E' },
  exec() {
    if (window.location.pathname.match(/app\/write/)) {
      window.location.href = '/app/entity';
    }
    if (window.location.pathname.match(/app\/entity/)) {
      window.location.href = '/app/write';
    }
  },
});
