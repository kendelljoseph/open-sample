/* eslint-disable no-undef */
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

const savePrompt = async (prompt) => {
  submit.disabled = true;
  loading.style.display = 'block';
  loadingBubble.style.display = 'block';
  editor.setReadOnly(true);
  try {
    const url = `${window.location.protocol}//${window.location.host}/api/v1/entity`;
    await axios.post(
      url,
      {
        name: new Date().toDateString(),
        prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          'x-app-event': 'save-prompt',
        },
      },
    );

    submit.disabled = false;
    loading.style.display = 'none';
    loadingBubble.style.display = 'none';
    editor.setReadOnly(false);
    // eslint-disable-next-line no-alert
    alert('saved OK!');
  } catch (error) {
    submit.disabled = false;
    loading.style.display = 'none';
    loadingBubble.style.display = 'none';
    editor.setReadOnly(false);
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-alert
    alert(`${error.message}`);
  }
};

editor.commands.addCommand({
  name: 'savePromptAsEntity',
  bindKey: { win: 'Ctrl-Shift-S', mac: 'Command-Shift-S' },
  exec() {
    const selectedText = editor.getSelectedText();
    const allText = editor.session.getValue();
    const prompt = selectedText.length ? selectedText : allText;

    savePrompt(prompt);
  },
});
