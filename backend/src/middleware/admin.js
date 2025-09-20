const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    // Check if user exists and is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin privileges', error: error.message });
  }
};

module.exports = admin; 