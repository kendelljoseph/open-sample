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

if (!userAccessToken) {
  window.location.href = '/';
}

back.onclick = () => {
  window.location = '/';
};

const loadAdminEvents = async () => {
  loading.style.display = 'block';

  const url = `${window.location.protocol}//${window.location.host}/admin/v1/route-error`;
  // eslint-disable-next-line no-undef
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      'x-app-event': 'admin-browser-app',
    },
  });

  const text = data.map(
    // eslint-disable-next-line no-undef
    (record) => `${record.statusCode}: ${record.event} - ${record.message}`,
  );

  editor.setValue(text.join('\n'));
  loading.style.display = 'none';
};

loadAdminEvents();
