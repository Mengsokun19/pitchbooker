const Sequelize = require('sequelize');
const Payway = require('./model');
const Membership = require('../user_account/models/membership.model');
const User = require('../user_account/models/user.model');
const Op = require('sequelize');
const sequelize = require('../config/db.config');

exports.findAll = (req, res) => {
    var condition = null;

    condition = req.authorities.includes('ROLE_ADMIN')
        ? { userId: { [Op.iLike]: `%${req.userId}` } }
        : null;

    Payway.findAll({
        where: condition,
        attributes: { exclude: ['userId'] },
        include: [
            {
                model: User,
                attributes: { exclude: ['password', 'membershipId'] },
            },
        ],
        order: ['id'],
        limit: 10,
    })
        .then((payway) => {
            res.status(200).send(payway);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some errors occured while retrieving payways.',
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Payway.findByPk(id, {
        attributes: { exclude: ['userId'] },
        include: {
            model: User,
            attributes: { exclude: ['password', 'membershipId'] },
            include: [
                {
                    model: Membership,
                },
            ],
        },
    })
        .then((payway) => {
            res.status(200).send(payway);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || `Error retrieving payway with id = ${id}!`,
            });
        });
};

exports.Create = (req, res) => {
    const data = req.body;

    Payway.create(data)
        .then((payway) => {
            User.findOne({ where: { id: req.userId } }).then((user) => {
                payway.setUser(user);
                res.status(200).send('Payway created successfully!');
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || `Error creating payway.`,
            });
        });
};

exports.Update = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    Payway.update(data, { where: { id: id } })
        .then((payway) => {
            res.status(200).send(`Payway Updated Successfully!`);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || `Error updating payway with id = ${id}!`,
            });
        });
};

exports.Delete = (req, res) => {
    const id = req.params.id;

    Payway.destroy({ where: { id: id } })
        .then(() => {
            res.status(200).send(`Payway Deleted Successfully!`);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || `Error Deleting payway with id = ${id}!`,
            });
        });
};
