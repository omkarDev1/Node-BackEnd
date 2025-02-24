const express = require("express");
const router = express.Router();
const {CreateMessage ,getMessages}= require("../controllers/messageController")
const verifyTokenUser = require("../routes/middlewares/verifyToken")

router.route("/SendMessage").post(verifyTokenUser,CreateMessage);
router.route("/getMessages").get(verifyTokenUser,getMessages);

module.exports = router;