const mongoose = require("mongoose");



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    mobileNumber: {
        type: Number,
        require: true
    },
    countryCode: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true
    },
    userType: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
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
    }
});
const User = new mongoose.model("Loginuser", userSchema)

module.exports = User;