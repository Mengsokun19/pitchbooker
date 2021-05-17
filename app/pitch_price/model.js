const DataTypes = require('sequelize');
const sequelize = require('../config/db.config');
const Pitch_price = sequelize.define('pitch_prices', {
    price: {
        type: DataTypes.FLOAT,
    },
});

Pitch_price.sync();

module.exports = Pitch_price;
