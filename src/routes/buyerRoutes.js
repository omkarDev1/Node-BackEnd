const express = require("express");
const router = express.Router();
const verifyTokenUser = require("../routes/middlewares/verifyToken")
const {buyProduct,getBuyProduct}=require("../controllers/buyerController")


router.route("/buyProduct").post(verifyTokenUser,buyProduct);
router.route("/getBuyProduct").get(verifyTokenUser,getBuyProduct);

module.exports = router;