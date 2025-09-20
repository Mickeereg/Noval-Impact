const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    res.json({
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      aadhaar: req.user.aadhaar,
      points: req.user.points,
      bottlePoints: req.user.bottlePoints,
      isAdmin: req.user.isAdmin,
      recycledItems: req.user.recycledItems,
      coupons: req.user.coupons
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    
    res.json({
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      aadhaar: req.user.aadhaar,
      points: req.user.points
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get user recycling history
router.get('/history', auth, async (req, res) => {
  try {
    // This is a placeholder implementation
    // In a real app, you would fetch the user's recycling history from the database
    res.json({
      totalItems: req.user.recycledItems.length,
      history: [] // Placeholder for actual history data
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
});

// Get user coupons
router.get('/coupons', auth, async (req, res) => {
  try {
    // This is a placeholder implementation
    // In a real app, you would fetch the user's coupons from the database
    res.json({
      coupons: [] // Placeholder for actual coupons data
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
});

// Update bottle points
router.post('/update-bottle', auth, async (req, res) => {
  try {
    const { bottlePoints } = req.body;
    
    if (typeof bottlePoints !== 'number') {
      return res.status(400).json({ message: 'Invalid bottle points value' });
    }

    // Update user's bottle points
    req.user.bottlePoints = bottlePoints;
    await req.user.save();

    res.json({
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      points: req.user.points,
      bottlePoints: req.user.bottlePoints
    });
  } catch (error) {
    console.error('Error updating bottle points:', error);
    res.status(500).json({ message: 'Error updating bottle points', error: error.message });
  }
});

module.exports = router; 