const back = document.querySelector('#back');
const loading = document.querySelector('#loading');

// eslint-disable-next-line no-undef
const editor = ace.edit('editor');
editor.setOption('wrap', true);
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/yaml');
editor.getSession().setTabSize(2);
document.getElementById('editor').style.fontSize = '14px';

back.onclick = () => {
  window.location = '/';
};

const loadAdminEvents = async () => {
  loading.style.display = 'block';
  // eslint-disable-next-line no-undef
  const data = await api.admin.routeError();
  const text = data.map(
    // eslint-disable-next-line no-undef
    (record) => `${record.statusCode}: ${record.event} - ${record.message}`,
  );

  editor.setValue(text.join('\n'));
  loading.style.display = 'none';
};

loadAdminEvents();
