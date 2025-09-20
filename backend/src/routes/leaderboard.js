const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get global leaderboard
router.get('/global', async (req, res) => {
  try {
    // Get top 10 users by points
    const topUsers = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select('name username points -_id');
    
    res.json({
      leaderboard: topUsers,
      period: 'all-time'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
});

// Get monthly leaderboard
router.get('/monthly', async (req, res) => {
  try {
    // This is a placeholder implementation
    // In a real app, you would track points with timestamps and filter by current month
    const topUsers = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select('name username points -_id');
    
    res.json({
      leaderboard: topUsers,
      period: 'monthly'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly leaderboard', error: error.message });
  }
});

// Get weekly leaderboard
router.get('/weekly', async (req, res) => {
  try {
    // This is a placeholder implementation
    // In a real app, you would track points with timestamps and filter by current week
    const topUsers = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select('name username points -_id');
    
    res.json({
      leaderboard: topUsers,
      period: 'weekly'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weekly leaderboard', error: error.message });
  }
});

// Get user's rank
router.get('/my-rank', auth, async (req, res) => {
  try {
    // Count users with more points than the current user
    const usersWithMorePoints = await User.countDocuments({
      points: { $gt: req.user.points }
    });
    
    // User's rank is the number of users with more points + 1
    const rank = usersWithMorePoints + 1;
    
    res.json({
      rank,
      points: req.user.points,
      name: req.user.name
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user rank', error: error.message });
  }
});

module.exports = router; 