const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const QRCode = require('qrcode');
const Item = require('../models/Item');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// Points configuration for different item types
const ITEM_POINTS = {
  plastic: 5,
  tin: 6,
  paper: 3,
  glass: 8,
  electronics: 15,
  other: 4
};

// Generate QR code for a new recyclable item
router.post('/generate-qr', auth, async (req, res) => {
  try {
    const { type = 'plastic' } = req.body;
    
    // Set points based on item type
    const points = ITEM_POINTS[type] || 1;

    // Generate a test item ID
    const itemId = 'test-' + Date.now();
    
    // Create a simple QR code data string in the format "itemId|type|points"
    const qrString = `${itemId}|${type}|${points}`;
    
    // Generate QR code data URL
    const qrDataUrl = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    res.json({
      itemId,
      type,
      points,
      qrCode: qrString,
      qrDataUrl: qrDataUrl  // Send the full data URL for direct image display
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Error generating QR code' });
  }
});

// Validate a scanned QR code
router.post('/validate-qr', auth, async (req, res) => {
  try {
    console.log('Received QR validation request:', req.body);
    
    const { itemId, type, points } = req.body;
    
    if (!itemId || !type || !points) {
      return res.status(400).json({ message: 'Invalid QR code data: Missing required fields' });
    }
    
    // Check for test QR codes (ones with itemId starting with 'test-')
    if (itemId.startsWith('test-')) {
      // Check if this test QR code has been used before
      const existingItem = await Item.findOne({ itemId });
      
      if (existingItem && existingItem.isUsed) {
        return res.status(400).json({ 
          message: 'This item has already been recycled',
          isUsed: true,
          usedAt: existingItem.usedAt,
          usedBy: existingItem.usedBy
        });
      }
      
      // Create or update the test item
      let testItem;
      if (existingItem) {
        testItem = existingItem;
      } else {
        testItem = new Item({
          itemId,
          type,
          points: parseInt(points),
          qrCode: `${itemId}|${type}|${points}`,
          isUsed: false
        });
        await testItem.save();
      }
      
      // Mark the item as used
      testItem.isUsed = true;
      testItem.usedBy = req.user._id;
      testItem.usedAt = new Date();
      await testItem.save();
      
      // Award points to the user
      const user = await User.findById(req.user._id);
      user.points += parseInt(points);
      user.bottlePoints = (user.bottlePoints || 0) + parseInt(points);
      await user.save();
      
      return res.json({
        valid: true,
        itemType: type,
        points: parseInt(points),
        totalPoints: user.points,
        bottlePoints: user.bottlePoints,
        message: 'Item recycled successfully'
      });
    }
    
    // For regular QR codes (non-test ones)
    let item = await Item.findOne({ itemId });
    
    if (!item) {
      // Create new item if it doesn't exist
      item = new Item({
        itemId,
        type,
        points: parseInt(points),
        qrCode: `${itemId}|${type}|${points}`,
        isUsed: false
      });
      await item.save();
    }
    
    // Check if item has already been used
    if (item.isUsed) {
      // Get information about who used it and when
      let usedByInfo = "someone else";
      if (item.usedBy && item.usedBy.equals(req.user._id)) {
        usedByInfo = "you";
      }
      
      const usedTime = item.usedAt ? 
        `on ${item.usedAt.toLocaleDateString()} at ${item.usedAt.toLocaleTimeString()}` : 
        "previously";
      
      return res.status(400).json({ 
        message: `This item has already been recycled by ${usedByInfo} ${usedTime}`,
        isUsed: true,
        usedAt: item.usedAt,
        usedBy: item.usedBy
      });
    }
    
    // Mark item as used
    item.isUsed = true;
    item.usedBy = req.user._id;
    item.usedAt = new Date();
    await item.save();
    
    // Update user points
    const user = await User.findById(req.user._id);
    user.points += item.points;
    user.bottlePoints = (user.bottlePoints || 0) + item.points;
    if (!user.recycledItems) {
      user.recycledItems = [];
    }
    user.recycledItems.push(item._id);
    await user.save();
    
    res.json({
      valid: true,
      itemType: item.type,
      points: item.points,
      totalPoints: user.points,
      bottlePoints: user.bottlePoints,
      message: 'Item recycled successfully'
    });
  } catch (error) {
    console.error('Error validating QR code:', error);
    res.status(500).json({ message: 'Error validating QR code', error: error.message });
  }
});

// Get all recyclable items (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const items = await Item.find({})
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
});

// Get item by ID
router.get('/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findOne({ itemId: req.params.itemId });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ item });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item', error: error.message });
  }
});

// Add this route after your existing routes
router.get('/test-qr', auth, async (req, res) => {
  try {
    // Create a test item
    const testItem = {
      id: 'test-' + Date.now(),
      type: 'plastic',
      points: 2
    };

    // Return the test item data that can be used to generate QR code
    res.json(testItem);
  } catch (error) {
    console.error('Error generating test QR:', error);
    res.status(500).json({ message: 'Error generating test QR code' });
  }
});

module.exports = router; 