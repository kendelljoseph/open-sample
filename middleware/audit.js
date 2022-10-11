import crypto from 'crypto';
import { Audit } from '../models/record/index.js';

export default () => async (req, res, next) => {
  const appEvent = req.headers['x-app-audit-event'];

  try {
    const audit = await Audit.create({
      token: req.authz && req.authz.token,
      key: crypto.randomBytes(32).toString('hex'),
      event: appEvent,
    });

    req.audit = audit.dataValues;

    next();
  } catch (error) {
    next(error);
  }
};
