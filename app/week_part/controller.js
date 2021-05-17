const Week_parts = require('./model');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../config/db.config');

exports.findAll = async (req, res) => {
    const sport_club = await sequelize.query(
        'SELECT sc.id, sc.name FROM users as u, sport_clubs as sc WHERE sc."userId" = u.id and u.id = (:userId)',
        {
            replacements: { userId: [req.user] },
            type: QueryTypes.SELECT,
        }
    );
    var condition = req.authorities.includes('ROLE_CLUB_OWNER')
        ? { sportClubId: { [Op.eq]: sport_club[0].id } }
        : null;
    Week_parts.findAll({
        where: condition,
        order: ['id'],
        limit: 10,
    })
        .then((week_parts) => {
            res.status(200).send(week_parts);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some errors occured while retrieving parts of week.',
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Week_parts.findByPk(id)
        .then((week_part) => {
            res.status(200).send(week_part);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error retrieving parts of week with id = ${id}.`,
            });
        });
};

exports.Create = (req, res) => {
    const data = req.body;
    Week_parts.create(data)
        .then(() => {
            res.status(200).send('Parts of weeks created Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Error creating  parts of weeks.',
            });
        });
};

exports.Update = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    Week_parts.update(data, { where: { id: id } })
        .then(() => {
            res.status(200).send('Parts of week updated Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error updating parts of week with id = ${id}!`,
            });
        });
};

exports.Delete = (req, res) => {
    const id = req.params.id;

    Week_parts.destroy({ where: { id: id } })
        .then(() => res.status(200).send('Parts of week deleted Successfully!'))
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error deleting parts of week with id  ${id}!`,
            });
        });
};
