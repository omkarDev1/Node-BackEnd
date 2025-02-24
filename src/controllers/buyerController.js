const statusCode = require('../helper/statusCode');
const Purchase = require('../routes/models/purchaseModel');
const Product = require("../routes/models/sellerModel")
const Status = require("../routes/models/statusModal")
const User = require("../routes/models/userModel")


const buyProduct = async (req, res) => {
    try {
        const { productId, quantity, sellerID, totalAmount ,address } = req.body;
        const buyerId = req.user.userId;

        // Validate the required fields
        if (!productId || !quantity) { return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: "Please provide productId and quantity." }); }

        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) { return res.status(statusCode.NOT_FOUND).json({ status: statusCode.NOT_FOUND, success: false, message: "Product not found." }) }

        // Check if enough quantity is available
        if (product.quantity < quantity) { return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: "Insufficient quantity available." }); }

        // Update product quantity
        product.quantity -= quantity;
        await product.save();

        if (address) {
            await User.findByIdAndUpdate(buyerId, { address });
        }

        // Record the purchase (assuming you have a Purchase model)
        const newPurchase = await Purchase.create({
            productId: product._id,
            buyerId: buyerId,
            quantity,
            sellerID: sellerID,
            totalAmount,
            address,
            purchaseDate: new Date()
        });

        // Send success response
        res.status(statusCode.OK).json({ status: statusCode.OK, success: true, message: "Product purchased successfully", data: newPurchase });
    } catch (error) {
        console.error("Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: "Internal server error" });
    }
};

const getBuyProduct = async (req, res) => {
    try {
        const buyerId = req.user.userId;

        // Fetch all purchases made by the buyer and populate product and seller details
        const purchases = await Purchase.find({ buyerId })
            .populate('productId', 'productName category price quantity endDate image') // Populate product details
            .populate('sellerID', 'username email mobileNumber') // Populate seller details
            .exec();

        if (purchases.length === 0) {
            return res.status(statusCode.NOT_FOUND).json({
                status: statusCode.NOT_FOUND,
                success: false,
                message: "No purchases found for this buyer."
            });
        }

        // Fetch status by productId for each purchase and add it to the result
        const purchasesWithStatus = await Promise.all(
            purchases.map(async (purchase) => {
                const status = await Status.findOne({ productId: purchase.productId }).select('currentStatus'); // Find status by productId

                return {
                    ...purchase.toObject(), // Convert the purchase to a plain object
                    status: status ? status.currentStatus : 'Pending' // Include the current status or default to 'Pending'
                };
            })
        );

        // Send success response with purchase details and statuses
        res.status(statusCode.OK).json({
            status: statusCode.OK,
            success: true,
            message: "Purchases retrieved successfully",
            data: purchases
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
const getSellerAllPurchases = async (req, res) => {
    try {
        // Assuming you get the seller's user ID from the request (either from req.user or params)
        const sellerID = req.user.userId; // Or req.params.sellerID if passed in the URL

        console.log("Fetching purchases for seller with sellerID:", sellerID);

        // Find purchases based on the seller's user ID and populate buyer data from Loginuser model
        const sellerPurchases = await Purchase.find({ sellerID }).populate('buyerId', 'name email'); // Populate 'buyerId' with 'name' and 'email' from Loginuser model

        // Check if the seller has any purchases
        if (!sellerPurchases || sellerPurchases.length === 0) {
            return res.status(statusCode.NOT_FOUND).json({
                status: statusCode.NOT_FOUND,
                success: false,
                message: "No purchases found for this seller."
            });
        }

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

// add new api for change status getBuyProduct

module.exports = { buyProduct, getBuyProduct, getSellerAllPurchases };