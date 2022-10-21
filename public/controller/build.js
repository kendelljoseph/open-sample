const submit = document.querySelector('#submit');
const back = document.querySelector('#back');
const loading = document.querySelector('#loading');

const userAccessToken = window.getCookie('userAccessToken');

// eslint-disable-next-line no-undef
const editor = ace.edit('editor');
editor.setOption('wrap', true);
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/javascript');
editor.getSession().setTabSize(2);
document.getElementById('editor').style.fontSize = '14px';

// A controller that selects response text
const selectResponse = (rawText) => {
  if (!rawText || !rawText.length) return;
  const value = editor.session.getValue();
  const text = rawText.match(/^.*\n.*\n([\s\S]*)$/)[1]; // skip first two new lines
  const startRow = value.substr(0, value.indexOf(text)).split(/\r\n|\r|\n/).length - 1;
  const startCol = editor.session.getLine(startRow).indexOf(text);
  const endRowOffset = text.split(/\r\n|\r|\n/).length;
  const endRow = startRow + endRowOffset - 1;
  const endCollOffset = text.split(/\r\n|\r|\n/)[endRowOffset - 1].length;
  const endCol = startCol + (endCollOffset > 1 ? endCollOffset + 1 : endCollOffset);

  const Range = editor.getSelectionRange().constructor;
  // eslint-disable-next-line no-undef
  const range = new Range(startRow, startCol, endRow, endCol);

  editor.session.selection.setRange(range);
  editor.scrollToLine(startRow, true, true, () => {});
};

if (userAccessToken) {
  submit.style.display = 'block';
} else {
  submit.style.display = 'none';
}

back.onclick = () => {
  window.location = '/';
};

const submitFunction = async () => {
  submit.disabled = true;
  loading.style.display = 'block';
  editor.setReadOnly(true);

  const selectedText = editor.getSelectedText();
  let prompt = '';
  if (selectedText.length) {
    prompt = selectedText;
  } else {
    prompt = editor.getValue();
  }
  const aiUrl = `${window.location.protocol}//${window.location.host}/api/v1/ai/code`;
  // eslint-disable-next-line no-undef
  const { data } = await axios.post(
    aiUrl,
    {
      prompt,
    },
    {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'x-app-event': 'build-browser-app',
      },
    },
  );
  editor.setValue(`${data.prompt || ''}${data.response || ''}`);
  selectResponse(data.response);
  submit.disabled = false;
  loading.style.display = 'none';
  editor.setReadOnly(false);
};

editor.commands.addCommand({
  name: 'detectCommandEnter',
  bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
  exec(editor) {
    console.log('User pressed Command-Enter');
    submitFunction();
  },
});

submit.onclick = submitFunction;
