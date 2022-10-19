const submit = document.querySelector('#submit');
const back = document.querySelector('#back');
const loading = document.querySelector('#loading');

const userAccessToken = window.getCookie('userAccessToken');

// eslint-disable-next-line no-undef
const editor = ace.edit('editor');
editor.setOption('wrap', true);
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/yaml');
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

submit.onclick = async () => {
  submit.disabled = true;
  loading.style.display = 'block';

  const url = `${window.location.protocol}//${window.location.host}/admin/v1/audit`;
  // eslint-disable-next-line no-undef
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      'x-app-event': 'history-browser-app',
    },
  });

  const historyText = data.map(
    // eslint-disable-next-line no-undef
    (record) => `${record.event} - ⏱️ ${moment(record.createdAt).format('MMM Do YY, h:mm:ss a')}`,
  );

  editor.setValue(historyText.join('\n'));
  submit.disabled = false;
  loading.style.display = 'none';
};
