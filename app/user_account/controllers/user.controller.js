const Sequelize = require('sequelize');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Membership = require('../models/membership.model');
var bcrypt = require('bcryptjs');
const Booking_detail = require('../../booking_detail/model');
const Sport_club = require('../../sport_club/model');
const Op = Sequelize.Op;

exports.allAccess = (req, res) => {
    res.status(200).send('Public Content.');
};

exports.userBoard = (req, res) => {
    res.status(200).send('User Content.');
};

exports.adminBoard = (req, res) => {
    res.status(200).send('Admin Content.');
};

exports.clubOwnerBoard = (req, res) => {
    res.status(200).send('Club Owner Content.');
};

exports.findAll = (req, res) => {
    const username = req.username;
    console.log(req.authorities);
    var condition = !req.authorities.includes('ROLE_ADMIN')
        ? {
              username: {
                  [Op.iLike]: `%${username}`,
              },
          }
        : null;
    console.log(condition);
    User.findAll({
        attributes: ['id', 'username', 'email'],
        where: condition,
        include: [
            {
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: {
                    attributes: [],
                },
            },
            {
                model: Membership,
                attributes: ['id', 'name'],
            },
            {
                model: Sport_club,
                attributes: ['id', 'name'],
            },
            {
                model: Booking_detail,
                attributes: [
                    'id',
                    'play_date',
                    'time_in',
                    'time_out',
                    'payment_amount',
                ],
            },
        ],
        order: ['id'],
        limit: 10,
    })
        .then((users) => {
            res.status(200).send(users);
            console.log(users);
            console.log(users.length);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || 'Some error occured while retrieving users.',
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;
    var condition = !req.authorities.includes(['ROLE_ADMIN'])
        ? {
              id: {
                  [Op.iLike]: `%${id}`,
              },
          }
        : null;

    User.findByPk(id, {
        attributes: ['id', 'username', 'email'],
        where: condition,
        include: [
            {
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: {
                    attributes: [],
                },
            },
            {
                model: Membership,
                attributes: ['id', 'name'],
            },
            {
                model: Booking_detail,
                attributes: [
                    'id',
                    'play_date',
                    'time_in',
                    'time_out',
                    'payment_amount',
                ],
            },
        ],
    })
        .then((user) => {
            res.status(200).send(user);
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error retrieving user with id = ' + id,
            });
        });
};

exports.Update = (req, res) => {
    const id = req.params.id;
    const data = req.body;
    password = data['password'];
    if (password) {
        data['password'] = bcrypt.hashSync(req.body.password, 8);
    }
    User.update(data, { where: { id: id } })
        .then(() => {
            res.status(200).send('User Updated Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error Retrieving Users with id: ' + id,
            });
        });
};

exports.Delete = (req, res) => {
    const id = req.params.id;
    User.destroy({ where: { id: id } })
        .then(() => {
            res.status(200).send('User Deleted Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Error Deleting User with id ' + id,
            });
        });
};
