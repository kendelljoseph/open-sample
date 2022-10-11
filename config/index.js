import dotenv from 'dotenv';

dotenv.config();

export const APP = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
};

export const POSTGRESQL = {
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

export const NEO4J = {
  NEO4J_USER: process.env.NEO4J_USER,
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  NEO4J_URI: process.env.NEO4J_URI,
};
