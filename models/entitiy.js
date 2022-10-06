const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const Entitiy = sequelize.define('Entitiy', {
  // Model attributes are defined here
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
    tableName: 'Entities'
});

Entitiy.sync();

module.exports = Entitiy;