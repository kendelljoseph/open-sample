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
import authCallback from './middleware/auth_callback.js';
import entity from './routes/entity.js';
import finance from './routes/finance.js';
import ai from './routes/ai.js';
import sms from './routes/sms.js';
import reflect from './routes/reflect.js';
import user from './routes/user.js';
import verify from './routes/verify.js';
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
  morgan((tokens, req, res) => {
    const status = tokens.status(req, res) || '';
    const url = tokens.url(req, res) || '';
    return [
      '❓',
      `${tokens.method(req, res)}`.cyan,
      `${req.appAuditEvent}`.cyan,
      `${status === '200' ? url.cyan : url.red}`,
      `${status === '200' ? '200 OK'.cyan : status.yellow}`,
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');
  }),
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

// User Routes
app.use('/api/v1/user', user);

// Verify Routes
app.use('/api/v1/verify', verify);

// Admin Routes
app.use('/admin/v1/audit', adminAudit);
app.use('/admin/v1/route-error', adminRouteError);

// Front End
app.use('/', passport.authenticate('session'), express.static('./public'));

// Auth
app.get('/auth', passport.authenticate('google', { scope: ['email', 'profile'] }));

// Auth Callback
app.get(
  '/auth/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/callback/failure',
  }),
  authCallback(),
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
