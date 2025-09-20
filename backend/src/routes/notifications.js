const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { handleCanFull } = require('../services/notificationService');

// Route to handle can full notification
router.post('/can-full', auth, async (req, res) => {
  try {
    const result = await handleCanFull(req.user._id);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({
      message: 'Notification sent successfully',
      coupon: result.coupon
    });
  } catch (error) {
    console.error('Error in can full notification:', error);
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
});

module.exports = router; 