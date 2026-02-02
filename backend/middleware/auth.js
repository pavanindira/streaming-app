const jwt = require('jsonwebtoken');

// Generate a JWT
const generateToken = (userId) => {
  const payload = { id: userId };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }; // Configurable expiry

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  return jwt.sign(payload, secret, options);
};

// Verify a JWT
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  try {
    return jwt.verify(token, secret);
  } catch (err) {
    throw new Error('Invalid token');
  }
};

// Middleware to authenticate requests
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = verifyToken(token); // Reuse verifyToken function
    req.artistId = decoded.id; // Attach artist ID to the request object
    next();
  } catch (err) {
    next({ status: 401, message: 'Invalid token' }); // Pass error to centralized error handler
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
};