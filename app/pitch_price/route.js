const { authJwt, verifyPitch } = require('../middleware');
const controller = require('./controller');

module.exports = (app) => {
    app.use((req, res, next) => {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    app.get(
        '/api/get-prices/time-in/:time_in/time-out/:time_out/date/:date/',
        [authJwt.verifyToken],
        controller.calculatePrice
    );

    app.get(
        '/api/pitch-prices/',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.findAll
    );

    app.get(
        '/api/pitch-prices/:id',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.findOne
    );

    app.post(
        '/api/pitch-prices',
        [
            authJwt.verifyToken,
            authJwt.isClubOwnerOrAdmin,
            verifyPitch.checkDuplicatePitchPrice,
        ],
        controller.Create
    );

    app.put(
        '/api/pitch-prices/:id',
        [
            authJwt.verifyToken,
            authJwt.isClubOwnerOrAdmin,
            verifyPitch.checkDuplicatePitchPrice,
        ],
        controller.Update
    );

    app.delete(
        '/api/pitch-prices/:id',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.Delete
    );
};
