const { authJwt } = require('../middleware');
const controller = require('./controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token,Origin, Content-Type, Accept'
    );
    next();
  });

  app.get('/api/waiting-rooms/', [authJwt.verifyToken], controller.findAll);

  app.get('/api/waiting-rooms/:id', [authJwt.verifyToken], controller.findOne);

  app.post('/api/waiting-rooms/', [authJwt.verifyToken], controller.Update);

  app.delete(
    '/api/waiting-rooms/:id',
    [authJwt.verifyToken],
    controller.Delete
  );
};
