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

editor.commands.addCommand({
  name: 'detectCommandEnter',
  bindKey: { win: 'Ctrl-Shift-O', mac: 'Command-Shift-O' },
  exec() {
    const url = editor.getSelectedText();

    if (url.length) {
      window.location.href = url;
    }
  },
});

if (!userAccessToken) {
  window.location.href = '/';
}

back.onclick = () => {
  window.location = '/';
};

const loadTags = async () => {
  loading.style.display = 'block';

  const url = `${window.location.protocol}//${window.location.host}/api/v1/tag`;
  // eslint-disable-next-line no-undef
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      'x-app-event': 'tag-browser-app',
    },
  });

  const text = data.reverse().map(
    // eslint-disable-next-line no-undef
    (record) => {
      const tagUrl = `${window.location.protocol}//${window.location.host}/completions/${record.slug}`;
      return `${record.id}: ${record.slug}\n${tagUrl}\n`;
    },
  );

  editor.setValue(text.join('\n'));
  loading.style.display = 'none';
};

loadTags();
