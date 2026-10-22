const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Delivery Boy', 'User'], 
    default: 'User' 
  },
  createdAt: { type: Date, default: Date.now },
  profileImage: { type: String, default: '' },
  authProvider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  loginOtp: { type: String, default: null, select: false },
  loginOtpExpiresAt: { type: Date, default: null, select: false },
  loginOtpAttempts: { type: Number, default: 0, select: false },
  loginOtpLastSentAt: { type: Date, default: null, select: false }
});
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
