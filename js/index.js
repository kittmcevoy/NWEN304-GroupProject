const express = require('express');
const app = express();
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const configDB = require('./database.js');

mongoose.connect(
    configDB.url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        console.log('connected');
    }
);
require('./passport')(passport);
require('dotenv/config');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    session({
        secret: 'aDamnGoodSecret',
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '..', 'public')));

const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

AWS.config.update({
  accessKeyId: process.env.access,
  secretAccessKey: process.env.secret,
  region: process.env.region,
});

s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: process.env.bucket,
      key: function (req, file, cb) {
          console.log(file);
          cb(null, file.originalname);
      },
  }),
});

require('./routes.js')(app, path, passport, upload);

app.listen(PORT, console.log(`Listening on port ${PORT}`));
