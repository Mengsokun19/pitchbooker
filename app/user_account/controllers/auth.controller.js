const config = require('../../config/auth.config');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Membership = require('../models/membership.model');
const emailService = require('../../config/mailer.config');
const { Op } = require('sequelize');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const { Connection } = require('pg');
const authRoutes = require('../routes/auth.routes');

exports.signup = (req, res) => {
    var data = req.body;
    data.password = bcrypt.hashSync(req.body.password, 8);
    User.create(data)
        .then(async (user) => {
            if (req.body.roles) {
                Role.findAll({
                    where: { name: { [Op.or]: req.body.roles } },
                }).then((roles) => {
                    user.setRoles(roles);
                });

                Membership.findOne({
                    where: { name: req.body.membership },
                }).then((membership) => {
                    user.setMembership(membership);
                });

                var token = jwt.sign({ id: user.id }, config.secret, {
                    expiresIn: 600,
                });

                const baseUrl =
                    req.protocol +
                    '://' +
                    req.get('host') +
                    '/api/auth/verify-account/' +
                    token;
                const data = {
                    from: 'noreply@pitchbooker.com',
                    to: req.body.email,
                    subject: 'Confirm your email and Activate your account',
                    text: `Please use the following code within the next 10mns to reset your password on your APP: test code`,
                    html: `<p>Please use your following link within the next 10mns to activate your ACCOUNT: <strong>${baseUrl}</strong></p>`,
                };
                await emailService.sendMail(data);
                res.status(200).send({
                    message: 'Please check your email and verify your account.',
                });
            } else {
                user.setRoles([1]).then(() => {
                    res.send({ message: 'User was registered successfully!' });
                });
            }
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.signin = (req, res) => {
    User.findOne({ where: { username: req.body.username } })
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: 'User Not Found!' });
            }
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            if (!passwordIsValid) {
                return res
                    .status(401)
                    .send({ Token: null, message: 'Invalid Password!' });
            }
            var authorities = [];
            user.getRoles().then((roles) => {
                for (let role of roles) {
                    authorities.push('ROLE_' + role.name.toUpperCase());
                }
                var token = jwt.sign(
                    {
                        id: user.id,
                        username: user.username,
                        authorities: authorities,
                    },
                    config.secret,
                    { expiresIn: 86400 }
                );
                res.status(200).send({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    Token: token,
                });
            });
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

exports.verify_account = (req, res) => {
    const id = req.userId;
    User.findOne({ where: { id: id } }).then(async (user) => {
        user.status = 'active';
        await user.save();
        res.status(200).send({ message: 'Account activated Succcessfully!' });
    });
};

exports.reset_password = (req, res) => {
    if (res.body.password !== req.body.repassword) {
        res.status(400).send({ message: 'Password Not Match!' });
        return;
    }
    const new_pwd = bcrypt.hashSync(req.body.password, 8);
    User.findOne({ where: { id: req.userId } }).then(async (user) => {
        user.password = new_pwd;
        await user.save();
        res.status(200).send({
            message: 'New password activated Successfully!',
        });
    });
};

exports.request_reset_password = async (req, res) => {
    const baseUrl =
        req.protocol + '://' + req.get('host') + '/api/auth/reset-password';
    const data = {
        from: 'noreply@pitchbooker.com',
        to: req.body.email,
        subject: 'Renew your password',
        text: ``,
        html: `<p>Please use the following <strong>link</strong> and below <strong>token</strong> within the next 10 minutes to reset your password: <strong>${baseUrl}</strong></p><br>
    Token: <strong>${req.token}</strong>`,
    };
    await emailService.sendMail(data);
    res.status(200).send({
        message: 'Link to reset your password was send to your email.',
    });
};

exports.accept_reset_password = (req, res) => {
    res.status(200).send({ message: 'Access Granted.' });
};
