const { RouteError } = require('../models');

module.exports = () => async (error, req, res, next) => {
  console.error('500 Server Error'.bgRed, String(error.message).red);
  try {
    await RouteError.create({
      method: req.method,
      path: req.path,
      event: req.audit && req.audit.event,
      message: error.message,
      token: req.authz && req.authz.token,
    });
    res.status(500).json(error.message);
  } catch (err) {
    console.error('500 Cascading Error'.bgRed, err);
  }

  next();
};
