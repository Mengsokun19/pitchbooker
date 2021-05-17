const DataTypes = require('sequelize');
const Booking_detail = require('../booking_detail/model');
const sequelize = require('../config/db.config');
const Pitch_detail = sequelize.define('pitch_details', {
    name: {
        type: DataTypes.STRING(20),
    },
    description: {
        type: DataTypes.TEXT,
    },
    size: {
        type: DataTypes.STRING(20),
    },
});

Pitch_detail.associate = (model) => {
    Pitch_detail.hasMany(mode.booking_details, { foreignKey: 'pitchDetailId' });
};

Booking_detail.belongsTo(Pitch_detail);

Pitch_detail.sync();

module.exports = Pitch_detail;
