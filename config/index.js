import dotenv from 'dotenv';

dotenv.config();

export const APP = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
  PURGE_DB_DATA: process.env.PURGE_DB_DATA,
  AUTH_CALLBACK_URL: process.env.AUTH_CALLBACK_URL,
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_SECRET: process.env.GOOGLE_OAUTH_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_COMPLETIONS_URL: process.env.OPENAI_COMPLETIONS_URL,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_NUMBER: process.env.TWILIO_NUMBER,
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
