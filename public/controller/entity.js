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
    if (value) {
      updatedValue = `${lastValue && lastValue.length ? lastValue : ''}\n\n${value}`;
    }
    localStorage.setItem('writeEditorSessionValue', updatedValue);
    window.location.href = '/app/write';
  },
});

const deleteEntity = async (id) => {
  const url = `${window.location.protocol}//${window.location.host}/api/v1/entity/${id}`;
  try {
    // eslint-disable-next-line no-undef
    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'x-app-event': 'entity-browser-app',
      },
    });
    // eslint-disable-next-line no-alert
    alert(`${id} deleted. please reload.`);
  } catch (error) {
    // eslint-disable-next-line no-alert
    alert(error.message);
  }
};

editor.commands.addCommand({
  name: 'deleteEntityById',
  bindKey: { win: 'Ctrl-Shift-D', mac: 'Command-Shift-D' },
  exec() {
    const selectedText = editor.getSelectedText();
    const id = selectedText.length ? selectedText : null;

    if (!id) return;
    // eslint-disable-next-line no-alert, no-restricted-globals
    if (!confirm(`Delete selected entity id ${id}?`)) return;
    submit.disabled = true;
    loading.style.display = 'block';

    deleteEntity(id);

    submit.disabled = false;
    loading.style.display = 'none';
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

  const text = data.reverse().map(
    // eslint-disable-next-line no-undef
    (record) => `\nid: ${record.id}\nname: ${record.name}\n\n${record.prompt}`,
  );

  editor.setValue(text.join('\n'));
  submit.disabled = false;
  loading.style.display = 'none';
};
