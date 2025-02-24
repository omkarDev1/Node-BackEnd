const express = require("express");
const router = express.Router();
const {createProduct,getProductsByCategory,getSellerAllProducts,getSellerAllPurchases,confirmedBuyProduct ,verifyBuyOtp}= require("../controllers/sellerController")
const verifyTokenUser = require("../routes/middlewares/verifyToken")

router.route("/addProduct").post(verifyTokenUser,createProduct);
router.route("/getProduct").get(verifyTokenUser,getProductsByCategory);
router.route("/getSellerAllProducts").get(verifyTokenUser,getSellerAllProducts);
router.route("/getSellerAllPurchases").get(verifyTokenUser,getSellerAllPurchases);
router.route("/confirmedBuyProduct").post(verifyTokenUser,confirmedBuyProduct);
router.route("/verifyBuyOtp").post(verifyTokenUser,verifyBuyOtp);

module.exports = router;