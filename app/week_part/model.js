const DataTypes = require('sequelize');
const sequelize = require('../config/db.config');
const Pitch_price = require('../pitch_price/model');
const Week_parts = sequelize.define('week_parts', {
    name: {
        type: DataTypes.STRING(15),
    },
});

Week_parts.hasMany(Pitch_price, { foreignKey: 'weekPartId' });
Pitch_price.belongsTo(Week_parts);

Week_parts.sync();

module.exports = Week_parts;
