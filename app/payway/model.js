const DataTypes = require('sequelize');
const sequelize = require('../config/db.config');
const Payway = sequelize.define('payways', {
    account_num: {
        type: DataTypes.STRING(20),
        validate: {
            is: /^[0-9]*$/i,
        },
    },
    account_name: {
        type: DataTypes.STRING(30),
    },
    payway_name: {
        type: DataTypes.STRING(20),
    },
    expire_date: {
        type: DataTypes.DATE,
    },
    cvc: {
        type: DataTypes.STRING(5),
    },
});

Payway.sync();

module.exports = Payway;
