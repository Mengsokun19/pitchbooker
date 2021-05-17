const DataTypes = require('sequelize');
const sequelize = require('../config/db.config');
const Booking_detail = sequelize.define('booking_details', {
    match_finding_status: {
        type: DataTypes.STRING(20),
    },
    match_finding: {
        type: DataTypes.BOOLEAN,
    },
    payment_amount: {
        type: DataTypes.FLOAT,
    },
    time_in: {
        type: DataTypes.TIME,
        required: true,
    },
    time_out: {
        type: DataTypes.TIME,
        required: true,
    },
    play_date: {
        type: DataTypes.DATEONLY,
        required: true,
    },
});

Booking_detail.sync();

module.exports = Booking_detail;
