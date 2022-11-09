const submit = document.querySelector('#submit');
const back = document.querySelector('#back');
const loading = document.querySelector('#loading');

const appPhoneNumberSpan = document.querySelector('#appPhoneNumber');
const phoneNumberInput = document.querySelector('#phoneNumber');
const validationCodeInput = document.querySelector('#validationCode');
const validationError = document.querySelector('#validationError');

back.style.display = 'block';
submit.style.display = 'block';
validationCodeInput.style.display = 'none';
validationError.style.display = 'none';
// eslint-disable-next-line no-undef
appPhoneNumberSpan.innerHTML = appPhoneNumber;
// eslint-disable-next-line no-undef
phoneNumberInput.placeholder = userPhoneNumber === 'null' ? 'enter phone number' : userPhoneNumber;
// eslint-disable-next-line no-undef
if (userPhoneNumber !== 'null') {
  validationError.innerHTML = '🔒 profile is already validated OK.';
  validationError.style.display = 'block';
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
    // eslint-disable-next-line no-undef
    friendlyName: displayName,
    phoneNumber: phoneNumberInput.value,
  };

  // eslint-disable-next-line no-undef
  const data = await api.verify.profile(user);
  if (data.message) {
    validationError.innerHTML = data.message;
    validationError.style.display = 'block';
  } else {
    validationCodeInput.style.display = 'block';
    validationCodeInput.value = data.validationCode;
    phoneNumberInput.placeholder = data.phoneNumber;
    phoneNumberInput.value = data.phoneNumber;

    window.setCookie('userPhoneNumber', `${data.phoneNumber}`, 1);
  }

  submit.disabled = false;
  loading.style.display = 'none';
};
