// const Order = require('../models/Order');
// const { getIO } = require('../socket');
// const sendEmail = require('../utils/mailer');
// const User = require('../models/User');

// const getOrders = async (req, res) => {
//   try {
//     const filter = {};
//     if (req.query.deliveryBoyId) filter.deliveryBoyId = req.query.deliveryBoyId;
//     if (req.query.status) filter.status = req.query.status;
//     const orders = await Order.find(filter)
//       .populate('userId', 'name email')
//       .populate('products.productId', 'name imageUrl')
//       .populate('deliveryBoyId', 'name email')
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// const getOrdersByUser = async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.params.userId })
//       .populate('products.productId', 'name imageUrl')
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// //older----->>>>
// // const createOrder = async (req, res) => {
// //   try {
// //     const { userId, products, totalAmount } = req.body;

// //     if (!userId || userId === 'guest') {
// //       return res.status(400).json({ error: 'Valid user account is required to place an order. Please sign in.' });
// //     }

// //     if (!products || products.length === 0) {
// //       return res.status(400).json({ error: 'Cannot place an empty order.' });
// //     }

// //     const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();
// //     const orderData = { ...req.body, deliveryOtp };
// //     const order = new Order(orderData);
// //     await order.save();

// //     // Notify admin via socket
// //     const io = getIO();
// //     io.emit('new_order', order);
// //     res.status(201).json(order);
// //   } catch (err) {
// //     console.error('Order creation failed:', err);
// //     res.status(400).json({ error: err.message || 'Validation failed during order placement.' });
// //   }
// // };

// //newer to fix otp at delivery------->>>>>>
// const createOrder = async (req, res) => {
//   try {
//     const { userId, products, totalAmount } = req.body;

//     if (!userId || userId === 'guest') {
//       return res.status(400).json({ error: 'Valid user account is required to place an order. Please sign in.' });
//     }

//     if (!products || products.length === 0) {
//       return res.status(400).json({ error: 'Cannot place an empty order.' });
//     }

//     const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();

//     // Updated to use the variables explicitly to remove the "never read" warning
//     const orderData = {
//       userId,
//       products,
//       totalAmount,
//       ...req.body,
//       deliveryOtp
//     };

//     const order = new Order(orderData);
//     await order.save();

//     // Necessary Change: Fetch User and Send Email
//     const user = await User.findById(userId);
//     if (user && user.email) {
//       await sendEmail({
//         to: user.email,
//         subject: 'Order Confirmed - Your Delivery OTP',
//         html: `<h3>Your Order OTP is: <b>${deliveryOtp}</b></h3><p>Total Amount: ₹${totalAmount}</p>`
//       });
//     }

//     // Notify admin via socket
//     const io = getIO();
//     if (io) io.emit('new_order', order);

//     res.status(201).json(order);
//   } catch (err) {
//     console.error('Order creation failed:', err);
//     res.status(400).json({ error: err.message || 'Validation failed during order placement.' });
//   }
// };

// const updateOrderStatus = async (req, res) => {
//   try {
//     const { status, deliveryBoyId, deliveryOtp } = req.body;

//     // For delivered status, strictly verify OTP
//     if (status === 'Delivered') {
//       const existingOrder = await Order.findById(req.params.id);
//       if (!existingOrder) return res.status(404).json({ error: 'Order not found' });
//       if (existingOrder.deliveryOtp !== deliveryOtp) {
//         return res.status(403).json({ error: 'Invalid Delivery OTP' });
//       }
//     }

//     const updateData = {};
//     if (status) updateData.status = status;
//     if (deliveryBoyId !== undefined) updateData.deliveryBoyId = deliveryBoyId;

//     const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     if (!order) return res.status(404).json({ error: 'Order not found' });

//     // Emit real-time update to order room and admin
//     const io = getIO();
//     io.to(`order_${order._id}`).emit('order_status_update', { orderId: order._id, status: order.status });
//     io.emit('order_updated', { orderId: order._id, status: order.status, deliveryBoyId: order.deliveryBoyId });

