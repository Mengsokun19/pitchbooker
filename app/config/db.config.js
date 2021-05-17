const Sequelize = require('sequelize');
const { db } = require('../../config.json');

const sequelize = new Sequelize(db.DATABASE, db.USERNAME, db.PASSWORD, {
  host: db.HOST,
  logging: false,
  dialect: db.DIALECT,
  port: db.PORT,
  pool: {
    max: 5,
    min: 0,
    acquire: 300000,
    idle: 10000,
  },
});

module.exports = sequelize;
