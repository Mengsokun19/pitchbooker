const nodemailer = require('nodemailer');
const { email_conf } = require('../../config.json');

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env;
} else {
    secrets = email_conf;
}

const emailService = nodemailer.createTransport({
    host: secrets.HOST,
    port: secrets.PORT,
    secure: true,
    auth: {
        user: secrets.USERNAME,
        pass: secrets.PASSWORD,
    },
});

module.exports = emailService;
