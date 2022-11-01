const submit = document.querySelector('#edit-sample');

const activeTag = window.getCookie('activeTag');
const userAccessToken = window.getCookie('userAccessToken');

// eslint-disable-next-line no-undef
const editor = ace.edit('editor');
editor.setReadOnly(true);
editor.setOption('wrap', true);
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/text');
editor.getSession().setTabSize(2);
document.getElementById('editor').style.fontSize = '14px';

const submitFunction = async () => {
  try {
    const url = `${window.location.protocol}//${window.location.host}/api/v1/entity/${activeTag}`;
    // eslint-disable-next-line no-undef
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'x-app-event': 'completion-entity-browser-app',
      },
    });

    const editorText = data.map(({ prompt }) => prompt).join('\n');
    localStorage.setItem('tagCompletionText', editorText);
    editor.setValue(editorText);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-alert
    alert(`${error.message}`);
  }
};

if (userAccessToken) {
  submitFunction();
} else {
  window.location.href = '/auth';
}

submit.onclick = () => {
  const newWriteEditorValue = localStorage.getItem('tagCompletionText');
  localStorage.setItem('writeEditorSessionValue', newWriteEditorValue);
  window.location.href = '/app/write';
};
