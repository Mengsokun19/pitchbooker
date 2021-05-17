const DataType = require('sequelize');
const sequelize = require('../../config/db.config');
const Membership = sequelize.define('memberships', {
  name: { type: DataType.STRING },
});

Membership.sync();

module.exports = Membership;
