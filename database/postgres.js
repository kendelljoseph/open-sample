const { Sequelize, DataTypes } = require('sequelize');
const { POSTGRESQL, APP } = require('../config');

const sequelize = new Sequelize(POSTGRESQL.DB, POSTGRESQL.USER, POSTGRESQL.PASSWORD, {
  host: POSTGRESQL.HOST,
  dialect: 'postgres',
  dialectOptions:
        APP.NODE_ENV === 'production'
          ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
          : undefined,
  operatorsAliases: false,
  pool: POSTGRESQL.pool,
  port: POSTGRESQL.PORT,
});

module.exports = { sequelize, DataTypes };
