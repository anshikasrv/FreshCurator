const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Placed', 'Accepted', 'Out for Delivery', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  deliveryAddress: { type: String, required: true },
  deliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  razorpayOrderId: { type: String },
  checkoutKey: { type: String },
  razorpayPaymentId: { type: String },
  paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'Online' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  deliveryCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  deliveryOtp: { type: String, select: false },
  deliveryOtpExpiresAt: { type: Date, select: false },
  deliveryOtpAttempts: { type: Number, default: 0, select: false },
  deliveryOtpLastSentAt: { type: Date, default: null, select: false },
  createdAt: { type: Date, default: Date.now }
});

orderSchema.index({ userId: 1, checkoutKey: 1 }, { unique: true, partialFilterExpression: { checkoutKey: { $type: 'string' } } });

module.exports = mongoose.model('Order', orderSchema);
