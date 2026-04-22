const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getOrders);
router.get('/available', orderController.getAvailableOrders);
router.get('/user/:userId', orderController.getOrdersByUser);
router.post('/', orderController.createOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.post('/verify-payment', orderController.verifyPayment);

module.exports = router;
