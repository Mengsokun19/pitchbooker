const sequelize = require('../config/db.config');
const Booking_detail = require('../booking_detail/model');
const Waiting_room = sequelize.define('waiting_rooms');

Waiting_room.belongsTo(Booking_detail);
Waiting_room.sync();

module.exports = Waiting_room;
