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

const loadHistory = async () => {
  loading.style.display = 'block';

  // eslint-disable-next-line no-undef
  const data = await api.admin.audit();
  const historyText = data.map(
    // eslint-disable-next-line no-undef
    (record) => `${record.event} - ⏱️ ${moment(record.createdAt).format('MMM Do YY, h:mm:ss a')}`,
  );

  editor.setValue(historyText.join('\n'));
  loading.style.display = 'none';
};

loadHistory();
