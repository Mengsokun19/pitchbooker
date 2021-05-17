const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const User = require('../user_account/models/user.model');

verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'];

    if (!token) {
        token = req.params.token ? req.params.token : req.body.token;
    }

    if (!token) {
        return res.status(403).send({
            message: 'No Token Provided!',
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: 'Unauthorized!',
            });
        }
        req.userId = decoded.id;
        req.username = decoded.username;
        req.authorities = decoded.authorities;
        next();
    });
};

isAdmin = (req, res, next) => {
    User.findByPk(req.userId).then((user) => {
        user.getRoles().then((roles) => {
            const verifyRole = !!roles.find((role) => {
                return role.name === 'admin';
            });
            if (verifyRole) {
                next();
                return;
            }

            res.status(403).send({
                message: 'Require Admin Role',
            });
            return;
        });
    });
};

isClubOwner = (req, res, next) => {
    User.findBy(req.userId).then((user) => {
        user.getRoles().then((roles) => {
            const verifyRole = !!roles.fiind((role) => {
                return role.name === 'club_owner';
            });
            if (verifyRole) {
                next();
                return;
            }

            res.status(403).send({
                message: 'Required Club Owner Role!',
            });
        });
    });
};

isClubOwnerOrAdmin = (req, res, next) => {
    User.findByPk(req.userId).then((user) => {
        user.getRoles().then((roles) => {
            const verifyRole = !!roles.find((role) => {
                return (role.name === 'club_owner') | (role.name === 'admin');
            });
            if (verifyRole) {
                next();
                return;
            }

            res.status(403).send({
                message: 'Required Club Owner Role or Admin Role!',
            });
        });
    });
};

isAccountExist = (req, res, next) => {
    User.findOne({ where: { email: req.body.email } }).then((user) => {
        if (!user) {
            res.status(400).send({ message: 'This user Does not Exist!' });
            return;
        }
        req.token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 600,
        });
        next();
    });
};

const authJwt = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isClubOwner: isClubOwner,
    isClubOwnerOrAdmin: isClubOwnerOrAdmin,
    isAccountExist: isAccountExist,
};

module.exports = authJwt;
