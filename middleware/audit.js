const { Audit } = require('../models');
const crypto = require('crypto');
module.exports = () => {
  return  async (req, res, next) => {
    const appEvent = req.headers['x-app-audit-event'];
    
    try {
      const audit = await Audit.create({
        token: req.authz && req.authz.token,
        key: crypto.randomBytes(32).toString('hex'),
        event: appEvent
      });
    
      req.audit = audit.dataValues;

      next();
    } catch(error) {
      next(error);
    }
  }
}