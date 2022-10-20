const submit = document.querySelector('#submit');
const back = document.querySelector('#back');
const loading = document.querySelector('#loading');

const appPhoneNumberSpan = document.querySelector('#appPhoneNumber');
const phoneNumberInput = document.querySelector('#phoneNumber');
const validationCodeInput = document.querySelector('#validationCode');
const validationError = document.querySelector('#validationError');

const userAccessToken = window.getCookie('userAccessToken');
const appPhoneNumber = window.getCookie('appPhoneNumber');
const displayName = window.getCookie('userDisplayName');

if (userAccessToken) {
  back.style.display = 'block';
  submit.style.display = 'block';
  validationCodeInput.style.display = 'none';
  validationError.style.display = 'none';
  appPhoneNumberSpan.innerHTML = appPhoneNumber;
} else {
  submit.style.display = 'none';
}

back.onclick = () => {
  window.location = '/';
};

submit.onclick = async () => {
  submit.disabled = true;
  loading.style.display = 'block';
  validationCodeInput.style.display = 'none';
  validationError.style.display = 'none';
  validationCodeInput.value = '';

  const user = {
    friendlyName: displayName,
    phoneNumber: phoneNumberInput.value,
  };

  const url = `${window.location.protocol}//${window.location.host}/api/v1/verify`;
  try {
    // eslint-disable-next-line no-undef
    const { data } = await axios.post(url, user, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'x-app-event': 'user-web-profile',
      },
    });

    if (data.message) {
      validationError.innerHTML = data.message;
      validationError.style.display = 'block';
    } else {
      validationCodeInput.style.display = 'block';
      validationCodeInput.value = data.validationCode;
    }
  } catch (error) {
    validationError.innerHTML = error.message;
  }

  submit.disabled = false;
  loading.style.display = 'none';
};
