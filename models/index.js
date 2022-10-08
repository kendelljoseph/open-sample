const { postgres } = require('../database');

const { sequelize, DataTypes } = postgres;

class DatabaseObject {
  constructor(...args) {
    return sequelize.define(...args);
  }

  static syncAll() {
    sequelize
      .authenticate()
      .then(() => {
        console.log('postgres db connected'.bgCyan);
        return sequelize.sync();
      })
      .catch((error) => {
        console.error('postgres db connection error'.bgRed, error.message.red);
      });
  }
}

const Audit = new DatabaseObject('Audit', {
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

const Authz = new DatabaseObject(
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

const Entity = new DatabaseObject(
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

const RouteError = new DatabaseObject('RouteError', {
  method: {
    type: DataTypes.STRING,
  },
  path: {
    type: DataTypes.STRING,
  },
  event: {
    type: DataTypes.STRING,
  },
  statusCode: {
    type: DataTypes.INTEGER,
  },
  message: {
    type: DataTypes.STRING,
  },
  token: {
    type: DataTypes.STRING,
  },
});

DatabaseObject.syncAll();

// Export models
module.exports = {
  Entity,
  Authz,
  Audit,
  RouteError,
};
