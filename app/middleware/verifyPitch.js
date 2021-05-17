const Booking_detail = require('../booking_detail/model');
const Pitch_price = require('../pitch_price/model');
const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Day_parts = require('../day_part/model');

checkAvailability = (req, res, next) => {
    Booking_detail.findOne({
        where: {
            pitchDetailId: req.body.pitchDetailId,
            play_date: req.body.play_date,
            time_in: { [Op.lt]: req.body.time_out },
            time_out: { [Op.gt]: req.body.time_in },
        },
    }).then((booking_detail) => {
        if (booking_detail) {
            res.status(400).send({
                message: 'Failed! Pitch is not Available!',
            });
            return;
        }
        next();
    });
};

checkDuplicatePitchPrice = async (req, res, next) => {
    const week = await sequelize.query(
        'SELECT * FROM week_parts WHERE NAME = ?',
        {
            replacements: [req.body.week_part],
            type: QueryTypes.SELECT,
        }
    );
    const day = await sequelize.query(
        'SELECT * FROM day_parts WHERE NAME = ?',
        {
            replacements: [req.body.day_part],
            type: QueryTypes.SELECT,
        }
    );
    Pitch_price.findOne({
        where: {
            weekPartId: week[0].id,
            dayPartId: day[0].id,
        },
        include: [
            {
                model: Day_parts,
            },
        ],
    }).then((pitch_price) => {
        if (pitch_price) {
            res.status(400).send({
                message: `Duplicate entry! Not allow between this time ${pitch_price.day_part.start_time} - ${pitch_price.data_part.end_time}!`,
            });
            return;
        }
        next();
    });
};

const verifyPitch = {
    checkAvailability: checkAvailability,
    checkDuplicatePitchPrice: checkDuplicatePitchPrice,
};

module.exports = verifyPitch;
