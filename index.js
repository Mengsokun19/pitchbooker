const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

var corsOption = {
  origin: 'http://locahost:8081',
};

app.use(cors(corsOption));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PitchBooker Application.' });
});

require('./app/user_account/routes/auth.routes')(app);
require('./app/user_account/routes/user.routes')(app);
require('./app/booking_detail/route')(app);
require('./app/day_part/route')(app);
require('./app/payway/route')(app);
require('./app/pitch_detail/route')(app);
require('./app/pitch_price/route')(app);
require('./app/sport_club/route')(app);
require('./app/waiting_room/route')(app);
require('./app/week_part/route')(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

var bcrypt = require('bcryptjs');
const User = require('./app/user_account/models/user.model');
const Role = require('./app/user_account/models/role.model');
const Membership = require('./app/user_account/models/membership.model');
const sequelize = require('./app/config/db.config');
const Day_parts = require('./app/day_part/model');
const Week_parts = require('./app/week_part/model');
const Pitch_price = require('./app/pitch_price/model');
const default_datas = require('./default_data.json');
const Sport_clubs = require('./app/sport_club/model');
const Pitch_details = require('./app/pitch_detail/model');

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Drop and Resync DB.');
  })
  .catch((err) => {
    console.log(err.message);
  });

initial = async () => {
  for (let role of default_datas.roles) {
    await Role.create(role);
  }

  for (let membership of default_datas.memberships) {
    await Membership.create(membership);
  }

  default_datas.admin.password = bcrypt.hashSync(
    default_datas.admin.password,
    8
  );

  await User.create(default_datas.admin).then((user) => {
    user.setRoles([3]);
  });

  for (let owner of default_datas.club_owners) {
    owner.password = bcrypt.hashSync(owner.password, 8);
    await User.create(owner).then((user) => {
      user.setRoles([2]);
    });
  }

  for (let club of default_datas.clubs) {
    await Sport_club.create(club);
  }

  for (let pitch of default_datas.pitches) {
    await Pitch_detail.create(pitch);
  }

  for (let week_part of default_datas.week_parts_3) {
    await Week_parts.create(week_part);
  }

  for (let day_part of default_datas.day_parts) {
    await Day_parts.create(day_part);
  }

  for (let pitch_price of default_datas.pitch_prices_3) {
    await Pitch_price.create(pitch_price);
  }
};
