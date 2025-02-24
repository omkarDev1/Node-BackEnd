const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loginuser',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    sellerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loginuser',  // Reference to the Seller model
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    currentStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Cancelled'],
        default: 'Pending'
    },
    address: {
        type: String,
        required: true
    }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
