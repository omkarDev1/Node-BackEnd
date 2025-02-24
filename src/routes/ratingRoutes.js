const express = require("express");
const router = express.Router();
const verifyTokenUser = require("../routes/middlewares/verifyToken");
const {Ratingapi , averagerating} = require("../controllers/ratingController")

router.route("/Rating").post(verifyTokenUser,Ratingapi);
router.route("/averagerating").get(verifyTokenUser,averagerating);

module.exports = router;