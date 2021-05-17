const Payway = require('../payway/model');

checkDuplicatePayway = (req, res, next) => {
    Payway.findOne({
        where: {
            account_num: req.body.account_num,
            userId: req.userId,
        },
    }).then((payway) => {
        res.status(400).send({
            message: 'Failed! Payway is already in Used!',
        });
        return;
    });

    next();
};

const verifyPaway = {
    checkDuplicatePayway: checkDuplicatePayway,
};

module.exports = verifyPaway;
