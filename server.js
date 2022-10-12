// eslint-disable-next-line no-unused-vars
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import cache from './middleware/cache.js';
import routeError from './middleware/route_error.js';
import entity from './routes/entity.js';
import finance from './routes/finance.js';
import adminAudit from './routes/audit.js';
import adminRouteError from './routes/route_error.js';
import { APP } from './config/index.js';
import googleOauth from './auth/google.js';

const { PORT } = APP;

const app = express();

// App Data Traffic Settings
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Logging
app.use(morgan('tiny'));

// Session Cookies
app.use(
  session({
    secret: process.env.ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  }),
);
app.use(googleOauth.initialize());
app.use(googleOauth.session());

// Cache
app.use(cache());

// API Routes
app.use('/api/v1/entity', entity);
app.use('/api/v1/finance', finance);

// Admin Routes
app.use('/admin/v1/audit', adminAudit);
app.use('/admin/v1/route-error', adminRouteError);

// Login (Temporary)
app.get('/login', (req, res) => {
  res.send("<button><a href='/auth'>Login With Google</a></button>");
});

// Auth
app.get('/auth', googleOauth.authenticate('google', { scope: ['email', 'profile'] }));

// Auth Callback
app.get(
  '/auth/callback',
  googleOauth.authenticate('google', {
    failureRedirect: '/auth/callback/failure',
  }),
  (req, res) => {
    res.send(
      `<img src="${req.user.picture}"></img><h1>${req.user.displayName}</h1><div>${req.user.email}</div>`,
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
