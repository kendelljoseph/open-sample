const { RouteError } = require('../models');

module.exports = () => async (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  console.error(`${statusCode} Server Error`.bgRed, String(error.message).red);
  try {
    await RouteError.create({
      method: req.method,
      path: req.path,
      event: req.audit && req.audit.event,
      message: JSON.stringify(error.message),
      statusCode,
      token: req.authz && req.authz.token,
    });
    if (!res.writableEnded) {
      res.status(statusCode).json(error.message);
    }
  } catch (err) {
    console.error('500 Cascading Database or Express Error'.bgRed, err);
  }

  next();
};
