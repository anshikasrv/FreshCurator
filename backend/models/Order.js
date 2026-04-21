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
  razorpayPaymentId: { type: String },
  paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'Online' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  deliveryCoords: {
    lat: { type: Number },
    lng: { type: Number }
  },
  deliveryOtp: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
