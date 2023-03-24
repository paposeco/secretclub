const async = require("async");
const { body, validationResult } = require("express-validator");
const Member = require("../models/member");
const bcrypt = require("bcryptjs");

exports.login_get = (req, res, next) => {
  res.render("log_in", { title: "Login", messages: req.session.messages });
};

exports.signup_get = (req, res, next) => {
  res.render("sign_up", { title: "Sign up" });
};

exports.signup_post = [
  body("firstname")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .isLength({ max: 100 })
    .withMessage("First name is required."),
  body("lastname")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .isLength({ max: 100 })
    .withMessage("First name is required."),
  body("email").isEmail().normalizeEmail().isLength({ min: 1 }),
  body("password").exists(),
  body("confirmpassword")
    .exists()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords don't match"),

  async function(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("sign_up", {
        errors: errors.array(),
        formvalues: req.body,
      });
      return;
    }

    try {
      const checkemail = await Member.find({ username: req.body.email }).exec();
      if (checkemail.length > 0) {
        res.render("sign_up", {
          title: "Sign up",
          errors: "Error: E-mail is already in use.",
          formvalues: req.body,
        });
        return;
      }
    } catch (err) {
      return next(err);
    }

    try {
      bcrypt.hash(req.body.password, 10, async function(err, hashedpassword) {
        if (err) {
          return next(err);
        }
        const member = new Member({
          first_name: req.body.firstname,
          last_name: req.body.lastname,
          username: req.body.email,
          password: hashedpassword,
          membership: "Outsider",
          admin: false,
        });
        try {
          await member.save();
          res.render("index", {
            user: member,
          });
        } catch (err) {
          return next(err);
        }
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.join_club_get = (req, res, next) => {
  if (req.session.passport) {
    res.render("join_club", (title = "Join the club"));
  } else {
    res.redirect("/");
  }
};

exports.join_club_post = (req, res, next) => { };

exports.membership = async function(req, res, next) {
  if (!req.session.passport) {
    res.redirect("/");
  }
  try {
    const member = await Member.findById(req.session.passport.user);
    res.render("user_detail", { user: member });
  } catch (err) {
    return next(err);
  }
};

exports.logout_get = (req, res, next) => {
  res.render("log_out", { title: "Logout?" });
};
