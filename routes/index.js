var express = require("express");
var router = express.Router();
const members_controller = require("../controllers/membersController");
const messages_controller = require("../controllers/messagesController");

/* GET home page. */

router.get("/", messages_controller.homepage_get);
router.get("/messageboard/:pagenumber", messages_controller.homepage_get);
router.post("/", messages_controller.homepage_post);

router.get("/log-in", members_controller.login_get);
router.get("/log-out", members_controller.logout_get);

router.get("/sign-up", members_controller.signup_get);
router.post("/sign-up", members_controller.signup_post);

router.get("/join-club", members_controller.join_club_get);
router.post("/join-club", members_controller.join_club_post);

router.get("/sendmessage", messages_controller.create_message_get);
router.post("/sendmessage", messages_controller.create_message_post);

router.get("/membership", members_controller.membership);

router.get("/become-admin", members_controller.become_admin_get);
router.post("/become-admin", members_controller.become_admin_post);

module.exports = router;
