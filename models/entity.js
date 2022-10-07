const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const Entity = sequelize.define('Entitiy', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
    tableName: 'Entities'
});

Entity.sync();

module.exports = Entity;