const Week_parts = require('../week_part/model');
const Day_parts = require('./model');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../config/db.config');

exports.findAll = async (req, res) => {
    const sport_cub = await sequelize.query(
        'SELECT sc.id, sc.name FROM users as u, sport_clubs as sc WHERE sc."userId" = u.id and u.id =(:userId)',
        {
            replacements: { userId: [req.userId] },
            type: QueryTypes.SELECT,
        }
    );

    var condition = req.authorities.includes('ROLE_CLUB_OWNER')
        ? { sportClubId: { [Op.eq]: sport_cub[0].id } }
        : null;
    Day_parts.findAll({
        where: condition,
        order: ['id'],
        limit: 10,
    })
        .then((day_parts) => {
            res.status(200).send(day_parts);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Some errors occured while retrieving day part!`,
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Day_parts.findByPk(id)
        .then((day_part) => {
            res.status(200).send(day_part);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || `Error retrieving day part with id = ${id}!`,
            });
        });
};

exports.Create = (req, res) => {
    const data = req.body;

    Day_parts.create(data)
        .then((day_part) => {
            Week_parts.findOne({ where: { name: data['week_part'] } }).then(
                (week_part) => {
                    day_part.setWeek_part(week_part);
                    res.status(200).send('Part of day created Successfully!');
                }
            );
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || `Error creating part of day!`,
            });
        });
};

exports.Update = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    Day_parts.update(data, { where: { id: id } })
        .then(() => {
            res.status(200).send('Part of days Updated Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error updating part of days with id = ${id}!`,
            });
        });
};

exports.Delete = (req, res) => {
    const id = req.params.id;

    Day_parts.destroy({ where: { id: id } })
        .then(() => {
            res.status(200).send(`Part of days Deleted Successfully!`);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error deleting parts of day with id = ${id}!`,
            });
        });
};
