const { verifySignUp, authJwt } = require('../../middleware');
const controller = require('../controllers/auth.controller');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    app.post(
        '/api/auth/signup',
        [
            verifySignUp.checkDuplicateUsernameOrEmail,
            verifySignUp.checkRolesExisted,
            verifySignUp.checkTermAccepted,
        ],
        controller.signup
    );

    app.post('/api/auth/signin', controller.signin);

    app.get(
        '/api/auth/verify-account/:token',
        [authJwt.verifyToken],
        controller.verify_account
    ),
        app.put(
            'api/auth/reset-password',
            [authJwt.verifyToken],
            controller.reset_password
        );

    app.post(
        '/api/auth/request-reset-password',
        [authJwt.isAccountExist],
        controller.request_reset_password
    );

    app.get(
        '/api/auth/reset-password/:token',
        [authJwt.verifyToken],
        controller.accept_reset_password
    );
};
