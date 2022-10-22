var LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require("passport-google-oauth2").Strategy;

var User = require("./User");
var authConfig = require("./auth");

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
      },
      function (req, username, password, done) {
        process.nextTick(function () {
          User.findOne({ 'local.username': username }, function (err, user) {
            if (err) {
              return done(err);
            }
            if (user) {
              return done(null, false, console.log("Username already taken"));
            } else {
              var newUser = new User();
              newUser.local.username = username;
              newUser.local.password = newUser.generateHash(password);
              newUser.local.email = req.body.email;
              newUser.save(function (err) {
                if (err) {
                  throw err;
                } else {
                  return done(null, newUser);
                }
              });
            }
          });
        });
      }
    )
  );

  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, username, password, done) {
    User.findOne({'local.username': username}, function(err, user) {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(null, false, console.log('No user found.'))
      }
      if (!user.validPassword(password)) {
        return done(null, false, console.log('Wrong username or password'))
      } else {
        return done(null, user)
      }
    })
  }))

  passport.use(new GoogleStrategy({
    clientID:     authConfig.googleAuth.clientId,
    clientSecret: authConfig.googleAuth.clientSecret,
    callbackURL:  authConfig.googleAuth.callbackUrl,
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      User.findOne({ 'google.id': profile.id }, function(err, user) {
        if (err) {
          return done(err)
        }
        if (user) {
          return done(null, user)
        } else {
          var newUser = new User()
          newUser.google.id = profile.id
          newUser.google.token = profile.token
          newUser.google.username = profile.displayName
          newUser.google.email = profile.emails[0].value

          newUser.save(function(err) {
            if (err) {
              throw err
            } else {
              return done(null, newUser)
            }
          })
        }
      })
    })
  }))
};