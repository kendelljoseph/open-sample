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
  back.style.display = 'block';
  submit.style.display = 'block';
} else {
  submit.style.display = 'none';
}

back.onclick = () => {
  window.location = '/';
};

submit.onclick = async () => {
  submit.disabled = true;
  loading.style.display = 'block';

  const selectedText = editor.getSelectedText();
  let prompt = '';
  if (selectedText.length) {
    prompt = selectedText;
  } else {
    prompt = editor.getValue();
  }

  const url = `${window.location.protocol}//${window.location.host}/api/v1/ai/prompt`;
  // eslint-disable-next-line no-undef
  const { data } = await axios.post(
    url,
    {
      prompt,
    },
    {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'x-app-event': 'write-ai-prompt-browser-app',
      },
    },
  );

  editor.setValue(
    `${data.prompt || ''}${
      data.response || "Oops, there was an error -- you shouldn't be seeing this!"
    }`,
  );
  submit.disabled = false;
  loading.style.display = 'none';
};
