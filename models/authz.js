const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const Authz = sequelize.define('Authorization', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  token: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
    tableName: 'Authz'
});

Authz.sync();

module.exports = Authz;