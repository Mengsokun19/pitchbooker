const DataTypes = require('sequelize');
const sequelize = require('../../config/db.config');
const Role = sequelize.define('roles', {
    name: {
        type: DataTypes.STRING(20),
    },
});

Role.associate = (module) => {
    Role.belongsToMany(module.users, {
        through: 'users',
        as: 'users',
        foreignKey: 'roleId',
        otherKey: 'userId',
    });
};

Role.sync();

module.exports = Role;
