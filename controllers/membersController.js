const async = require("async");
const { body, validationResult } = require("express-validator");
const Member = require("../models/member");
const bcrypt = require("bcryptjs");
const he = require("he");
require("dotenv").config();

exports.login_get = (req, res, next) => {
  res.render("log_in", { title: "Log in", messages: req.session.messages });
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
          res.redirect("/");
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
    res.render("join_club", { title: "Join the club" });
  } else {
    res.redirect("/");
  }
};

exports.join_club_post = [
  body("answerquestion")
    .isLength({ min: 1 })
    .withMessage("Selecting a color is required."),
  async function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("join_club", {
        title: "Join the club",
        errors: errors.array(),
      });
      return;
    }
    if (req.body.answerquestion !== "Black") {
      res.render("join_club", {
        title: "Join the club",
        wrongcolor: true,
      });
      return;
    }
    if (req.session.passport === undefined) {
      res.redirect("/");
      return;
    }
    try {
      const userid = req.session.passport.user;
      const doc = await Member.findById(userid);
      doc.membership = "Insider";
      await doc.save();
      res.redirect("/membership");
    } catch (err) {
      return next(err);
    }
  },
];

exports.membership = async function(req, res, next) {
  if (!req.session.passport) {
    res.redirect("/");
  }
  try {
    const member = await Member.findById(req.session.passport.user);
    member.fullname = he.decode(member.fullname);
    res.render("user_detail", { user: member });
  } catch (err) {
    return next(err);
  }
};

exports.logout_get = (req, res, next) => {
  res.render("log_out", { title: "Logout?" });
};

exports.become_admin_get = (req, res, next) => {
  if (req.session.passport === undefined) {
    res.redirect("/");
    return;
  }
  res.render("become_admin", { title: "Get administrator privileges" });
};

exports.become_admin_post = [
  body("adminsecretcode")
    .escape()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Secret code is required.")
    .isLength({ max: 24 })
    .withMessage("Secret code is too long."),

  async function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("become_admin", {
        title: "Get administrator privileges",
        errors: errors.array(),
      });
    }
    // check password
    const secretcode = process.env.SECRET_CLUB_ADMIN;
    if (secretcode === req.body.adminsecretcode) {
      try {
        const userid = req.session.passport.user;
        const doc = await Member.findById(userid);
        doc.admin = true;
        await doc.save();
        res.redirect("/membership");
      } catch (err) {
        return next(err);
      }
    } else {
      res.render("become_admin", {
        title: "Get administrator privileges",
        errors: [{ msg: "Wrong password!" }],
      });
    }
  },
];
