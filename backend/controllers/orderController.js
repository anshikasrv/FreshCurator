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

const otpDigest = (otp) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('OTP_SECRET or JWT_SECRET must be configured.');
  return crypto.createHmac('sha256', secret).update(String(otp)).digest('hex');
};
const otpMatches = (saved, provided) => {
  if (!saved) return false;
  const expected = Buffer.from(saved, 'hex');
  const actual = Buffer.from(otpDigest(provided), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

// 2. Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });
const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'User') filter.userId = req.user._id;
    if (req.user.role === 'Delivery Boy') filter.deliveryBoyId = req.user._id;
    if (req.user.role === 'Admin' && req.query.deliveryBoyId) filter.deliveryBoyId = req.query.deliveryBoyId;
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
    if (req.user.role !== 'Admin' && String(req.user._id) !== req.params.userId) {
      return res.status(403).json({ error: 'You can only view your own orders.' });
    }
    const orders = await Order.find({ userId: req.params.userId }).select('-deliveryOtp -deliveryOtpExpiresAt -deliveryOtpAttempts')
      .populate('products.productId', 'name imageUrl')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ error: 'Invalid order id.' });
    const order = await Order.findById(req.params.id)
      .populate('products.productId', 'name imageUrl')
      .populate('deliveryBoyId', 'name email');
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (req.user.role !== 'Admin' && String(order.userId) !== String(req.user._id) && String(order.deliveryBoyId?._id) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You are not authorized to view this order.' });
    }
    res.json(order);
  } catch (err) { res.status(500).json({ error: 'Could not load this order.' }); }
};

