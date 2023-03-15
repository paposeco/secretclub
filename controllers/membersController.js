const async = require("async");
const { body, validationResult } = require("express-validator");
const Member = require("../models/member");
const bcrypt = require("bcryptjs");

exports.login_get = (req, res, next) => {
  res.render("log_in", { title: "Login" });
};

exports.login_post = (req, res, next) => { };

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
      const checkemail = await Member.find({ email: req.body.email }).exec();
      if (checkemail.length > 0) {
        res.render("sign_up", {
          errors: "E-mail is already in use.",
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
        // faltam as mensagens e montes de coisas do passaport
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

exports.join_club_get = (req, res, next) => { };

exports.join_club_post = (req, res, next) => { };

exports.membership = (req, res, next) => { };
