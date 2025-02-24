const express = require("express");
const router = express.Router();
const {CreateUser ,SignInUser,VerifyRegisterOTP,ResendRegisterOTP ,getAllUsers} = require("../controllers/authController")
const {EmailVerify, OtpVerify, ResendOTP } = require("../controllers/verificationController")
const verifyTokenUser = require("../routes/middlewares/verifyToken")

// const {CreateMessage ,getMessages}= require("../controllers/messageController")

router.route("/Register").post(CreateUser);
router.route("/Login").post(SignInUser);
router.route("/RegisterOTPVerify").post(VerifyRegisterOTP)
router.route("/ResendRegisterOTP").post(ResendRegisterOTP)
router.route("/EmailVerify").post(verifyTokenUser,EmailVerify);
router.route("/OtpVerify").post(verifyTokenUser,OtpVerify);
router.route("/ResendOTP").post(verifyTokenUser,ResendOTP);
router.route("/getAllUsers").get(verifyTokenUser,getAllUsers);



//Message route
// router.route("/SendMessage").post(CreateMessage);
// router.route("/getMessages").get(getMessages);


module.exports = router;