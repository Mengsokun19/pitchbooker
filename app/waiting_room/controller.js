const Sequelize = require('sequelize');
const Booking_detail = require('../booking_detail/model');
const Waiting_room = require('./model');

exports.findAll = (req, res) => {
    Waiting_room.findAll({
        attributes: { exclude: ['bookingDetailId'] },
        include: [
            {
                model: Booking_detail,
            },
        ],
    })
        .then((waiting_rooms) => {
            res.status(200).send(waiting_rooms);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some Errors occured while retrieving waiting room.',
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Waiting_room.findByPk(id, {
        attributes: { exclude: ['bookingDetailId'] },
        include: [
            {
                model: Booking_detail,
            },
        ],
    })
        .then((Waiting_room) => {
            res.status(200).send(Waiting_room);
        })
        .catch((err) => {
            res.status(500).send({
                message: `Error retrieving waiting room with id = ${id}.`,
            });
        });
};

exports.Create = (req, res) => {
    const data = req.body;

    Waiting_room.create(data)
        .then((waiting_room) => {
            Booking_detail.findOne({ where: { id: req.body.booking_id } }).then(
                (booking_detail) => {
                    waiting_room.setUser(booking_detail);
                    res.status(200).send('You are added to waiting room');
                }
            );
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error creating booking details.',
            });
        });
};

exports.Update = (req, res) => {
    const id = req.params.id;
    const data = req.body;
    Waiting_room.update(data, { where: { id: id } })
        .then(() => {
            res.status(200).send('Waiting Room updated Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message: `Error updating waiting room with id ${id}.`,
            });
        });
};

exports.Delete = (req, res) => {
    const id = req.params.id;
    Waiting_room.destroy({ where: { id: id } })
        .then(() => {
            res.status(200).send('You are removed from waiting room.');
        })
        .catch((err) => {
            res.status(500).send({
                message: `Error deleting waiting room with id = ${id}.`,
            });
        });
};
