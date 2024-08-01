const express = require('express') 
const statusCode = require('../helper/statusCode')
const bcrypt = require('bcrypt');
const User = require("../routes/models/userModel")
 const jwt = require('jsonwebtoken');
 
 const CreateUser = async (req, res) => {
    try {
        const { username, email ,password } = req.body;
        const existingUser = await User.findOne({ email: email }); // await added to wait for the result

        if (existingUser) {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, successEmail: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ username, email , password :hashedPassword });

        const token = jwt.sign({ userId: newUser._id }, 'omkar45', {
            expiresIn: '1h',
        }); // await added to wait for user creation

        res.status(statusCode.OK).json({ status: statusCode.OK, success: true, message: "User created successfully", user: newUser, token: token }); // Sending a success message and the newly created user details
    } catch (error) {
        console.error("Error:", error); // Logging the error for debugging
        res.status(statusCode.INTERNAL_SERVER_ERROR, success).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: "Internal server error" }); // Sending an appropriate error response
    }
}
module.exports = {CreateUser}