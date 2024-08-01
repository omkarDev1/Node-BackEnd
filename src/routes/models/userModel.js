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
    }
});
const User = new mongoose.model("Loginuser", userSchema)

module.exports = User;