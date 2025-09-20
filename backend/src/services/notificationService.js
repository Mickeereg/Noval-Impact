const twilio = require('twilio');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Function to send SMS notification
const sendSMS = async (to, message) => {
  try {
    console.log('=== SMS Sending Attempt ===');
    console.log('To:', to);
    console.log('From:', process.env.TWILIO_PHONE_NUMBER);
    console.log('Message:', message);
    console.log('Twilio Account SID:', process.env.TWILIO_ACCOUNT_SID);
    
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log('=== SMS Sent Successfully ===');
    console.log('Message SID:', response.sid);
    console.log('Status:', response.status);
    return true;
  } catch (error) {
    console.error('=== SMS Sending Failed ===');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Error Details:', {
      status: error.status,
      moreInfo: error.moreInfo,
      details: error.details
    });
    console.error('Stack Trace:', error.stack);
    return false;
  }
};

// Function to handle can full notification
const handleCanFull = async (userId) => {
  try {
    console.log('=== Starting Can Full Notification ===');
    console.log('User ID:', userId);

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    console.log('User found:', {
      name: user.name,
      aadhaar: user.aadhaar,
      address: user.address
    });

    // Generate a coupon for the user
    const coupon = new Coupon({
      code: `RECYCLE-${Date.now()}`,
      type: 'discount',
      value: 100,
      description: 'Recycling reward coupon',
      pointsRequired: 0,
      isActive: true
    });
    await coupon.save();
    console.log('Coupon generated:', coupon.code);

    // Add coupon to user's coupons
    user.coupons.push(coupon._id);
    await user.save();

    // Send notification only to admin/company
    const companyMessage = `New recycling request!\nUser: ${user.name}\nID Number: ${user.aadhaar}\nAddress: ${user.address}\nCan is full and ready for collection.`;
    
    console.log('=== Attempting to Send Company Notification ===');
    console.log('Company Phone:', process.env.COMPANY_PHONE_NUMBER);
    console.log('Message:', companyMessage);
    
    const smsSent = await sendSMS(process.env.COMPANY_PHONE_NUMBER, companyMessage);
    
    if (!smsSent) {
      console.error('Failed to send SMS notification to company');
      throw new Error('Failed to send SMS notification');
    }

    console.log('=== Can Full Notification Completed Successfully ===');
    return {
      success: true,
      coupon: coupon.code,
      smsSent
    };
  } catch (error) {
    console.error('=== Can Full Notification Failed ===');
    console.error('Error:', error.message);
    console.error('Stack Trace:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendSMS,
  handleCanFull
}; 