const express = require("express");
const app = express();
const path = require("path");
const passport = require("passport");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

var configDB = require("./database.js");
mongoose.connect(configDB.url);
require("./passport")(passport);

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "aDamnGoodSecret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "..", "public")));

require("./routes.js")(app, path, passport);

app.listen(PORT, console.log(`Listening on port ${PORT}`));
