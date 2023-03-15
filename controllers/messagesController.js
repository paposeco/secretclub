const Message = require("../models/message");
const Member = require("../models/member");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.homepage = function(req, res, next) {
  console.log("wtf is going on");
  res.render("index", { title: "Teste" });
};

exports.create_message_get = (req, res, next) => { };

exports.create_message_post = (req, res, next) => { };
