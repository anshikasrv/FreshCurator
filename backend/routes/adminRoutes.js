const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/stats', protect, requireRole('Admin'), adminController.getDashboardStats);

module.exports = router;
