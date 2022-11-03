import enqueue from '../lib/enqueue.js';

const html = (tag) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  
  <title>Open Sample</title>
  <meta name="title" content="Open Sample">
  <meta name="description" content="An open-source AI assisted API">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://open-sample.herokuapp.com/">
  <meta property="og:title" content="Open Sample">
  <meta property="og:description" content="An open-source AI assisted API">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://open-sample.herokuapp.com/">
  <meta property="twitter:title" content="Open Sample">
  <meta property="twitter:description" content="An open-source AI assisted API">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi" crossorigin="anonymous">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Merriweather&display=swap');
    body {
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: flex-start;
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
      margin-top: 100px;
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
    #editor { 
      position: absolute;
      top: 50px;
      right: 0;
      bottom: 0;
      left: 0;
    }
    #profile {
      position: absolute;
      top: 10px;
      right: 8px;
    }
    #animation-graphic {
      position: absolute;
      bottom: 10px;
      right: 10px;
      cursor: pointer;
      user-select: none;
      width: 70px;
      height: 70px;
      margin-bottom: 10px;
      border-radius: 100%;
      box-sizing: border-box;
      box-shadow: 0 8px 10px -8px #888;
      transition: all 0.15s ease-out;
    }
    #animation-graphic:hover {
      box-shadow: 0 15px 80px -8px #333, 0 3px 30px 1px #f0f;
      transform: scale(1.05);
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
  <iframe id="animation-graphic" src="https://cdpn.io/pen/debug/yLEyeYX/e780f8a9ee647338909cd8d3e969d432" frameborder="0"></iframe>
  <div id="editor">loading...</div>
  <div id="profile" class="btn-group">
    <button type="button" class="btn btn-outline-dark">
      <div id="user">${tag}</div>
    </button>
    <button type="button" class="btn btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
      <span class="visually-hidden">Toggle Dropdown</span>
    </button>
    <ul class="dropdown-menu">
      <li><button id="edit-sample" type="button" class="dropdown-item">Edit</button></li>
    </ul>
  </div>
</body>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-OERcA2EqjJCMA+/3y+gxIOqMEjwtxJY7qPCqsdltbNJuaOe923+mo//f6V8Qbsw3" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.1.3/axios.min.js" integrity="sha512-0qU9M9jfqPw6FKkPafM3gy2CBAvUWnYVOfNPDYKVuRTel1PrciTj+a9P3loJB+j0QmN2Y0JYQmkBBS8W+mbezg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/ace.js"></script>
<script src="https://unpkg.com/mustache@latest"></script>
<script src='../js/cookies.js'></script>
<script>
  setCookie('activeTag', '${tag}', 1);
</script>
<script src='../controller/completions.js'></script>
<script>
var circle = document.createElement('div');
circle.style.width = '100%';
circle.style.height = '10px';
circle.style.backgroundColor = 'green';
circle.style.zIndex = '999999';
circle.style.position = 'absolute';
circle.style.top = '0px';
circle.style.left = '0px';
circle.style.transition = 'all 4.2s';
circle.style.opacity = '0.5';
document.body.appendChild(circle);
var countdown = document.createElement('div');

setTimeout(function() {
  circle.style.top = '100%';
  circle.style.height = '0px';
  circle.style.opacity = '0';
}, 1000);

</script>`;

export default () => async (req, res, next) => {
  const { tag } = req.params;

  enqueue(
    'ai-completions',
    async () => {
      res.send(html(tag));
    },
    next,
    '(🤖):ai-completions',
  );
};
