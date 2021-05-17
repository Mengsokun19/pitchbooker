const Booking_detail = require('./model');
const Pitch_detail = require('../pitch_detail/model');
const Membership = require('../user_account/models/membership.model');
const User = require('../user_account/models/user.model');
const Waiting_room = require('../waiting_room/model');
const Sport_club = require('../sport_club/model');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../config/db.config');

exports.findAll = async (req, res) => {
    var condition = null;
    if (!req.authorities.includes('ROLE_ADMIN')) {
        const pitch_objs = await sequelize.query(
            'SELECT pd.id, pd.name FROM pitch_details as pd, users as u, sport_clubs as sc WHERE pd."sportClubId" = sc.id and sc."userId" = u.id and u.id = (:userId)',
            {
                replacements: { userId: [req.userId] },
                type: QueryTypes.SELECT,
            }
        );
        var pitchIds = [];
        for (let item of pitch_objs) {
            pitchIds.push(item.id);
        }
        condition = req.authorities.includes(['ROLE_USER'])
            ? { userId: { [Op.iLike]: `%${req.userId}` } }
            : { pitchDetailId: { [Op.in]: pitchIds } };
    }

    Booking_detail.findAll({
        where: condition,
        attributes: {
            exclude: ['userId', 'pitchDetailId', 'createdAt', 'updatedAt'],
        },
        include: [
            {
                model: User,
                attributes: ['id', 'username', 'email'],
                include: [
                    {
                        model: Membership,
                        attributes: ['id', 'name'],
                    },
                ],
            },
            {
                model: Pitch_detail,
                attributes: ['id', 'name', 'description', 'size'],
                include: [
                    {
                        model: Sport_club,
                        attributes: ['id', 'name'],
                    },
                ],
            },
        ],
        order: ['id'],
        limit: 10,
    })
        .then((booking_detail) => {
            res.status(200).send(booking_detail);
        })
        .catch((err) => {
            res.stats(500).send({
                message:
                    err.message ||
                    'Some Errors occured while retrieving booking detail.',
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Booking_detail.findByPk(
        id,
        {
            attributes: {
                exclude: ['userId', 'pitchDetailId', 'createdAt', 'updatedAt'],
            },
            include: [
                {
                    model: Membership,
                    attributes: ['id', 'name'],
                },
            ],
        },
        {
            model: Pitch_detail,
            attributes: ['id', 'name', 'description', 'size'],
            include: [
                {
                    model: Sport_club,
                    attributes: ['id', 'name'],
                },
            ],
        }
    )
        .then((booking_detail) => {
            {
                res.status(200).send(booking_detail);
            }
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error retrieving booking detail with id = ${id}!`,
            });
        });
};

exports.Create = (req, res) => {
    const data = req.body;
    calculate_price(data['time_in'], data['time_out'], data['week_part_id'])
        .then((result) => {
            if (result.total_hours <= 0) {
                res.status(400).send({
                    message: `Failed! ${result.total_hours}h! End time before or same Start time!`,
                });
                return;
            }
            if (result.total_hours > 4) {
                res.status(400).send({
                    message: `${result.total_hours}h! The duration is too long!`,
                });
                return;
            }

            Booking_detail.create(data)
                .then(async (booking_detail) => {
                    User.findOne({ where: { id: req.userId } }).then((user) => {
                        booking_detail.setUser(user);
                    });
                    Pitch_detail.findOne({
                        where: { id: data['pitchDetailId'] },
                    }).then((pitch_detail) => {
                        booking_detail.setPitch_detail(pitch_detail);
                    });
                    if (data['match_finding']) {
                        await Waiting_room.create().then((waiting_room) => {
                            waiting_room.setBooking_detail(booking_detail);
                        });
                    }
                    booking_detail.payment_amount = result.calculate_price;
                    await booking_detail.save();
                    res.status(200).send(
                        'Booking detail Created Successfully!'
                    );
                })
                .catch((err) => {
                    res.status(500).send({
                        message:
                            err.message || 'Error creating booking detail.',
                    });
                });
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

calculate_price = async (time_in, time_out, weekPartId) => {
    const objects = await sequelize.query(
        'SELECT id FROM day_parts WHERE start_time <(:time_out) and end_time >(:time_in)',
        {
            replacements: { time_in: [time_in], time_out: [time_out] },
            type: QueryTypes.SELECT,
        }
    );
    const dayPartIds = [];
    for (let item of objects) {
        dayPartIds.push(item.id);
    }

    const total_hours = getTimeDiff(time_in, time_out);

    const price = await sequelize.query(
        'SELECT SUM(price)*(:total_hours)/(:length) AS total FROM pitch_prices WHERE "dayPartId" IN(:dayPartIds) and "weekPartId" =(:weekPartId)',
        {
            replacements: {
                total_hours: total_hours,
                length: dayPartIds.length,
                dayPartIds: dayPartIds,
                weekPartId: [weekPartId],
            },
            type: QueryTypes.SELECT,
        }
    );
    return {
        price: price[0].total,
        total_hours: total_hours,
    };
};

getTimeDiff = (time_in, time_out) => {
    var h1 = time_in;
    var a1 = h1.split(':');
    var h2 = time_out;
    var a2 = h2.split(':');
    h1 = Number(a1[0]) + Number(a1[1] / 60);
    h2 = Number(a2[0]) + Number(a2[1] / 60);
    return h2 - h1;
};

exports.getAvailability = (req, res, next) => {
    Booking_detail.findAll({
        where: {
            pitchDetailId: req.params.id,
            play_date: req.params.date,
        },
    }).then((datas) => {
        availableTimes = [
            '07:00:00',
            '07:30:00',
            '08:00:00',
            '08:30:00',
            '09:00:00',
            '09:30:00',
            '10:00:00',
            '10:30:00',
            '11:00:00',
            '11:30:00',
            '12:00:00',
            '12:30:00',
            '13:00:00',
            '13:30:00',
            '14:00:00',
            '14:30:00',
            '15:00:00',
            '15:30:00',
            '16:00:00',
            '16:30:00',
            '17:00:00',
            '17:30:00',
            '18:00:00',
            '18:30:00',
            '19:00:00',
            '19:30:00',
            '20:00:00',
            '20:30:00',
            '21:00:00',
            '21:30:00',
            '22:00:00',
            '22:30:00',
            '23:00:00',
        ];
        for (let data of datas) {
            availableTimes = availableTimes.filter(
                (item) => (item > data.time_out) | (item < data.time_in)
            );
        }
        res.status(200).send({
            Available_times: availableTimes,
        });
    });
};

exports.Update = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    Booking_detail.update(data, { where: { id: id } })
        .then(async (booking_detail) => {
            if (!booking_detail.match_finding) {
                await Waiting_room.destroy({ where: { bookingDetailId: id } });
            }
            res.status(200).send('Booking details Updated Successfully!');
        })
        .catch((err) => [
            res.status(500).send({
                message:
                    err.message ||
                    `Error updating booking detail with id = ${id}!`,
            }),
        ]);
};

exports.Delete = (req, res) => {
    const id = req.params.id;

    Booking_detail.destroy({ where: { id: id } })
        .then(() => {
            res.status(200).send('Booking detail Deleted Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error Deleting booking detail with id = ${id}!`,
            });
        });
};
