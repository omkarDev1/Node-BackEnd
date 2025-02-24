const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    countryCode: { type: String, required: true },
    gender: { type: String, required: true },
    userType: { type: String, required: true },
    address: { type: String, required: true },
    profileimage:
    {
        type: String,
        required: true
    },
    latitude: {
        type: String,
        required: false
    },
    longitude: {
        type: String,
        required: false
    },
    otp: { type: String, required: true }, // OTP for verification
    otpExpiry: { type: Date, required: true }, // Optional: OTP expiry time
}, { timestamps: true });

const TempUser = mongoose.model('TempUser', tempUserSchema);

module.exports = TempUser;