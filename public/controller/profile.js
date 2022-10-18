const submit = document.querySelector('#submit');
const back = document.querySelector('#back');
const loading = document.querySelector('#loading');

const userId = window.getCookie('userId');
const userAccessToken = window.getCookie('userAccessToken');
const displayName = window.getCookie('userDisplayName');
const email = window.getCookie('userEmail');

// eslint-disable-next-line no-undef
const editor = ace.edit('editor');
editor.setOption('wrap', true);
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/json');
editor.getSession().setTabSize(2);
document.getElementById('editor').style.fontSize = '14px';

const userData = {
  displayName,
  email,
  phoneNumber: '',
};
editor.setValue(JSON.stringify(userData, null, '\t'));

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

  const profileJson = editor.getValue();

  // Try/Catch convert to JSON
  let user = {};
  if (profileJson.length) {
    try {
      user = JSON.parse(profileJson);
      user.id = userId;
    } catch (error) {
      console.error(error);
      submit.disabled = false;
      loading.style.display = 'none';
      return;
    }
  } else {
    submit.disabled = false;
    loading.style.display = 'none';
    return;
  }

  const url = `${window.location.protocol}//${window.location.host}/api/v1/user/${user.id}`;
  try {
    // eslint-disable-next-line no-undef
    const { data } = await axios.put(url, user, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'x-app-event': 'user-web-profile',
      },
    });
    editor.setValue(JSON.stringify(data, null, '\t'));
  } catch (error) {
    console.error(error);
  }

  submit.disabled = false;
  loading.style.display = 'none';
};
