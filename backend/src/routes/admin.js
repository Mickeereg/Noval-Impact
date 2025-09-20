const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Item = require('../models/Item');
const User = require('../models/User');
const QRCode = require('qrcode');

// Points configuration for different item types
const ITEM_POINTS = {
  plastic: 2,
  tin: 3,
  paper: 1,
  glass: 4,
  electronics: 5,
  other: 1
};

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Admin
 */
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    // Get total QR codes count
    const totalQRCodes = await Item.countDocuments();
    
    // Get recyclable items count (not used yet)
    const recyclableItems = await Item.countDocuments({ isUsed: false });
    
    // Get active users count
    const activeUsers = await User.countDocuments();
    
    // Get recycled items count (used)
    const recycledItems = await Item.countDocuments({ isUsed: true });
    
    res.json({
      totalQRCodes,
      recyclableItems,
      activeUsers,
      recycledItems
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin statistics', error: error.message });
  }
});

/**
 * @route   GET /api/admin/qr-history
 * @desc    Get QR code generation history
 * @access  Admin
 */
router.get('/qr-history', [auth, admin], async (req, res) => {
  try {
    const items = await Item.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('usedBy', 'name username');
      
    // Format the items in the way the frontend expects
    const formattedItems = items.map(item => ({
      id: item.itemId,
      type: item.type,
      points: item.points,
      date: item.createdAt.toISOString().split('T')[0],
      used: item.isUsed,
      usedBy: item.usedBy ? item.usedBy.name || item.usedBy.username : null,
      usedAt: item.usedAt ? item.usedAt.toISOString() : null
    }));
    
    res.json(formattedItems);
  } catch (error) {
    console.error('Error fetching QR history:', error);
    res.status(500).json({ message: 'Error fetching QR code history', error: error.message });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ points: -1 });
      
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

/**
 * @route   POST /api/admin/generate-bulk-qr
 * @desc    Generate multiple QR codes at once
 * @access  Admin
 */
router.post('/generate-bulk-qr', [auth, admin], async (req, res) => {
  try {
    const { type = 'plastic', amount = 5 } = req.body;
    
    // Validate amount
    const bulkAmount = parseInt(amount);
    if (isNaN(bulkAmount) || bulkAmount < 1 || bulkAmount > 50) {
      return res.status(400).json({ message: 'Amount must be between 1 and 50' });
    }
    
    // Set points based on item type
    const points = ITEM_POINTS[type] || 1;
    
    // Generate items in bulk
    const bulkItems = [];
    const promises = [];
    
    for (let i = 0; i < bulkAmount; i++) {
      // Generate a unique item ID
      const itemId = `bulk-${Date.now()}-${i}`;
      
      // Create QR code data string
      const qrString = `${itemId}|${type}|${points}`;
      
      // Create a new item
      const newItem = new Item({
        itemId,
        type,
        points,
        qrCode: qrString,
        isUsed: false
      });
      
      // Add to bulk items array
      bulkItems.push({
        itemId,
        type,
        points
      });
      
      // Save to database
      promises.push(newItem.save());
    }
    
    // Wait for all saves to complete
    await Promise.all(promises);
    
    res.json({
      success: true,
      message: `Successfully generated ${bulkAmount} QR codes`,
      type,
      points,
      itemsCount: bulkItems.length,
      items: bulkItems
    });
  } catch (error) {
    console.error('Error generating bulk QR codes:', error);
    res.status(500).json({ message: 'Error generating bulk QR codes', error: error.message });
  }
});

module.exports = router; 