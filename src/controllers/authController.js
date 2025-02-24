const express = require('express')
const statusCode = require('../helper/statusCode')
const bcrypt = require('bcrypt');
const User = require("../routes/models/userModel")
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTP } = require("../utils/otpUtils")
const TempUser = require("../routes/models/tempUserModel")

const CreateUser = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, mobileNumber, countryCode, gender, userType, address, profileimage ,latitude ,longitude } = req.body;

        if (password !== confirmPassword) {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: "Passwords do not match" });
        }
        const existingUser = await TempUser.findOne({ email: email }); // await added to wait for the result

        if (existingUser) {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, successEmail: false, message: "Email already exists" });
        }
        const generatedOTP = generateOTP();
        await sendOTP(email, generatedOTP);

        // Save OTP and user data temporarily (usually in a cache or temporary storage)
        const tempUser = new TempUser({
            username,
            email,
            password,
            mobileNumber,
            countryCode,
            gender,
            userType,
            address,
            profileimage,
            latitude,
            longitude,
            otp: generatedOTP,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes (optional)
        });
        await tempUser.save();

        res.status(statusCode.OK).json({ status: statusCode.OK, success: true, message: "OTP sent to email. Please verify." });
    } catch (error) {
        console.error("Error:", error); // Logging the error for debugging
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: "Internal server error" }); // Sending an appropriate error response
    }
}


const VerifyRegisterOTP = async (req, res) => {
    try {
        const { email, enteredOTP } = req.body;

        const tempUser = await TempUser.findOne({ email: email });

        if (!tempUser) {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: "User not found or OTP expired." });
        }

        if (tempUser.otp !== enteredOTP) {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: "Invalid OTP." });
        }

        const hashedPassword = await bcrypt.hash(tempUser.password, 10);

        const newUser = await User.create({
            username: tempUser.username,
            email: tempUser.email,
            password: hashedPassword,
            mobileNumber: tempUser.mobileNumber,
            countryCode: tempUser.countryCode,
            gender: tempUser.gender,
            userType: tempUser.userType,
            address: tempUser.address,
            profileimage: tempUser.profileimage,
            latitude: tempUser.latitude,
            longitude:tempUser.longitude


        });

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '5h' });

        await TempUser.deleteOne({ email: email });

        res.status(statusCode.OK).json({ status: statusCode.OK, success: true, message: "User created successfully", user: newUser, token: token });
    } catch (error) {
        console.error("Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: "Internal server error" });
    }
}


const ResendRegisterOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the temporary user based on email
        const tempUser = await TempUser.findOne({ email: email });

        if (!tempUser) {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: "User not found or OTP not generated yet." });
        }

        // Generate a new OTP
        const newOTP = generateOTP();

        // Send the new OTP to the user via email
        await sendOTP(email, newOTP);

        // Update the user's record with the new OTP and expiry time
        tempUser.otp = newOTP;
        tempUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes (optional)
        await tempUser.save();

        res.status(statusCode.OK).json({ status: statusCode.OK, success: true, message: "OTP resent successfully." });
    } catch (error) {
        console.error("Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: "Internal server error" });
    }
};


const SignInUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: "Email does not exist" });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(statusCode.UNAUTHORIZED).json({ status: statusCode.UNAUTHORIZED, success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '5h',
        });

        res.status(statusCode.OK).json({ status: statusCode.OK, success: true, message: "User signed in successfully", user, token });
    } catch (error) {
        console.error("Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: "Internal server error" });
    }
}

const getAllUsers = async (req, res) => {
    try {
        // Extract the userType from query parameters
        const { userType } = req.query;

        // Check if the userType is provided
        if (!userType) {
            return res.status(400).json({ message: "userType query param is required" });
        }

        // Determine the opposite user type for the query
        let queryType = "";
        if (userType.toUpperCase() === "SELLER") {
            queryType = "BUYER"; // If userType is SELLER, return BUYER users
        } else if (userType.toUpperCase() === "BUYER") {
            queryType = "SELLER"; // If userType is BUYER, return SELLER users
        } else {
            return res.status(400).json({ message: "Invalid userType. Expected 'BUYER' or 'SELLER'." });
        }

        // Fetch users with the opposite userType
        const users = await User.find({ userType: queryType });

        // Check if there are no users with the opposite userType
        if (users.length === 0) {
            return res.status(404).json({ message: "No ${ queryType } users found" });
        }

        // Return the filtered users in the response
        return res.status(200).json({ status: statusCode.OK, success: true, message: "User signed in successfully", data: users });
    } catch (error) {
        // Return a 500 error if something goes wrong
        return res.status(500).json({ error: "Failed to retrieve users" });
    }
}

module.exports = { CreateUser, SignInUser, VerifyRegisterOTP, ResendRegisterOTP ,getAllUsers }