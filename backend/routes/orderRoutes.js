const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/', protect, orderController.getOrders);
router.get('/available', protect, requireRole('Delivery Boy', 'Admin'), orderController.getAvailableOrders);
router.get('/user/:userId', protect, orderController.getOrdersByUser);
router.post('/', protect, orderController.createOrder);
router.post('/verify-payment', protect, orderController.verifyPayment);
router.get('/:id', protect, orderController.getOrderById);
router.patch('/:id/status', protect, requireRole('Delivery Boy', 'Admin'), orderController.updateOrderStatus);

module.exports = router;
