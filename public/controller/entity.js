const submit = document.querySelector('#submit');
const back = document.querySelector('#back');
const loading = document.querySelector('#loading');

const userAccessToken = window.getCookie('userAccessToken');

// eslint-disable-next-line no-undef
const editor = ace.edit('editor');
editor.setOption('wrap', true);
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/text');
editor.getSession().setTabSize(2);
document.getElementById('editor').style.fontSize = '14px';

if (userAccessToken) {
  submit.style.display = 'block';
} else {
  submit.style.display = 'none';
}

back.onclick = () => {
  window.location = '/';
};

editor.commands.addCommand({
  name: 'detectCommandShiftEnter',
  bindKey: { win: 'Ctrl-Shift-Enter', mac: 'Command-Shift-Enter' },
  exec() {
    const lastValue = localStorage.getItem('writeEditorSessionValue');
    const selectedText = editor.getSelectedText();
    const value = selectedText.length ? selectedText : null;

    let updatedValue;
    if (value && lastValue) {
      updatedValue = `${lastValue}\n\n${value}`;
    }
    localStorage.setItem('writeEditorSessionValue', updatedValue);
    window.location.href = '/app/write';
  },
});

submit.onclick = async () => {
  submit.disabled = true;
  loading.style.display = 'block';

  const url = `${window.location.protocol}//${window.location.host}/api/v1/entity`;
  // eslint-disable-next-line no-undef
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      'x-app-event': 'entity-browser-app',
    },
  });

  const text = data.map(
    // eslint-disable-next-line no-undef
    (record) => `${record.name} - ${record.prompt}`,
  );

  editor.setValue(text.join('\n'));
  submit.disabled = false;
  loading.style.display = 'none';
};
