const profile = document.querySelector('#profile');
const user = document.querySelector('#user');
const userPicture = document.querySelector('#user-image');
const login = document.querySelector('#login');
const logout = document.querySelector('#logout');
// const write = document.querySelector('#write');
const wiring = document.querySelector('#wiring');
const build = document.querySelector('#build');
const github = document.querySelector('#github');
const donate = document.querySelector('#donate');
const interactionOptions = document.querySelector('#interaction-options');

// eslint-disable-next-line no-undef
if (userAccessToken) {
  profile.style.display = 'flex';
  interactionOptions.style.display = 'flex';
  // eslint-disable-next-line no-undef
  user.innerHTML = displayName;
  logout.style.display = 'block';
  login.style.display = 'none';
  // eslint-disable-next-line no-undef
  userPicture.src = userPictureUrl;
} else {
  profile.style.display = 'none';
  interactionOptions.style.display = 'none';
  logout.style.display = 'none';
  login.style.display = 'block';
  userPicture.remove();
}

donate.onclick = () => {
  window.open('https://donate.stripe.com/9AQ8xnaLGcMbgj66oo');
};
github.onclick = () => {
  window.open('https://kendelljoseph.github.io/open-source/');
};
login.onclick = () => {
  window.location = '/auth';
};
// write.onclick = () => {
//   window.location = '/app/write';
// };
wiring.onclick = () => {
  window.location = '/app/wiring';
};
build.onclick = () => {
  window.location = '/app/build';
};
logout.onclick = () => {
  sessionStorage.clear();
  localStorage.clear();
  document.cookie.split(';').forEach(
    // eslint-disable-next-line no-return-assign
    (c) => (document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)),
  );
  window.location.reload();
};
