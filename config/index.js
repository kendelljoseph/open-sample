require('dotenv').config();

const APP = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
};

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

const NEO4J = {
  NEO4J_USER: process.env.NEO4J_USER,
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  NEO4J_URI: process.env.NEO4J_URI,
};

module.exports = { APP, POSTGRESQL, NEO4J };
