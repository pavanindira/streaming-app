require('dotenv').config();

if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME || !process.env.DB_HOST) {
  throw new Error('Missing required database environment variables');
}

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: console.log,
};

module.exports = {
  development: {
    ...baseConfig,
    database: process.env.DB_NAME,
  },
  test: {
    ...baseConfig,
    database: process.env.DB_NAME_TEST,
  },
  production: {
    ...baseConfig,
    database: process.env.DB_NAME_PROD,
  },
};