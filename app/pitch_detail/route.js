const { authJwt } = require('../middleware');
const controller = require('../pitch_detail/controller');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    app.get('/api/pitch-details/', [authJwt.verifyToken], controller.findAll);

    app.get(
        '/api/pitch-details/:id',
        [authJwt.verifyToken],
        controller.findOne
    );

    app.post(
        '/api/pitch-details/',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.Create
    );

    app.put(
        '/api/pitch-details/:id',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.Update
    );

    app.delete(
        '/api/pitch-details/:id',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.Delete
    );
};
