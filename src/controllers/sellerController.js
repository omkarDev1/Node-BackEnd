const statusCode = require('../helper/statusCode')
const Product = require("../routes/models/sellerModel")
const User = require("../routes/models/userModel")
const purchase = require("../routes/models/purchaseModel")
const Status = require("../routes/models/statusModal")
const { generateOTP, sendOTP } = require("../utils/otpUtils")

let otpStore = {};

const createProduct = async (req, res) => {
    try {
        const { productName, category, price, quantity, endDate, image } = req.body;
        const userid = req.user.userId;
        console.log("userid", userid);


        // Validate the required fields
        if (!productName || !category || !price || !quantity || !endDate || !image) {
            return res.status(statusCode.BAD_REQUEST).json({
                status: statusCode.BAD_REQUEST,
                success: false,
                message: "Please fill all the required fields: productName, category, price, quantity, endDate, and image."
            });
        }

        // Create new product
        const newProduct = await Product.create({
            productName,
            category,
            price,
            quantity,
            endDate,
            image,
            userid
        });

        // Send success response
        res.status(statusCode.OK).json({
            status: statusCode.OK,
            success: true,
            message: "Product created successfully",
            data: newProduct
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            status: statusCode.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Internal server error"
        });
    }
};

const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.query;  // Get category from query params

        // Find products, if category is provided, filter by category, otherwise get all products
        const filter = category ? { category } : {};

        const products = await Product.find(filter).populate('userid', 'username email mobileNumber');

        // If no products are found, send an appropriate response
        if (products.length === 0) {
            return res.status(statusCode.OK).json({
                status: statusCode.OK,
                success: true,
                message: "No products found",
                data: []
            });
        }

        // Send success response with the found products
        res.status(statusCode.OK).json({
            status: statusCode.OK,
            success: true,
            message: "Products retrieved successfully",
            data: products
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            status: statusCode.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Internal server error"
        });
    }
};

const getSellerAllProducts = async (req, res) => {
    try {
        // Assuming you get the seller's user ID from the request (either from req.user or params)
        const userid = req.user.userId; // Or req.params.userid if passed in the URL

        console.log("Fetching products for seller with userid:", userid);

        // Find products based on seller's user ID
        const sellerProducts = await Product.find({ userid });

        // Check if the seller has any products
        if (!sellerProducts || sellerProducts.length === 0) {
            return res.status(statusCode.NOT_FOUND).json({
                status: statusCode.NOT_FOUND,
                success: false,
                message: "No products found for this seller."
            });
        }

        // Send success response with seller's products
        res.status(statusCode.OK).json({
            status: statusCode.OK,
            success: true,
            message: "Seller products retrieved successfully.",
            data: sellerProducts
        });
    } catch (error) {
        console.error("Error fetching seller products:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            status: statusCode.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Internal server error"
        });
    }
};

const getSellerAllPurchases = async (req, res) => {
    try {
        // Assuming you get the seller's user ID from the request (either from req.user or params)
        const sellerID = req.user.userId; // Or req.params.sellerID if passed in the URL

        console.log("Fetching purchases for seller with sellerID:", sellerID);

        // Find purchases based on the seller's user ID and populate buyer data from Loginuser model
        const sellerPurchases = await purchase.find({ sellerID }).populate('buyerId', 'username email mobileNumber address ,latitude ,longitude').populate('productId', 'productName category price quantity image');; // Populate 'buyerId' with 'name' and 'email' from Loginuser model

        // Check if the seller has any purchases
        if (!sellerPurchases || sellerPurchases.length === 0) {
            return res.status(statusCode.NOT_FOUND).json({
                status: statusCode.NOT_FOUND,
                success: false,
                message: "No purchases found for this seller."
            });
        }
        const purchasesWithStatus = await Promise.all(
            sellerPurchases.map(async (purchase) => {
                const status = await Status.findOne({ productId: purchase.productId }).select('currentStatus'); // Get status by productId

                return {
                    ...purchase.toObject(), // Convert the purchase document to a plain object
                    status: status ? status.currentStatus : 'Pending' // Include the current status or default to 'Pending'
                };
            })
        );
        // Send success response with purchases and populated buyer data
        res.status(statusCode.OK).json({
            status: statusCode.OK,
            success: true,
            message: "Seller purchases with buyer data retrieved successfully.",
            data: sellerPurchases
        });
    } catch (error) {
        console.error("Error fetching seller purchases with buyer data:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            status: statusCode.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Internal server error"
        });
    }
};

const confirmedBuyProduct = async (req, res) => {
    try {
        const { buyerEmail, purchaseId } = req.body;

        // Generate a random OTP
        const generatedOTP = generateOTP();

        // Send OTP to the buyer's email using the utility function
        await sendOTP(buyerEmail, generatedOTP);
        otpStore[purchaseId] = generatedOTP;

        // Optionally, log the OTP for verification purposes (remove in production)
        console.log(`Generated OTP for ${buyerEmail} on product ${purchaseId}: ${generatedOTP}`);

        res.status(200).json({
            success: true,
            message: "OTP sent to the buyer's email."
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const verifyBuyOtp = async (req, res) => {
    try {
        const { purchaseId, otp } = req.body;

        // Retrieve the generated OTP from the in-memory store
        const generatedOTP = otpStore[purchaseId];

        console.log(`Received OTP: ${otp}, Generated OTP: ${generatedOTP}`);

        // Check if generatedOTP exists in the store
        if (!generatedOTP) {
            return res.status(400).json({
                success: false,
                message: "No OTP generated for this purchase ID."
            });
        }

        // Trim and compare the OTPs
        if (otp.trim() === generatedOTP.toString().trim()) { // Ensure both are strings and trimmed
            // Update the purchase status to Confirmed
            const Purchase = await purchase.findOneAndUpdate(
                { _id: purchaseId }, // Ensure correct field name for the search
                { currentStatus: "Confirmed" }, // Change status to confirmed
                { new: true }
            );

            if (!Purchase) {
                return res.status(404).json({
                    success: false,
                    message: "Purchase not found."
                });
            }

            // Remove the OTP from memory after successful verification
            delete otpStore[purchaseId];

            res.status(200).json({
                success: true,
                message: "Purchase confirmed successfully.",
                data: Purchase
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};



//

module.exports = { createProduct, getProductsByCategory, getSellerAllProducts, getSellerAllPurchases, confirmedBuyProduct, verifyBuyOtp  };