const DataTypes = require('sequelize');
const sequelize = require('../config/db.config');
const Pitch_price = require('../pitch_price/model');
const Day_parts = sequelize.define('day_parts', {
    name: {
        type: DataTypes.STRING(15),
    },
    start_time: {
        type: DataTypes.TIME,
    },
    end_time: {
        type: DataTypes.TIME,
    },
});

Day_parts.hasMany(Pitch_price, { foreignKey: 'dayPartId' });
Pitch_price.belongsTo(Day_parts);

Day_parts.sync();

module.exports = Day_parts;
