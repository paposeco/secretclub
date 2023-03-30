const Message = require("../models/message");
const Member = require("../models/member");
const async = require("async");
const he = require("he");
const { body, validationResult } = require("express-validator");

const decoder = function(messagecollection, user) {
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

exports.homepage_get = async function(req, res, next) {
  const pagenumber = req.params.pagenumber;
  if (pagenumber) {
    const numberpages = Number(pagenumber.substring(4));
    try {
      const totalmessages = Message.countDocuments({});
      // previous page last message timestamp
      // fetch docs multiplying the limit per page -1 and getting the timestamp for the last doc on the query? then query again with > timestamp and new limit
    } catch (err) {
      return next(err);
    }
  } else {
    const pass = req.session.passport;
    if (pass) {
      try {
        const member = await Member.findById(pass.user);
        const messages = await Message.find()
          .limit(3)
          .sort({ timestamp: -1 })
          .populate("message_author");
        const totalmessages = await Message.countDocuments({});
        const pagestoshow =
          Number(totalmessages) % 3 > 0
            ? Math.floor(Number(totalmessages) / 3) + 1
            : Number(totalmessages) / 3;
        const decodedThings = decoder(messages, member);
        res.render("index", {
          title: "Message board",
          messageboard: decodedThings[0],
          user: decodedThings[1],
          pagination: pagestoshow,
        });
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        const messages = await Message.find()
          .limit(3)
          .sort({ timestamp: -1 })
          .populate("message_author");
        const totalmessages = await Message.countDocuments({});
        const pagestoshow =
          Number(totalmessages) % 3 > 0
            ? Math.floor(Number(totalmessages) / 3) + 1
            : Number(totalmessages) / 3;
        const decodedThings = decoder(messages, false);
        res.render("index", {
          title: "Message board",
          messageboard: decodedThings[0],
          pagination: pagestoshow,
        });
      } catch (err) {
        return next(err);
      }
    }
  }
};

/* exports.homepage_get = async function(req, res, next) {
 *   const pass = req.session.passport;
 *   if (pass) {
 *     try {
 *       const member = await Member.findById(pass.user);
 *       const messages = await Message.find()
 *                                     .sort({ timestamp: -1 })
 *                                     .populate("message_author");
 *       const decodedThings = decoder(messages, member);
 *       res.render("index", {
 *         title: "Message board",
 *         messageboard: decodedThings[0],
 *         user: decodedThings[1],
 *       });
 *     } catch (err) {
 *       return next(err);
 *     }
 *   } else {
 *     try {
 *       const messages = await Message.find()
 *                                     .sort({ timestamp: -1 })
 *                                     .populate("message_author");
 *       const decodedThings = decoder(messages, false);
 *       res.render("index", {
 *         title: "Message board",
 *         messageboard: decodedThings[0],
 *       });
 *     } catch (err) {
 *       return next(err);
 *     }
 *   }
 * }; */

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
