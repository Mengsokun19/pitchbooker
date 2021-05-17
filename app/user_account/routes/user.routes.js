const { authJwt } = require('../../middleware');
const controller = require('../controllers/user.controller');

module.exports = (app) => {
    app.use((req, res, next) => {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    app.get('/api/user/', [authJwt.verifyToken], controller.findAll);

    app.get('/api/user/:id', [authJwt.verifyToken], controller.findOne);

    app.put('/api/user/:id', [authJwt.verifyToken], controller.Update);

    app.delete('/api/user/:id', [authJwt.verifyToken], controller.Delete);

    app.get('/api/test/user', [authJwt.verifyToken], controller.userBoard);

    app.get('/api/test/mod', [authJwt.verifyToken], controller.clubOwnerBoard);

    app.get('/api/test/admin', [authJwt.verifyToken], controller.adminBoard);
};