const createOrder = async (req, res) => {
  try {
    const { products, paymentMethod } = req.body;
    const userId = req.user._id;
    const checkoutKey = req.get('Idempotency-Key');

    // --- Existing Validations ---
    if (!userId || userId === 'guest') {
      return res.status(400).json({ error: 'Valid user account is required to place an order. Please sign in.' });
    }
    if (!Array.isArray(products) || products.length === 0 || products.length > 100) {
      return res.status(400).json({ error: 'Cannot place an empty order.' });
    }
    if (!['COD', 'Online'].includes(paymentMethod)) return res.status(400).json({ error: 'Invalid payment method.' });
    if (!checkoutKey || checkoutKey.length > 100) return res.status(400).json({ error: 'A valid checkout request key is required.' });
    const existingOrder = await Order.findOne({ userId, checkoutKey });
    if (existingOrder) return res.status(200).json(existingOrder);

    const Product = require('../models/Product');
    const normalizedProducts = [];
    for (const item of products) {
      if (!item.productId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 100) {
        return res.status(400).json({ error: 'Invalid product or quantity.' });
      }
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ error: 'A selected product is no longer available.' });
      normalizedProducts.push({ productId: product._id, quantity: Number(item.quantity), price: product.price });
    }
    const subtotal = normalizedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = Math.round(subtotal * 1.05 * 100) / 100;
    let razorpayOrderId = null;

    // --- NEW: Razorpay Integration (Fixes Currency Error) ---
    if (paymentMethod === 'Online') {
      if (!razorpay) {
        return res.status(400).json({ error: 'Online payment gateway is not configured on the server. Please select Cash on Delivery.' });
      }
      const razorpayOptions = {
        amount: Math.round(totalAmount * 100), // Convert INR to paise
        currency: "INR", // Forcing INR prevents the "International Card" error
        receipt: `receipt_${Date.now()}`,
      };
      
      const rzpOrder = await razorpay.orders.create(razorpayOptions);
      razorpayOrderId = rzpOrder.id;
    }

    // --- Preserved functionality with added payment fields ---
    const orderData = {
      userId,
      products: normalizedProducts,
      totalAmount,
      deliveryAddress: String(req.body.deliveryAddress || '').trim(),
      deliveryCoords: req.body.deliveryCoords,
      razorpayOrderId, // Added for frontend checkout
      paymentMethod,
      checkoutKey,
      // If Online, status is 'Pending' until payment is verified
      status: paymentMethod === 'Online' ? 'Pending' : 'Placed' 
    };

    const order = new Order(orderData);
    await order.save();

    // --- Existing Email Logic ---
    const user = await User.findById(userId);
    if (paymentMethod === 'COD' && user?.email) {
      await sendEmail({
        to: user.email,
        subject: 'FreshCurator order placed',
        html: '<p>Your order has been placed. We will email your delivery code when it is out for delivery.</p>'
      }).catch((emailError) => console.error('Order notification email failed:', emailError.message));
    }

    // --- Existing Socket Notification ---
    const io = getIO();
    if (io) io.emit('new_order', order);

    const publicOrder = order.toObject();
    delete publicOrder.deliveryOtp;
    delete publicOrder.deliveryOtpExpiresAt;
    delete publicOrder.deliveryOtpAttempts;
    res.status(201).json(publicOrder);
  } catch (err) {
    console.error('Order creation failed:', err);
    if (err.code === 11000 && req.user?._id) {
      const duplicate = await Order.findOne({ userId: req.user._id, checkoutKey: req.get('Idempotency-Key') });
      if (duplicate) return res.status(200).json(duplicate);
    }
    res.status(400).json({ error: err.message || 'Validation failed during order placement.' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryBoyId, deliveryOtp } = req.body;
    const allowedStatuses = ['Accepted', 'Out for Delivery', 'Delivered', 'Cancelled', 'Placed'];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid order status.' });
    if (status === 'Cancelled' && req.user.role !== 'Admin') return res.status(403).json({ error: 'Only an administrator can cancel an order.' });
    const currentOrder = await Order.findById(req.params.id).select('+deliveryOtpLastSentAt');
    if (!currentOrder) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role === 'Delivery Boy') {
      if (status === 'Accepted') {
        if (currentOrder.status !== 'Placed' || currentOrder.deliveryBoyId) return res.status(409).json({ error: 'This order has already been assigned.' });
      } else if (String(currentOrder.deliveryBoyId) !== String(req.user._id)) {
        return res.status(403).json({ error: 'This order is not assigned to you.' });
      }
    }

    if (status === 'Out for Delivery') {
      if (currentOrder.status !== 'Accepted' && currentOrder.status !== 'Out for Delivery') return res.status(409).json({ error: 'The order must be accepted before delivery starts.' });
      if (currentOrder.status === 'Out for Delivery' && currentOrder.deliveryOtpLastSentAt && Date.now() - currentOrder.deliveryOtpLastSentAt.getTime() < 60_000) {
        return res.status(429).json({ error: 'A delivery code was just sent. Please wait before resending.' });
      }
      const user = await User.findById(currentOrder.userId);
      if (!user?.email) return res.status(400).json({ error: 'The customer account has no email address.' });
      const otp = crypto.randomInt(100000, 1000000).toString();
      await sendEmail({ to: user.email, subject: 'Your FreshCurator delivery verification code', html: `<p>Your delivery code is <strong>${otp}</strong>. Share it with your delivery partner only when the order arrives.</p><p>This code expires in 24 hours.</p>` });
      currentOrder.deliveryOtp = otpDigest(otp);
      currentOrder.deliveryOtpExpiresAt = new Date(Date.now() + 24 * 60 * 60_000);
      currentOrder.deliveryOtpAttempts = 0;
      currentOrder.deliveryOtpLastSentAt = new Date();
      currentOrder.status = status;
      await currentOrder.save();
      return emitOrderUpdate(res, currentOrder);
    }

    if (status === 'Delivered') {
      if (currentOrder.status !== 'Out for Delivery') return res.status(409).json({ error: 'The order must be out for delivery before it can be completed.' });
      const existingOrder = await Order.findById(req.params.id).select('+deliveryOtp +deliveryOtpExpiresAt +deliveryOtpAttempts');
      if (!existingOrder) return res.status(404).json({ error: 'Order not found' });
      if (String(existingOrder.deliveryBoyId) !== String(req.user._id) && req.user.role !== 'Admin') return res.status(403).json({ error: 'Only the assigned delivery partner can complete this order.' });
      if (!existingOrder.deliveryOtp || !existingOrder.deliveryOtpExpiresAt || existingOrder.deliveryOtpExpiresAt < new Date()) return res.status(400).json({ error: 'Delivery code expired. Resend it before confirming delivery.' });
      if ((existingOrder.deliveryOtpAttempts || 0) >= 5) return res.status(429).json({ error: 'Too many incorrect attempts.' });
      if (!otpMatches(existingOrder.deliveryOtp, deliveryOtp || '')) {
        await Order.updateOne({ _id: existingOrder._id, deliveryOtpAttempts: { $lt: 5 } }, { $inc: { deliveryOtpAttempts: 1 } });
        return res.status(403).json({ error: 'Invalid Delivery OTP' });
      }
      const order = await Order.findOneAndUpdate({
        _id: existingOrder._id,
        deliveryOtp: existingOrder.deliveryOtp,
        deliveryOtpExpiresAt: { $gt: new Date() },
        deliveryOtpAttempts: { $lt: 5 },
        ...(req.user.role === 'Delivery Boy' ? { deliveryBoyId: req.user._id } : {})
      }, { $set: { status, deliveryOtp: null, deliveryOtpExpiresAt: null, deliveryOtpAttempts: 0 } }, { new: true });
      if (!order) return res.status(409).json({ error: 'Delivery code has expired or was already used.' });
      return emitOrderUpdate(res, order);
    }

    const updateData = {};
    updateData.status = status;
    if (req.user.role === 'Delivery Boy' && status === 'Accepted') updateData.deliveryBoyId = req.user._id;
    else if (req.user.role === 'Admin' && deliveryBoyId !== undefined) {
      if (deliveryBoyId) {
        const rider = await User.findOne({ _id: deliveryBoyId, role: 'Delivery Boy' });
        if (!rider) return res.status(400).json({ error: 'Selected delivery partner is invalid.' });
      }
      updateData.deliveryBoyId = deliveryBoyId;
    }
    const filter = { _id: req.params.id };
    if (req.user.role === 'Delivery Boy' && status === 'Accepted') Object.assign(filter, { status: 'Placed', deliveryBoyId: null });
    else if (req.user.role === 'Delivery Boy') filter.deliveryBoyId = req.user._id;

    const order = await Order.findOneAndUpdate(filter, updateData, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return emitOrderUpdate(res, order);
  } catch (err) {
    console.error('Order status update failed:', err.message);
    res.status(500).json({ error: 'Could not update order status.' });
  }
};

