const express = require("express");
const router = express.Router();
const {CreateUser ,SignInUser} = require("../controllers/authController")

router.route("/Login").post(CreateUser);
router.route("/Signin").post(SignInUser);
module.exports = router;