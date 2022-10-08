require('dotenv').config();

const POSTGRESQL = {
  HOST: process.env.POSTGRESQL_DB_HOST,
  USER: process.env.POSTGRESQL_USER,
  PASSWORD: process.env.POSTGRESQL_PASSWORD,
  DB: process.env.POSTGRESQL_DB,
  PORT: process.env.POSTGRESQL_PORT,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const APP = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
};

module.exports = { APP, POSTGRESQL };
