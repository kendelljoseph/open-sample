const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const RouteError = sequelize.define('RouteError', {
  method: {
    type: DataTypes.STRING
  },
  path: {
    type: DataTypes.STRING
  },
  event: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.STRING
  },
  token: {
    type: DataTypes.STRING
  }
});

RouteError.sync();

module.exports = RouteError;