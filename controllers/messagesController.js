const Message = require("../models/message");
const Member = require("../models/member");
const async = require("async");
const he = require("he");
const { body, validationResult } = require("express-validator");

const decoder = function (messagecollection, user) {
  let messagearray = [];
  messagecollection.forEach((message) => {
    message.title = he.decode(message.title);
    message.message_content = he.decode(message.message_content);
    messagearray.push(message);
  });
  if (!user) {
    return [messagearray, false];
  }
  user.fullname = he.decode(user.fullname);
  return [messagearray, user];
};

exports.homepage_get = async function (req, res, next) {
  const pagenumber = req.params.pagenumber;
  const pass = req.session.passport;
  // finds messages to display, limited to 10
  let messages;
  const messagesLimit = 10;
  try {
    if (pagenumber) {
      // only find messages with a timestamp older than the last message on the previous page
      const numberpages = Number(pagenumber.substring(4));
      const prevLimit = messagesLimit * (numberpages - 1);
      const prevPage = await Message.find({})
        .limit(prevLimit)
        .sort({ timestamp: -1 });
      const lastMessage = prevPage[prevPage.length - 1];
      const lastMessageTimestamp = lastMessage.timestamp;
      // timestamp is being sorted ascending from db, because the messages are then being decoded and the array is reversed there
      messages = await Message.find({
        timestamp: { $lt: lastMessageTimestamp },
      })
        .limit(messagesLimit)
        .sort({ timestamp: -1 })
        .populate("message_author");
    } else {
      messages = await Message.find()
        .limit(messagesLimit)
        .sort({ timestamp: -1 })
        .populate("message_author");
    }
  } catch (err) {
    return next(err);
  }
  // renders according to type of user
  if (pass) {
    try {
      const member = await Member.findById(pass.user);
      const totalmessages = await Message.countDocuments({});
      const pagestoshow =
        Number(totalmessages) % messagesLimit > 0
          ? Math.floor(Number(totalmessages) / messagesLimit) + 1
          : Number(totalmessages) / messagesLimit;
      const decodedThings = decoder(messages, member);
      res.render("index", {
        title: "Message board",
        messageboard: decodedThings[0],
        user: decodedThings[1],
        pagination: pagestoshow,
        currentpage: pagenumber === undefined ? "1" : pagenumber.substring(4),
      });
    } catch (err) {
      return next(err);
    }
  } else {
    try {
      const totalmessages = await Message.countDocuments({});
      const pagestoshow =
        Number(totalmessages) % messagesLimit > 0
          ? Math.floor(Number(totalmessages) / messagesLimit) + 1
          : Number(totalmessages) / messagesLimit;
      const decodedThings = decoder(messages, false);
      res.render("index", {
        title: "Message board",
        messageboard: decodedThings[0],
        pagination: pagestoshow,
        currentpage: pagenumber === undefined ? "1" : pagenumber.substring(4),
      });
    } catch (err) {
      return next(err);
    }
  }
};

exports.homepage_post = async function (req, res, next) {
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

exports.create_message_get = async function (req, res, next) {
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

  async function (req, res, next) {
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
