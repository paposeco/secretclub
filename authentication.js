const passport = require("passport");
const Member = require("./models/member");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(async function(username, password, done) {
    try {
      const member = await Member.findOne({ username: username });
      if (!member) {
        return done(null, false, { message: "Incorrect username" });
      }
      /* bcrypt.compare(password, user.password, (err, res) => {
       *   if (res) {
       *     // passwords match! log user in
       *     return done(null, user);
       *   } else {
       *     // passwords do not match!
       *     return done(null, false, { message: "Incorrect password" });
       *   }
       * }); */
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

exports.loginuser = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureMessage: true,
  });
};
