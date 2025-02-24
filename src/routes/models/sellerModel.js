const mongoose = require('mongoose');
const User = require("../models/userModel")

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    endDate: { type: Date, required: true },
    image: { type: String, required: true },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'Loginuser' },  
    // addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product ;
