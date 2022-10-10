const { postgres } = require('../../database');

const { sequelize, DataTypes } = postgres;

class DatabaseRecord {
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

const Audit = new DatabaseRecord('Audit', {
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

const Authz = new DatabaseRecord(
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

const Entity = new DatabaseRecord(
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

const RouteError = new DatabaseRecord('RouteError', {
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

DatabaseRecord.syncAll();

// Export models
module.exports = {
  Entity,
  Authz,
  Audit,
  RouteError,
};
