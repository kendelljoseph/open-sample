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

  const url = `${window.location.protocol}//${window.location.host}/admin/v1/route-error`;
  // eslint-disable-next-line no-undef
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      'x-app-event': 'admin-browser-app',
    },
  });

  // "id": 5,
  // "method": "POST",
  // "path": "/api/v1/reflect/APb784e236938eacd5aaf9cb3b53943d7a",
  // "event": "custom-reflect-event",
  // "statusCode": 500,
  // "message": "\"Request failed with status code 401\"",
  // "token": null,
  // "createdAt": "2022-10-19T13:50:37.605Z",
  // "updatedAt": "2022-10-19T13:50:37.605Z"

  const text = data.map(
    // eslint-disable-next-line no-undef
    (record) => `${record.statusCode}: ${record.event} - ${record.message}`,
  );

  editor.setValue(text.join('\n'));
  submit.disabled = false;
  loading.style.display = 'none';
};
