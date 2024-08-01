const express = require("express");
const router = express.Router();
const {CreateUser} = require("../controllers/authController")

router.route("/Login").post(CreateUser);
module.exports = router;