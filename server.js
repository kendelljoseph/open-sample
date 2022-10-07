require('dotenv').config();
require('colors');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const { authz, audit, routeError } = require('./middleware');
const { entity, adminAudit, adminRouteError } = require('./routes');

const app = express();

// Config
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('tiny'));

// Middleware
app.use(authz());
app.use(audit());

// Routes
app.use('/v1/entity', entity);
app.use('/admin/v1/audit', adminAudit);
app.use('/admin/v1/route-error', adminRouteError);

// Errors
app.use(routeError());

// Listen
app.listen(port, () => {
  console.log(`App listening on port ${port}`.bgYellow);
});