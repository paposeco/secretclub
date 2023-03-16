var express = require("express");
var router = express.Router();
const members_controller = require("../controllers/membersController");
const messages_controller = require("../controllers/messagesController");
const authentication = require("../authentication");

/* GET home page. */
router.get("/", messages_controller.homepage);

router.get("/log-in", members_controller.login_get);
router.post("/log-in", authentication.loginuser);

router.get("/sign-up", members_controller.signup_get);
router.post("/sign-up", members_controller.signup_post);

router.get("/join-club", members_controller.join_club_get);
router.post("/join-club", members_controller.join_club_post);

router.get("/:memberid/sendmessage", messages_controller.create_message_get);
router.post("/:memberid/sendmessage", messages_controller.create_message_post);

router.get("/:memberid/membership", members_controller.membership);

module.exports = router;
