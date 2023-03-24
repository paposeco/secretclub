var express = require("express");
var router = express.Router();
const passport = require("passport");
const Member = require("../models/member");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(async function verify(username, password, done) {
    try {
      const member = await Member.findOne({ username: username });
      if (!member) {
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, member.password, (err, res) => {
        if (res) {
          // passwords match
          return done(null, member);
        } else {
          return done(null, false, { message: "Wrong password" });
        }
      });
    } catch (err) {
      if (err) {
        return done(err);
      }
    }
  })
);

passport.serializeUser(function(member, done) {
  done(null, member.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const member = Member.findById(id);
    return done(null, member);
  } catch (err) {
    return done(err);
  }
});

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureMessage: true,
  })
);

router.post("/log-out", function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
