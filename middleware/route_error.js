import { RouteError } from '../models/record/index.js';
import enqueue from '../lib/enqueue.js';

export default () => async (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  // eslint-disable-next-line no-console
  console.error(`${statusCode} Server Error`.bgRed, String(error.message).red, error);

  enqueue(
    req.authz ? req.authz.token : 'unauthorized',
    async () => {
      const appEvent = req.headers['x-app-audit-event'] || 'unknown-event';
      try {
        await RouteError.create({
          method: req.method,
          path: req.path,
          event: appEvent,
          message: error.message && error.message,
          statusCode,
          token: req.authz && req.authz.token,
        });
        if (!res.writableEnded) {
          res.status(statusCode).json(error.message);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('500 Cascading Database or Express Error'.bgRed, err);
      }

      next();
    },
    next,
    'route error',
  );
};
