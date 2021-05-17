const { authJwt, verifyPayway } = require('../middleware');
const controller = require('./controller');

module.exports = (app) => {
    app.use((req, res, next) => {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    app.get('/api/payways/', [authJwt.verifyToken], controller.findAll);

    app.get('/api/payways/:id', [authJwt.verifyToken], controller.findOne);

    app.post(
        '/api/payways/',
        [authJwt.verifyToken, verifyPayway.checkDuplicatePayway],
        controller.Create
    );

    app.put('/api/payways/:id', [authJwt.verifyToken], controller.Update);

    app.delete('/api/payways/:id', [authJwt.verifyToken], controller.Delete);
};
