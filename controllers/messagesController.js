const Message = require("../models/message");
const Member = require("../models/member");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.homepage_get = async function(req, res, next) {
  const pass = req.session.passport;
  if (pass) {
    try {
      const member = await Member.findById(pass.user);
      const messages = await Message.find()
        .sort({ timestamp: 1 })
        .populate("message_author");
      res.render("index", {
        title: "Secret club message board",
        messageboard: messages,
        user: member,
      });
    } catch (err) {
      return next(err);
    }
  } else {
    try {
      const messages = await Message.find()
        .sort({ timestamp: 1 })
        .populate("message_author");
      res.render("index", {
        title: "Secret club message board",
        messageboard: messages,
      });
    } catch (err) {
      return next(err);
    }
  }
};

exports.homepage_post = async function(req, res, next) {
  const messageId = req.body.deletemessage;
  if (messageId === undefined) {
    res.redirect("/");
  }
  try {
    await Message.findByIdAndDelete(messageId);
    res.redirect("/");
  } catch (err) {
    return next(err);
  }
};

exports.create_message_get = async function(req, res, next) {
  if (!req.session.passport) {
    res.redirect("/");
  } else {
    const userid = req.session.passport.user;
    try {
      const memberinfo = await Member.findById(userid);
      res.render("send_message", { title: "Send message", user: memberinfo });
    } catch (err) {
      return next(err);
    }
  }
};

exports.create_message_post = [
  body("messagetitle")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Message title is required")
    .isLength({ max: 100 }),
  body("newmessage")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Message title is required")
    .isLength({ max: 300 })
    .withMessage("Maximum 300 characters exceeded."),

  async function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("send_message", {
        errors: errors.array(),
        formvalues: req.body,
        username: req.body.usernameforpost,
      });
      return;
    }

    if (!req.session.passport) {
      res.redirect("/log-in");
    } else {
      const userid = req.session.passport.user;
      try {
        const message = new Message({
          title: req.body.messagetitle,
          message_content: req.body.newmessage,
          message_author: userid,
        });
        await message.save();
        res.redirect("/");
      } catch (err) {
        return next(err);
      }
    }
  },
];
