// eslint-disable-next-line no-unused-vars
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import cache from './middleware/cache.js';
import appEvents from './middleware/app_events.js';
import routeError from './middleware/route_error.js';
import entity from './routes/entity.js';
import finance from './routes/finance.js';
import ai from './routes/ai.js';
import sms from './routes/sms.js';
import reflect from './routes/reflect.js';
import adminAudit from './routes/audit.js';
import adminRouteError from './routes/route_error.js';
import { APP } from './config/index.js';
import passport from './auth/google.js';

const { PORT } = APP;

const app = express();

// App Data Traffic Settings
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// App Events
app.use(appEvents());

// Logging
app.use(
  morgan((tokens, req, res) => [
    '❓',
    `${tokens.method(req, res)}`.cyan,
    `${req.appAuditEvent}`.cyan,
    `${
      tokens.status(req, res) === '200'
        ? tokens.url(req, res).cyan
        : tokens.url(req, res).red
    }`,
    `${tokens.status(req, res) === '200' ? '200 OK'.cyan : tokens.status(req, res).yellow}`,
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
  ].join(' ')),
);

// Session Cookies
app.use(
  session({
    secret: process.env.ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Cache
app.use(cache());

// API Routes
app.use('/api/v1/entity', entity);
app.use('/api/v1/finance', finance);
app.use('/api/v1/ai', ai);
app.use('/api/v1/sms', sms);
app.use('/api/v1/reflect', reflect);

// Admin Routes
app.use('/admin/v1/audit', adminAudit);
app.use('/admin/v1/route-error', adminRouteError);

// Front End
app.use(
  '/',
  // passport.authenticate('google', {
  //   scope: ['email', 'profile'],
  //   failureRedirect: '/auth/callback/failure',
  // }),
  passport.authenticate('session'),
  express.static('./public'),
);

// Auth
app.get('/auth', passport.authenticate('google', { scope: ['email', 'profile'] }));

// Auth Callback
app.get(
  '/auth/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/callback/failure',
  }),
  (req, res) => {
    const { user } = req;
    res.send(
      `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Merriweather&family=Silkscreen:wght@700&display=swap');
        body {
          display: flex;
          flex-flow: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
        }
        .user-image {
          width: 120px;
          margin-bottom: 30px;
          border-radius: 100%;
          animation-name: fade-in;
          animation-duration: 2s; 

        }
        .auth-text {
          font-family: 'Silkscreen', cursive;
          animation-name: bounce;
          animation-duration: 1s; 
          animation-fill-mode: both; 
        }
        .caption {
          margin-bottom: 20px;
          font-family: 'Merriweather', serif;
          font-size: 0.25em;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 
          40% {transform: translateY(-30px);} 
          60% {transform: translateY(-15px);} 
       }
       
       @keyframes fade-in {
        0%, 20%, 50%, 80%, 100% {opacity: 0.5;} 
        40% {opacity: 0.5;} 
        60% {opacity: 0.15;} 
     }
      </style>
      <img class="user-image" src="${user.picture}">
      <h1 class='auth-text'>🤔 authenticating...</h1>
      <p class="caption">logging you in as ${user.displayName}</p>
      <script src='../js/cookies.js'></script>
      <script>
        setCookie('userId', '${user.id}', 1);
        setCookie('userEmail', '${user.email}', 1);
        setCookie('userPhoto', '${user.picture}', 1);
        setCookie('userDisplayName', '${user.displayName}', 1);
        setTimeout(() => {
          window.location='../../'
        }, 3200);
      </script>`,
    );
  },
);

// Auth failure
app.get('/auth/callback/failure', (req, res) => {
  res.send('Error');
});

// Errors
app.use(routeError());

// Listen
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`.bgYellow);
});