//     res.json(order);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// const getAvailableOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({
//       status: 'Placed',
//       deliveryBoyId: null
//     })
//       .populate('userId', 'name email')
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// module.exports = {
//   getOrders,
//   getOrdersByUser,
//   getAvailableOrders,
//   createOrder,
//   updateOrderStatus
// };


//completely new logic for razorpay------>>>>>
const Order = require('../models/Order');
const { getIO } = require('../socket');
const sendEmail = require('../utils/mailer');
const User = require('../models/User');
const Razorpay = require('razorpay'); // 1. Added Razorpay dependency
const crypto = require('crypto');//added for verification

// 2. Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.deliveryBoyId) filter.deliveryBoyId = req.query.deliveryBoyId;
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .populate('products.productId', 'name imageUrl')
      .populate('deliveryBoyId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('products.productId', 'name imageUrl')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { userId, products, totalAmount, paymentMethod } = req.body;

    // --- Existing Validations ---
    if (!userId || userId === 'guest') {
      return res.status(400).json({ error: 'Valid user account is required to place an order. Please sign in.' });
    }
    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'Cannot place an empty order.' });
    }

    const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();
    let razorpayOrderId = null;

    // --- NEW: Razorpay Integration (Fixes Currency Error) ---
    if (paymentMethod === 'Online') {
      const razorpayOptions = {
        amount: Math.round(totalAmount * 100), // Convert to paise
        currency: "INR", // Forcing INR prevents the "International Card" error
        receipt: `receipt_${Date.now()}`,
      };
      
      const rzpOrder = await razorpay.orders.create(razorpayOptions);
      razorpayOrderId = rzpOrder.id;
    }

    // --- Preserved functionality with added payment fields ---
    const orderData = {
      userId,
      products,
      totalAmount,
      ...req.body, // Keeps address, coordinates, and custom fields
      deliveryOtp,
      razorpayOrderId, // Added for frontend checkout
      // If Online, status is 'Pending' until payment is verified
      status: paymentMethod === 'Online' ? 'Pending' : 'Placed' 
    };

    const order = new Order(orderData);
    await order.save();

    // --- Existing Email Logic ---
    const user = await User.findById(userId);
    if (user && user.email) {
      await sendEmail({
        to: user.email,
        subject: 'Order Confirmed - Your Delivery OTP',
        html: `<h3>Your Order OTP is: <b>${deliveryOtp}</b></h3><p>Total Amount: ₹${totalAmount}</p>`
      });
    }

    // --- Existing Socket Notification ---
    const io = getIO();
    if (io) io.emit('new_order', order);

    res.status(201).json(order);
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(400).json({ error: err.message || 'Validation failed during order placement.' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryBoyId, deliveryOtp } = req.body;

    if (status === 'Delivered') {
      const existingOrder = await Order.findById(req.params.id);
      if (!existingOrder) return res.status(404).json({ error: 'Order not found' });
      if (existingOrder.deliveryOtp !== deliveryOtp) {
        return res.status(403).json({ error: 'Invalid Delivery OTP' });
      }
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (deliveryBoyId !== undefined) updateData.deliveryBoyId = deliveryBoyId;

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const io = getIO();
    io.to(`order_${order._id}`).emit('order_status_update', { orderId: order._id, status: order.status });
    io.emit('order_updated', { orderId: order._id, status: order.status, deliveryBoyId: order.deliveryBoyId });

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAvailableOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: 'Placed',
      deliveryBoyId: null
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    // 🟢 SUCCESS: Update status to 'Placed'
    await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'Placed', razorpayPaymentId: razorpay_payment_id }
    );
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid payment signature" });
  }
};

module.exports = {
  getOrders,
  getOrdersByUser,
  getAvailableOrders,
  createOrder,
  updateOrderStatus,verifyPayment
};      