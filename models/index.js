const { postgres } = require('../database');

const { sequelize, DataTypes } = postgres;

const Audit = sequelize.define('Audit', {
  event: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Authz = sequelize.define(
  'Authorization',
  {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    token: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    tableName: 'Authz',
  },
);

const Entity = sequelize.define(
  'Entitiy',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'Entities',
  },
);

const RouteError = sequelize.define('RouteError', {
  method: {
    type: DataTypes.STRING,
  },
  path: {
    type: DataTypes.STRING,
  },
  event: {
    type: DataTypes.STRING,
  },
  message: {
    type: DataTypes.STRING,
  },
  token: {
    type: DataTypes.STRING,
  },
});

// Sync models
sequelize
  .authenticate()
  .then(() => {
    console.log('postgres db connected'.bgCyan);
    return sequelize.sync({ force: true });
  })
  .catch((error) => {
    console.error('postgres db connection error'.bgRed, error.message.red);
  });

// Export models
module.exports = {
  Entity,
  Authz,
  Audit,
  RouteError,
};
