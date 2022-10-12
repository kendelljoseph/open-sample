import crypto from 'crypto';
import { Audit } from '../models/record/index.js';
import enqueue from '../lib/enqueue.js';

export default () => async (req, res, next) => {
  const appEvent = req.headers['x-app-audit-event'] || 'unknown-event';
  const token = req.authz ? req.authz.token : 'unauthorized';

  enqueue(
    token,
    async () => {
      try {
        const audit = await Audit.create({
          token,
          key: crypto.randomBytes(32).toString('hex'),
          event: appEvent,
        });

        req.audit = audit.dataValues;

        next();
      } catch (error) {
        next(error);
      }
    },
    next,
    `audit:${appEvent}`,
  );
};
