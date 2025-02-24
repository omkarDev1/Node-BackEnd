const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', required: true }, // Reference to the Purchase model
    currentStatus: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Cancelled'], default: 'Pending' }, // Status options
    updatedAt: { type: Date, default: Date.now }
});

const Status = mongoose.model('Status', statusSchema);

module.exports = Status;