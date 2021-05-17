const { authJwt } = require('../middleware');
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
        '/api/day-parts/',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.findAll
    );
    app.get(
        '/api/day-parts/:id',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.findOne
    );
    app.post(
        '/api/day-parts',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.Create
    );
    app.put(
        '/api/day-parts/:id',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.Update
    );
    app.get(
        '/api/day-parts/:id',
        [authJwt.verifyToken, authJwt.isClubOwnerOrAdmin],
        controller.Delete
    );
};
