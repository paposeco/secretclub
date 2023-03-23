const Message = require("../models/message");
const Member = require("../models/member");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.homepage = function(req, res, next) {
  const loggedin = req.session.passport === undefined ? false : true;
  res.render("index", { title: "Secret club message board", user: loggedin });
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

exports.create_message_post = (req, res, next) => { };
