const fs = require('fs');

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_USERNAME || null,
    database: process.env.DB_NAME || "smartcampus_dev",
    host: process.env.DB_HOSTNAME || "127.0.0.1",
    dialect: 'mysql',
    operatorsAliases: "Sequelize.Op",
    logging: false
  },
  test: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "smartcampus_test",
    host: process.env.DB_HOSTNAME || "127.0.0.1",
    dialect: 'mysql',
    operatorsAliases: "Sequelize.Op",
    logging: false
  },
  production: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "smartcampus_prod",
    host: process.env.DB_HOSTNAME || "127.0.0.1",
    dialect: 'mysql',
    operatorsAliases: "Sequelize.Op",
    logging: false
  }
};
