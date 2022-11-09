const submit = document.querySelector('#submit');
const back = document.querySelector('#back');
const loading = document.querySelector('#loading');
const animationGraphic = document.querySelector('#animation-graphic');
const loadingBubble = document.querySelector('#loading-bubble');
const fileLink = document.querySelector('#url-file-link');
const importFile = document.querySelector('#import-file');
const waSave = document.querySelector('#wa-save');
const waPrompts = document.querySelector('#wa-prompts');
const waUndo = document.querySelector('#wa-undo');
const waRedo = document.querySelector('#wa-redo');
const waClear = document.querySelector('#wa-clear');
const waText = document.querySelectorAll('.wa-text');
const writeTip = document.querySelector('#write-tip');
if (navigator.platform.indexOf('Win') !== -1) {
  writeTip.innerHTML = 'Ctrl + Enter';
} else if (navigator.platform.indexOf('Mac') !== -1) {
  writeTip.innerHTML = 'Cmd + Enter';
}

const checkDisplay = () => {
  if (window.screen.width <= 640) {
    writeTip.style.display = 'none';
    waText.forEach((text) => {
      text.style.display = 'none';
    });
  } else {
    writeTip.style.display = 'block';
    waText.forEach((text) => {
      text.style.display = '';
    });
  }
};
window.addEventListener('resize', checkDisplay);
checkDisplay();

// eslint-disable-next-line no-undef
const editor = ace.edit('editor');
editor.setOption('wrap', true);
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/text');
editor.getSession().setTabSize(2);
document.getElementById('editor').style.fontSize = '14px';

const lastMode = localStorage.getItem('writeEditorSessionMode');
if (lastMode) {
  editor.getSession().setMode(lastMode);
}

const lastValue = localStorage.getItem('writeEditorSessionValue');
if (lastValue && lastValue.length) {
  editor.setValue(lastValue);
}

editor.on('change', () => {
  localStorage.setItem('writeEditorSessionValue', editor.getValue());
});

// A controller that selects response text
const selectResponse = (rawText) => {
  if (!rawText || !rawText.length) return;
  const value = editor.session.getValue();
  const text = rawText.match(/^.*\n.*\n([\s\S]*)$/)
    ? rawText.match(/^.*\n.*\n([\s\S]*)$/)[1]
    : null; // skip first two new lines
  if (text === null) return;
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

back.onclick = () => {
  window.location.href = '/';
};

const submitFunction = async () => {
  if (submit.disabled) return;
  submit.disabled = true;
  submit.style.display = 'none';
  editor.setReadOnly(true);
  loading.style.display = 'block';
  loadingBubble.style.display = 'block';
  animationGraphic.classList.remove('hidden');

  const selectedText = editor.getSelectedText();
  let prompt = '';
  if (selectedText.length) {
    prompt = selectedText;
  } else {
    prompt = editor.getValue();
  }

  // eslint-disable-next-line no-undef
  const data = await api.ai.prompt({ prompt });

  if (data) {
    editor.setValue(`${data.prompt || ''}${data.response || ''}`);
    selectResponse(data.response);
    submit.disabled = false;
    submit.style.display = 'block';
    loading.style.display = 'none';
    loadingBubble.style.display = 'none';
    animationGraphic.classList.add('hidden');
    editor.setReadOnly(false);
  } else {
    submit.disabled = false;
    submit.style.display = 'block';
    loading.style.display = 'none';
    loadingBubble.style.display = 'none';
    animationGraphic.classList.add('hidden');
    editor.setReadOnly(false);
  }
};

const savePrompt = async (prompt) => {
  // eslint-disable-next-line no-alert
  const name = window.prompt('name:') || new Date().toDateString();
  submit.disabled = true;
  submit.style.display = 'none';
  loading.style.display = 'block';
  loadingBubble.style.display = 'block';
  editor.setReadOnly(true);

  // eslint-disable-next-line no-undef
  const success = await api.entity.create({
    name,
    prompt,
  });

  if (success) {
    submit.disabled = false;
    submit.style.display = 'block';
    loading.style.display = 'none';
    loadingBubble.style.display = 'none';
    editor.setReadOnly(false);
    // eslint-disable-next-line no-alert
    alert('saved OK!');
  } else {
    submit.disabled = false;
    submit.style.display = 'block';
    loading.style.display = 'none';
    loadingBubble.style.display = 'none';
    editor.setReadOnly(false);
  }
};

editor.commands.addCommand({
  name: 'detectCommandEnter',
  bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
  exec() {
    submitFunction();
  },
});

const modes = ['text', 'javascript', 'json'];
let modeIndex = 0;
const nextMode = () => {
  modeIndex += 1;
  if (modeIndex > modes.length - 1) {
    modeIndex = 0;
  }
  return modes[modeIndex];
};

editor.commands.addCommand({
  name: 'detectCommandShiftEnter',
  bindKey: { win: 'Ctrl-Shift-Enter', mac: 'Command-Shift-Enter' },
  exec() {
    const mode = `ace/mode/${nextMode()}`;
    editor.getSession().setMode(mode);
    localStorage.setItem('writeEditorSessionMode', mode);
  },
});

editor.commands.addCommand({
  name: 'executeAsCode',
  bindKey: { win: 'Alt-Shift-Enter', mac: 'Option-Shift-Enter' },
  exec() {
    const selectedText = editor.getSelectedText();
    const allText = editor.session.getValue();
    const value = selectedText.length ? selectedText : allText;

    try {
      // eslint-disable-next-line no-eval
      window.eval(value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      // eslint-disable-next-line no-alert
      alert(`${error.message}`);
    }
  },
});

const getPromptText = () => {
  const selectedText = editor.getSelectedText();
  const allText = editor.session.getValue();
  const text = selectedText.length ? selectedText : allText;
  return text;
};

editor.commands.addCommand({
  name: 'savePromptAsEntity',
  bindKey: { win: 'Ctrl-Shift-S', mac: 'Command-Shift-S' },
  exec() {
    const prompt = getPromptText();
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (!confirm('Save prompt?')) return;
    savePrompt(prompt);
  },
});

submit.onclick = submitFunction;
waSave.onclick = () => {
  const prompt = getPromptText();
  // eslint-disable-next-line no-restricted-globals, no-alert
  if (!confirm('Save prompt?')) return;
  savePrompt(prompt);
};
waPrompts.onclick = () => {
  window.location.href = '/app/prompts';
};
waClear.onclick = () => {
  editor.setValue('');
};
waUndo.onclick = () => {
  editor.session.getUndoManager().undo();
};
waRedo.onclick = () => {
  editor.session.getUndoManager().redo();
};

importFile.onclick = async () => {
  const url = fileLink.value;

  if (!url.length) return;
  submit.disabled = true;
  submit.style.display = 'none';
  loading.style.display = 'block';
  loadingBubble.style.display = 'block';
  editor.setReadOnly(true);

  try {
    const { data } = await axios.get(url);
    editor.setValue(data);
    submit.disabled = false;
    submit.style.display = 'block';
    loading.style.display = 'none';
    loadingBubble.style.display = 'none';
    editor.setReadOnly(false);
  } catch (error) {
    submit.disabled = false;
    submit.style.display = 'block';
    loading.style.display = 'none';
    loadingBubble.style.display = 'none';
    editor.setReadOnly(false);
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-alert
    alert(`${error.message}`);
  }
};
