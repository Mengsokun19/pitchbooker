const Pitch_price = require('./model');
const Week_parts = require('../week_part/model');
const Day_parts = require('../day_part/model');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../config/db.config');

exports.findAll = async (req, res) => {
    const weekPart_objs = await sequelize.query(
        'SELECT wp.id, wp.name FROM week_parts as wp, users as u, sport_clubs as sc WHERE wp."sportClubId" = sc.id and sc."userId" = u.id and u.id = (:userId)',
        {
            replacements: { userId: [req.userId] },
            type: QueryTypes.SELECT,
        }
    );
    // console.log(weekPart_objs);
    var weekPartIds = [];
    for (let item of weekPart_objs) {
        weekPartIds.push(item.id);
    }
    var condition = req.authorities.includes('ROLE_CLUB_OWNER')
        ? { weekPartId: { [Op.in]: weekPartIds } }
        : null;
    // console.log('/');
    // console.log(condition);
    Pitch_price.findAll({
        where: condition,
        attributes: ['id', 'price'],
        include: [
            {
                model: Week_parts,
                attributes: ['id', 'name'],
            },
            {
                model: Day_parts,
                attributes: ['id', 'name'],
            },
        ],
        order: ['id'],
        limit: 10,
    })
        .then((pitch_prices) => {
            // console.log(pitch_prices);
            res.status(200).send(pitch_prices);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occured while retrieving pitch price.',
            });
        });
};

exports.findOne = (req, res) => {
    const id = req.params.id;

    Pitch_price.findByPk(id, {
        attributes: ['id', 'price'],
        include: [
            {
                model: Week_parts,
                attributes: ['id', 'name'],
            },
            {
                model: Day_parts,
                attributes: ['id', 'name'],
            },
        ],
    })
        .then((pitch_price) => {
            res.status(200).send(pitch_price);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error retrieving pitch price with id = ${id}!`,
            });
        });
};

exports.calculatePrice = async (req, res) => {
    // console.log('................');
    try {
        const time_in = req.params.time_in;
        const time_out = req.params.time_out;
        const total_hours = getTimeDiff(time_in, time_out);
        // console.log(total_hours);
        if (total_hours <= 0) {
            res.status(400).send({
                message: `Failed! ${total_hours}h! End time before or same Start time!`,
            });
            return;
        }

        // Get all week parts
        var week_parts = await sequelize.query(
            'SELECT COUNT(id) as total FROM week_parts',
            { type: QueryTypes.SELECT }
        );

        var weekPart = getWeekPartId(week_parts, req.params.date);

        // Get all day parts
        const dayParts = await sequelize.query(
            'SELECT id, name FROM day_parts WHERE start_time < (:time_out) and end_time > (:time_in)',
            {
                replacements: { time_out: [time_out], time_in: [time_in] },
                type: QueryTypes.SELECT,
            }
        );

        const dayPartIds = [];
        for (let item of dayParts) {
            dayPartIds.push(item.id);
        }

        if (dayPartIds.length > 2) {
            res.status(400).send({
                message: `${total_hours}h! duration is too long!`,
            });
            return;
        }

        if (total_hours > 4) {
            res.status(400).send({
                message: `${total_hours}h! duration is too long!`,
            });
            return;
        }

        var dayPart = dayParts[0].name;
        if (dayPartIds.length === 2) {
            dayPart = dayParts[1].name;
        }

        var price = await sequelize.query(
            'SELECT (SUM(price)/(:length)) * (:hours) AS total_prices FROM pitch_prices WHERE "dayPartId" IN(:dayPartIds) and "weekPartId" = (:weekPartId)',
            {
                replacements: {
                    hours: total_hours,
                    length: dayPartIds.length,
                    dayPartIds: dayPartIds,
                    weekPartId: [weekPart.id],
                },
                type: QueryTypes.SELECT,
            }
        );

        price = price[0];

        price['unit_price'] = price.total_prices / total_hours;
        price['total_hours'] = total_hours;
        price['day_part'] = dayPart;
        price['week_parts'] = weekPart.name;

        res.status(200).send(price);
    } catch (err) {
        res.status(500).send({
            message: 'Error while retrieving pitch price!',
        });
    }
};

getTimeDiff = (time_in, time_out) => {
    var h1 = time_in;
    var a1 = h1.split(':');
    var h2 = time_out;
    var a2 = h2.split(':');
    // console.log(Number(a1[0]), Number(a1[1]));
    h1 = Number(a1[0]) + Number(a1[1] / 60);
    h2 = Number(a2[0]) + Number(a2[1] / 60);
    // console.log(h1);
    return h2 - h1;
};

getWeekPartId = (week_parts, date_str) => {
    var id = 0; // Sunday or Weekend
    var name = '';
    const date = new Date(date_str);
    const day = date.getDay();

    week_parts = Number(week_parts[0]['total']);

    if (week_parts > 2) {
        if (day === 6) {
            id = 3;
            name = 'Saturday';
        } else if (day === 0) {
            id = 2;
            name = 'Sunday';
        } else {
            id = 1;
            name = 'Weekdays';
        }
    } else {
        if ([1, 2, 3, 4, 5].includes(day)) {
            id = 1;
            name = 'Weekdays';
        } else {
            id = 2;
            name = 'Weekend';
        }
    }
    return { id: id, name: name };
};

exports.Create = (req, res) => {
    const data = req.body;

    Pitch_price.create(data)
        .then((pitch_price) => {
            Week_parts.findOne({ where: { name: data['week_part'] } }).then(
                (week_part) => {
                    pitch_price.setWeek_part(week_part);
                }
            );
            Day_parts.findOne({ where: data['day_part'] }).then((day_part) => {
                pitch_price.setDay_part(day_part);
            });
            res.status(200).send('Pitch Price created Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Error creating pitch price!',
            });
        });
};

exports.Update = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    Pitch_price.update(data, { where: { id: id } })
        .then(() => {
            res.status(200).send('Pitch Price updated Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error updating pitch price with id = ${id}!`,
            });
        });
};

exports.Delete = (req, res) => {
    const id = req.params.id;

    Pitch_price.destroy({ where: { id: id } })
        .then(() => {
            res.status(200).send('Pitch price deleted Successfully!');
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Error deleting pitch price with id = ${id}!`,
            });
        });
};
