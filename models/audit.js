const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const Audit = sequelize.define('Audit', {
  event: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

Audit.sync();

module.exports = Audit;