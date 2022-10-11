import postgres from '../../database/postgres.js';
import { APP } from '../../config/index.js';

const { sequelize, DataTypes } = postgres;

export class DatabaseRecord {
  constructor(...args) {
    // eslint-disable-next-line no-constructor-return
    return sequelize.define(...args);
  }

  static syncAll() {
    sequelize
      .authenticate()
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('postgres db connected'.bgCyan);
        if (APP.NODE_ENV === 'test' || APP.PURGE_DB_DATA) {
          // eslint-disable-next-line no-console
          console.log('postgres db refreshing (purge mode)'.bgCyan);
          return sequelize.sync({ force: true });
        }
        return sequelize.sync();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('postgres db connection error'.bgRed, error.message.red);
      });
  }
}

export const Audit = new DatabaseRecord('Audit', {
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

export const Authz = new DatabaseRecord(
  'Authorization',
  {
    token: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    tableName: 'Authz',
  },
);

export const Entity = new DatabaseRecord(
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

export const RouteError = new DatabaseRecord('RouteError', {
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
