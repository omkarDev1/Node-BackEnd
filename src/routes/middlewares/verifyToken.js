const jwt = require('jsonwebtoken');

// JWT verification middleware
const verifyTokenUser = (req, res, next) => {
    const token = req.headers['bearer']; // Extract token from the 'Bearer' header key

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET); // Verify the token
        console.log("decoded", decoded);

        req.user = decoded; // Assign decoded payload to req.user
        next(); // Call the next middleware
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = verifyTokenUser;