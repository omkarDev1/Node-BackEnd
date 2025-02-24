const nodemailer = require('nodemailer');

// Generate OTP function
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
}

// Send OTP via email function
const sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
            user: 'omkargaikwad5556@gmail.com',
            pass: 'lixq rojj bkqu ucky'
        }
    });

    const mailOptions = {
        from: 'omkargaikwad5556@gmail.com',
        to: email,
        subject: 'OTP for Registration',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">OTP Verification</h2>
                <p>Hello,</p>
                <p>Thank you for registering with us! Please use the following OTP to complete your account verification:</p>
                <p style="font-size: 24px; font-weight: bold; color: #000;">${otp}</p>
                <p>This OTP is valid for the next 10 minutes.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <br>
                <p>Best regards,</p>
                <p>Your Company Name</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

// Export the functions
module.exports = { generateOTP, sendOTP };