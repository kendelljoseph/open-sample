import passport from 'passport';
import oauth from 'passport-google-oauth2';
import { APP } from '../config/index.js';
import { Authn, User } from '../models/record/index.js';

const GoogleStrategy = oauth.Strategy;
passport.serializeUser((user, done) => {
  // eslint-disable-next-line no-console
  console.log('🔑:serialize'.yellow, user.id);
  done(null, user);
});
passport.deserializeUser((user, done) => {
  // eslint-disable-next-line no-console
  console.log('🔑:deserialize'.yellow, user.id);
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: APP.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: APP.GOOGLE_OAUTH_SECRET,
      callbackURL: APP.AUTH_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      const [user, userCreated] = await User.findOrCreate({
        where: {
          displayName: profile.displayName,
          email: profile.email,
          googleId: profile.id,
        },
      });

      // eslint-disable-next-line no-unused-vars
      const [token, tokenCreated] = await Authn.findOrCreate({
        where: { googleId: profile.id, accessToken },
      });

      if (userCreated) {
        // eslint-disable-next-line no-console
        console.info(`🔑:(${user.displayName}) - New Profile`.bgYellow);
      }

      if (tokenCreated) {
        // eslint-disable-next-line no-console
        console.info(`🔑:(${accessToken})`.yellow);
      }
      done(null, profile);
    },
  ),
);

export default passport;
