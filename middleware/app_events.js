export default () => async (req, res, next) => {
  req.appAuditEvent = req.headers['x-app-audit-event'] || 'unknown-event';
  next();
};
