const Sequelize = require('sequelize');
const Sport_club = require('../sport_club/model');
const Pitch_detail = require('./model');

exports.findAll = (req, res) => {
    Pitch_detail.findAll({
        attributes: ['id', 'name', 'description', 'size'],
        include: {
            model: Sport_club,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        order: ['id'],
        limit: 10,
    })
        .then((pitch_detail) => {
            res.status(200).send(pitch_detail);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Some Errors occured while retrieving pitch detail!`,
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Pitch_detail.findByPk(id, {
        attributes: ['id', 'name', 'description', 'size'],
        include: {
            model: Sport_club,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
    })
        .then((pitch_detail) => {
            res.status(200).send(pitch_detail);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error retrieving pitch detail with id = ${id}!`,
            });
        });
};

exports.Create = (req, res) => {
    const data = req.body;

    Pitch_detail.create(data)
        .then((pitch_detail) => {
            Sport_club.findOne({ where: { name: data['club_name'] } }).then(
                (sport_club) => {
                    pitch_detail.setSport_club(sport_club);
                }
            );
            res.status(200).send('Pitch Details created Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error creating pitch detail with id = ${id}.`,
            });
        });
};

exports.Update = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    Pitch_detail.update(data, { wher: { id: id } })
        .then(() => {
            res.status(200).send('Pitch details Updated Successfully!');
        })
        .catch((err) => [
            res.status(500).send({
                message:
                    err.message ||
                    `Error updating pitch detail with id = ${id}!`,
            }),
        ]);
};

exports.Delete = (req, res) => {
    const id = req.params.id;

    Pitch_detail.destroy({ where: { id: id } })
        .then(() => {
            res.status(200).send('Pitch detail Deleted Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error updating pitch detail with id = ${id}`,
            });
        });
};
