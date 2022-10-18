const user = document.querySelector('#user');
const userPicture = document.querySelector('#user-image');
const login = document.querySelector('#login');
const logout = document.querySelector('#logout');
const talk = document.querySelector('#talk');
const build = document.querySelector('#build');
const interactionOptions = document.querySelector('#interaction-options');
const displayName = window.getCookie('userDisplayName');
const userPictureUrl = window.getCookie('userPicture');

if (displayName) {
  interactionOptions.style.display = 'flex';
  user.innerHTML = displayName;
  logout.style.display = 'block';
  login.style.display = 'none';
} else {
  interactionOptions.style.display = 'none';
  user.remove();
  logout.style.display = 'none';
  login.style.display = 'block';
}

if (userPictureUrl) {
  userPicture.src = userPictureUrl;
} else {
  userPicture.remove();
}

login.onclick = function () {
  window.location = '/auth';
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
