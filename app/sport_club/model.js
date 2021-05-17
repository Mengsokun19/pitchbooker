const DataTypes = require('sequelize');
const sequelize = require('../config/db.config');
const Day_parts = require('../day_part/model');
const Pitch_detail = require('../pitch_detail/model');
const Week_parts = require('../week_part/model');
const Sport_club = sequelize.define('sport_clubs', {
    name: {
        type: DataTypes.STRING(50),
    },
    description: {
        type: DataTypes.TEXT,
    },
    rating: {
        type: DataTypes.FLOAT,
    },
    locationUrl: {
        type: DataTypes.STRING,
    },
    imageUrl: {
        type: DataTypes.STRING,
    },
});

Sport_club.hasMany(Pitch_detail, { foreignKey: 'sportClubId' });
Pitch_detail.belongsTo(Sport_club);
Sport_club.hasMany(Day_parts, { foreignKey: 'sportClubId' });
Day_parts.belongsTo(Sport_club);
Sport_club.hasMany(Week_parts, { foreignKey: 'sportClubId' });
Week_parts.belongsTo(Sport_club);

Sport_club.sync();

module.exports = Sport_club;
