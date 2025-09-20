const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['plastic', 'tin', 'paper', 'glass', 'electronics', 'other']
  },
  points: {
    type: Number,
    required: true,
    default: function() {
      // Set points based on item type
      switch(this.type) {
        case 'plastic':
          return 5;
        case 'tin':
          return 6;
        case 'paper':
          return 3;
        case 'glass':
          return 8;
        case 'electronics':
          return 15;
        default:
          return 4;
      }
    }
  },
  qrCode: {
    type: String,
    required: true
  },
  qrCodeImage: {
    type: String
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to mark an item as used
itemSchema.methods.markAsUsed = async function(userId) {
  if (this.isUsed) {
    throw new Error('Item has already been used');
  }
  
  this.isUsed = true;
  this.usedBy = userId;
  this.usedAt = new Date();
  
  return this.save();
};

const Item = mongoose.model('Item', itemSchema);

module.exports = Item; 