const ROLES = ['user', 'admin', 'club_owner'];
const User = require('../user_account/models/user.model');

checkDuplicateUsernameOrEmail = (req, res, next) => {
  User.findOne({
    where: {
      username: req.body.username,
    },
  }).then((user) => {
    if (user) {
      res.status(400).send({
        message: 'Failed! Username is already Existed!',
      });
      return;
    }

    User.findOne({
      where: {
        email: req.body.email,
      },
    }).then((user) => {
      if (user) {
        res.status(400).send({
          message: 'Failed! Email is already in use!',
        });
        return;
      }

      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let role of req.body.roles) {
      if (!ROLES.includes(role)) {
        res.status(400).send({
          message: 'Failed! Role does not exist = ' + role,
        });
        return;
      }
    }
  }
  next();
};

checkTermAccepted = (req, res, next) => {
  if (!req.body.accepted) {
    res.status(400).send({
      message: 'Failed! You need to accept the Term and Conditions.',
    });
    return;
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkRolesExisted: checkRolesExisted,
  checkTermAccepted: checkTermAccepted,
};

module.exports = verifySignUp;
