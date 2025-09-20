const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['discount', 'free_item', 'cashback', 'other']
  },
  value: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  pointsRequired: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  redeemedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to redeem a coupon
couponSchema.methods.redeem = async function(userId) {
  if (!this.isActive) {
    throw new Error('Coupon is not active');
  }
  
  if (this.expiryDate && this.expiryDate < new Date()) {
    throw new Error('Coupon has expired');
  }
  
  if (this.redeemedBy) {
    throw new Error('Coupon has already been redeemed');
  }
  
  this.redeemedBy = userId;
  this.redeemedAt = new Date();
  this.isActive = false;
  
  return this.save();
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon; 