const nodemailer = require('nodemailer');
const statusCode = require('../helper/statusCode')


let otpStore = {};

// Configure nodemailer with your email service provider
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'omkargaikwad5556@gmail.com', // Your email address
        pass: 'lixq rojj bkqu ucky'   // Your email password or app-specific password
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const EmailVerify = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: 'Email is required' });
        }

        const otp = generateOTP();
        otpStore[email] = otp;
        console.log(`Generated OTP for ${email}: ${otp}`);
        const mailOptions = {
            from: 'gaikwadomkar5555@gmail.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("error", error);

                return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: 'Error sending email' });
            }
            res.status(statusCode.OK).json({ status: statusCode.OK, success: true, message: 'OTP sent successfully' });
        });
    } catch (error) {
        console.error("Error:", error); // Logging the error for debugging
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: "Internal server error" }); // Sending an appropriate error response
    }

}

const OtpVerify = async (req, res) => {

    const { email, otp } = req.body;
    console.log(`Verifying OTP for email: ${email}, received OTP: ${otp}, stored OTP: ${otpStore[email]}`);
    try {
        if (!email || !otp) {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: 'Email and OTP are required' });
        }

        if (otpStore[email] === otp) {
            delete otpStore[email];
            return res.status(statusCode.OK).json({ status: statusCode.OK, success: true, message: 'OTP verified successfully' });
        } else {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error("Error:", error); // Logging the error for debugging
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: "Internal server error" }); // Sending an appropriate error response
    }
}
const ResendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(statusCode.BAD_REQUEST).json({ status: statusCode.BAD_REQUEST, success: false, message: 'Email is required' });
        }

        // Generate a new OTP
        const otp = generateOTP();
        otpStore[email] = otp;
        console.log(`Resent OTP for ${email}: ${otp}`);

        // Configure the email options
        const mailOptions = {
            from: 'gaikwadomkar5555@gmail.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your new OTP code is ${otp}`
        };

        // Send the email with the new OTP
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error sending email:", error);
                return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: 'Error sending email' });
            }
            res.status(statusCode.OK).json({ status: statusCode.OK, success: true, message: 'New OTP sent successfully' });
        });
    } catch (error) {
        console.error("Error:", error); // Logging the error for debugging
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ status: statusCode.INTERNAL_SERVER_ERROR, success: false, message: "Internal server error" }); // Sending an appropriate error response
    }
};

module.exports = { EmailVerify, OtpVerify, ResendOTP };