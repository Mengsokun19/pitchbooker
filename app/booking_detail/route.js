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

    app.get('/api/booking-details/', [authJwt.verifyToken], controller.findAll);

    app.get(
        '/api/booking-details/:id',
        [authJwt.verifyToken],
        controller.findOne
    );
    app.get(
        '/api/booking-details/get-availability/:pitchId/:date',
        [authJwt.verifyToken],
        controller.getAvailability
    );
    app.post(
        '/api/booking-details/',
        [authJwt.verifyToken, verifyPitch.checkAvailability],
        controller.Create
    );
    app.put(
        '/api/booking-details/:id',
        [authJwt.verifyToken],
        controller.Update
    );
    app.delete(
        '/api/booking-details/:id',
        [authJwt.verifyToken],
        controller.Delete
    );
};
