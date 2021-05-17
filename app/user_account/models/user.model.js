const DataTypes = require('sequelize');
const sequelize = require('../../config/db.config');
const Role = require('./role.model');
const Booking_detail = require('../../booking_detail/model');
const Membership = require('./membership.model');
const Payway = require('../../payway/model');
const Sport_club = require('../../sport_club/model');
const User = sequelize.define('users', {
    username: {
        type: DataTypes.STRING(30),
        required: true,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 20],
            notNull: {
                msg: 'Please Enter Your Name!',
            },
        },
    },
    email: {
        type: DataTypes.STRING(50),
        required: true,
        validate: {
            isEmail: {
                msg: 'Invalid Email.',
            },
        },
    },
    password: {
        type: DataTypes.STRING(64),
        required: true,
        is: /^[0-9a-f]{64}/i,
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Pending....',
    },
    accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
});

User.belongsToMany(Role, {
    through: 'user_roles',
    as: 'roles',
    foreignKey: 'userId',
    otherKey: 'roleId',
});

User.hasOne(Sport_club);
Sport_club.belongsTo(User);
User.belongsTo(Membership);
User.hasMany(Booking_detail, { foreignKey: 'userId' });
Booking_detail.belongsTo(User);
User.hasMany(Payway, { foreignKey: 'userId' });
Payway.belongsTo(User);
User.sync();
module.exports = User;
