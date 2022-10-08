const { Sequelize, DataTypes } = require('sequelize');
const { POSTGRESQL } = require('../config');

const sequelize = new Sequelize(POSTGRESQL.DB, POSTGRESQL.USER, POSTGRESQL.PASSWORD, {
  host: POSTGRESQL.HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  operatorsAliases: false,
  pool: POSTGRESQL.pool,
  port: POSTGRESQL.PORT,
});

module.exports = { sequelize, DataTypes };
