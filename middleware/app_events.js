export default () => async (req, res, next) => {
  req.appAuditEvent = req.headers['x-app-event'] || 'x-app-event';
  next();
};