const emitOrderUpdate = (res, order) => {
  const io = getIO();
  if (io) {
    io.to(`order_${order._id}`).emit('order_status_update', { orderId: order._id, status: order.status });
    io.emit('order_updated', { orderId: order._id, status: order.status, deliveryBoyId: order.deliveryBoyId });
  }
  const publicOrder = order.toObject();
  delete publicOrder.deliveryOtp;
  delete publicOrder.deliveryOtpExpiresAt;
  delete publicOrder.deliveryOtpAttempts;
  delete publicOrder.deliveryOtpLastSentAt;
  return res.json(publicOrder);
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



const verifyPayment = async (req, res) => {
  try {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: 'Payment verification is unavailable or incomplete.' });
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  const matches = Buffer.from(razorpay_signature, 'hex').length === Buffer.from(expectedSign, 'hex').length && crypto.timingSafeEqual(Buffer.from(razorpay_signature, 'hex'), Buffer.from(expectedSign, 'hex'));
  if (matches) {
    const alreadyPaid = await Order.findOne({ razorpayOrderId: razorpay_order_id, userId: req.user._id, status: 'Placed', razorpayPaymentId: razorpay_payment_id });
    if (alreadyPaid) return res.json({ success: true });
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id, userId: req.user._id, status: 'Pending' },
      { status: 'Placed', paymentStatus: 'Paid', razorpayPaymentId: razorpay_payment_id }, { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Pending order not found for this payment.' });
    const user = await User.findById(order.userId);
    if (user?.email) {
      await sendEmail({ to: user.email, subject: 'FreshCurator order placed', html: '<p>Your order is confirmed. We will email your delivery code when it is out for delivery.</p>' }).catch((emailError) => console.error('Order confirmation email failed:', emailError.message));
    }
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid payment signature" });
  }
  } catch (err) {
    console.error('Payment verification failed:', err.message);
    res.status(500).json({ error: 'Could not verify this payment. Keep your order reference and contact support if you were charged.' });
  }
};

module.exports = {
  getOrders,
  getOrdersByUser,
  getOrderById,
  getAvailableOrders,
  createOrder,
  updateOrderStatus,
  verifyPayment,
  otpDigest,
  otpMatches
};
