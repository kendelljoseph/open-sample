const entity = require('./entity');
const audit = require('./audit');
const routeError = require('./route_error');

module.exports = { entity, adminAudit: audit, adminRouteError: routeError };
