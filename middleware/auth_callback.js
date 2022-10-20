import { Authn } from '../models/record/index.js';
import enqueue from '../lib/enqueue.js';
import { APP } from '../config/index.js';

const html = (user, accessToken, appPhoneNumber) => `
<!DOCTYPE html>
<html>
<head>
  <title>Authenticating</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Merriweather&display=swap');
    body {
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
      font-family: 'Merriweather', serif;
    }
    .user-image {
      width: 120px;
      margin-bottom: 30px;
      border-radius: 100%;
      animation-name: fade-in;
      animation-duration: 3s; 

    }
    .auth-text {
      font-family: 'Merriweather', serif;
      animation-name: bounce;
      animation-duration: 1s; 
      animation-fill-mode: both; 
    }
    .caption {
      margin-bottom: 20px;
      font-family: 'Merriweather', serif;
      font-size: 0.95em;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {transform: translateY(0); opacity: 1;} 
      40% {transform: translateY(-30px); opacity: 0.25;} 
      60% {transform: translateY(-15px); opacity: 1;} 
    }
  
    @keyframes fade-in {
      0% {opacity: 0; transform: translateY(-100px)} 
      100% {opacity: 1; transform: translateY(0)} 
    }
  </style>
</head>
<body>
  <img class="user-image" src="${user.picture}">
  <h1 class='auth-text'>✅ success!</h1>
  <hr size="1" width="300px" color="grey">  
  <p class="caption">...logging in as ${user.displayName}</p>
</body>
<script src='../js/cookies.js'></script>
<script>
  setCookie('userId', '${user.id}', 1);
  setCookie('userEmail', '${user.email}', 1);
  setCookie('userPicture', '${user.picture}', 1);
  setCookie('userDisplayName', '${user.displayName}', 1);
  setCookie('userAccessToken', '${accessToken}', 1);
  setCookie('appPhoneNumber', '${appPhoneNumber}', 1);
  setTimeout(() => {
    window.location='../../'
  }, 3200);
</script>
<script>
var circle = document.createElement('div');
circle.style.width = '100%';
circle.style.height = '50px';
circle.style.backgroundColor = 'green';
circle.style.position = 'absolute';
circle.style.top = '0px';
circle.style.left = '0px';
circle.style.transition = 'all 3.2s';
circle.style.opacity = '0.5';
document.body.appendChild(circle);
var countdown = document.createElement('div');
countdown.style.position = 'absolute';
countdown.style.top = '100px';
countdown.style.left = '0px';
countdown.style.width = '100%';
countdown.style.height = '50px';
countdown.style.backgroundColor = 'transparent';
countdown.style.color = 'black';
countdown.style.fontSize = '4em';
countdown.style.textAlign = 'center';
countdown.style.lineHeight = '50px';
countdown.innerHTML = '4';
document.body.appendChild(countdown);
setTimeout(function() {
  circle.style.top = '100%';
  circle.style.height = '0px';
  circle.style.opacity = '0';
  countdown.innerHTML = '3';
}, 1000);
setTimeout(function() {
  countdown.innerHTML = '2';
}, 2000);
setTimeout(function() {
  countdown.innerHTML = '1';
}, 3000);
setTimeout(function() {
  countdown.innerHTML = '0';
}, 4000);
</script>`;

export default () => async (req, res, next) => {
  const { user } = req;

  const authnRecord = await Authn.findOne({ where: { googleId: user.id } });

  const userAccessData = authnRecord.dataValues;
  const { accessToken } = userAccessData;
  const appPhoneNumber = APP.TWILIO_NUMBER;

  enqueue(
    'auth-callback',
    async () => {
      res.send(html(user, accessToken, appPhoneNumber));
    },
    next,
    '(🔑):auth-callback',
  );
};
