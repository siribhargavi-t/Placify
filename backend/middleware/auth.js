const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7, authHeader.length);
  }

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No authentication token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'placifySecretTokenLongKey123!@#');
    
    // Find the user and verify they are active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User does not exist, authorization denied' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact Admin.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
