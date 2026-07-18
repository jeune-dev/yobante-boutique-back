require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('./logger');

const isProd = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: isProd ? { require: true, rejectUnauthorized: true } : false,
    keepAlive: true,
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    acquire: 30000,
    idle: 10000,
    evict: 1000,
  },
  define: { freezeTableName: true },
});

module.exports = sequelize;
