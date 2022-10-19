const profile = document.querySelector('#profile');
const user = document.querySelector('#user');
const userPicture = document.querySelector('#user-image');
const login = document.querySelector('#login');
const logout = document.querySelector('#logout');
const talk = document.querySelector('#talk');
const build = document.querySelector('#build');
const history = document.querySelector('#history');
const admin = document.querySelector('#admin');
const entities = document.querySelector('#entities');
const github = document.querySelector('#github');
const interactionOptions = document.querySelector('#interaction-options');
const displayName = window.getCookie('userDisplayName');
const userPictureUrl = window.getCookie('userPicture');

if (displayName) {
  profile.style.display = 'flex';
  interactionOptions.style.display = 'flex';
  user.innerHTML = displayName;
  logout.style.display = 'block';

  login.style.display = 'none';
} else {
  profile.style.display = 'none';
  interactionOptions.style.display = 'none';
  logout.style.display = 'none';

  login.style.display = 'block';
}

if (userPictureUrl) {
  userPicture.src = userPictureUrl;
} else {
  userPicture.remove();
}

github.onclick = function () {
  window.open('https://kendelljoseph.github.io/open-source/');
};
login.onclick = function () {
  window.location = '/auth';
};
history.onclick = function () {
  window.location = '/app/history';
};
entities.onclick = function () {
  window.location = '/app/entity';
};
admin.onclick = function () {
  window.location = '/app/admin';
};
profile.onclick = function () {
  window.location = '/app/profile';
};
talk.onclick = function () {
  window.location = '/app/talk';
};
build.onclick = function () {
  window.location = '/app/build';
};
logout.onclick = function () {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
  window.location.reload();
};
