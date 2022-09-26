const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const path = require("path");
const app = express();
const PORT = 3000;
const users = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const initialisePassport = require("./passport-config");
initialisePassport(
  passport,
  (username) => users.find((user) => user.username === username),
  (id) => users.find((user) => user.id === id)
);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

/* Home page routes */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views/index.html"));
});

/* Get all users */

app.get("/users", (req, res) => {
  res.json(users);
});

/* Login page routes */

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views/login.html"));
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.post("/signup", async (req, res) => {
  try {
    const pwrd = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      email: req.body.email,
      username: req.body.username,
      password: pwrd,
    });
    res.sendFile(path.join(__dirname, "..", "views/login.html"));
  } catch (e) {
    console.log(e);
  }
  console.log(users);
});

app.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

/* Add to above methods to check if user is logged in */

function checkNotAuth(req, res, next) {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, "..", "views/index.html"));
  }
  next();
}

app.listen(process.env.PORT || PORT, console.log(`Listening on port ${PORT}`));
