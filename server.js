const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

var corsOption = {
  origin: 'http://localhost:8080',
};

app.use(cors(corsOption));

// Parse Requests of content type - application/json
app.use(bodyParser.json());

// Parser Requests of content type - application/x-www-form-urlencoded
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
  console.log(`Server is running on port ${PORT}`);
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
    // initial();
  })
  .catch((err) => {
    console.log(err.message);
  });

initial = async () => {
  await Role.bulkCreate(default_datas.roles);

  await Membership.bulkCreate(default_datas.memberships);

  default_datas.admin.password = bcrypt.hashSync(
    default_datas.admin.password,
    8
  );

  await User.create(default_datas.admin).then((user) => {
    user.setRoles(3);
  });

  for (let owner of default_datas.club_owners) {
    owner.password = bcrypt.hashSync(owner.password, 8);
    await User.create(owner).then((user) => {
      user.setRoles([2]);
    });
  }

  await Sport_clubs.bulkCreate(default_datas.clubs);
  await Pitch_details.bulkCreate(default_datas.pitches);
  await Week_parts.bulkCreate(default_datas.week_parts_3);
  await Day_parts.bulkCreate(default_datas.day_parts);
  await Pitch_price.bulkCreate(default_datas.pitch_prices_3);
};
