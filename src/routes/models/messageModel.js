const mongoose = require("mongoose");


const messageSchema = new mongoose.Schema({
    buyerId: String,
    sellerId: String,
    message: { type: String, required: true },
}, { timestamps: true });

// Message model
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;