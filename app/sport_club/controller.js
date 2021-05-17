const Pitch_detail = require('../pitch_detail/model');
const Sport_club = require('../sport_club/model');
const User = require('../user_account/models/user.model');

exports.findAll = (req, res) => {
    var condition = null;
    if (!req.authorities.includes('ROLE_ADMIN')) {
        condition = { userId: req.userId };
    }

    Sport_club.findAll({
        where: condition,
        attributes: { exclude: ['createdAt', 'updatedAt', 'userId'] },
        include: [
            {
                model: Pitch_detail,
                attributes: ['id', 'name', 'size', 'description'],
            },
            {
                model: User,
                attributes: ['id', 'username'],
            },
        ],
        order: ['id'],
        limit: 10,
    })
        .then((sport_clubs) => {
            res.status(200).send(sport_clubs);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some Errors occured while retrieving sport clubs.',
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Sport_club.findByPk(id, {
        attributes: { exclude: ['createdAt', 'updatedAt', 'userId'] },
        include: [
            {
                model: Pitch_detail,
                attributes: ['id', 'name', 'size', 'description'],
            },
            {
                model: User,
                attributes: ['id', 'username'],
            },
        ],
    })
        .then((sport_club) => {
            res.status(200).send(sport_club);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Error retrieving sport club with id = ' + id,
            });
        });
};

exports.Create = (req, res) => {
    const data = req.body;
    if (req.authorities.include('ROLE_CLUB_OWNER')) {
        data.userId = req.userId;
    }
    Sport_club.create(data)
        .then(() => {
            res.status(200).send('Your club is created Successfully');
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Error creating club with id = ' + id,
            });
        });
};

exports.Update = (req, res) => {
    const id = rea.params.id;
    const data = req.body;
    Sport_club.update(data, { where: { id: id } })
        .then(() => {
            res.status(200).send('Club Updated Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Error updating with club id = ' + id,
            });
        });
};

exports.Delete = (req, res) => {
    const id = req.params.id;
    Sport_club.destroy({ where: { id: id } })
        .then(() => {
            res.status(200).send('Club Deleted Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Error deleting club with id = ' + id,
            });
        });
};
