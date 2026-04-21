const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/send-otp', userController.sendLoginOtp);
router.post('/login', userController.loginUser);
router.post('/social-sync', userController.socialSync);
router.get('/check-admin', userController.checkAdminExists);
router.get('/', protect, userController.getUsers);
router.get('/profile', protect, userController.updateProfile); // GET just to return current
router.put('/profile', protect, userController.updateProfile);
router.patch('/:id/role', protect, userController.updateUserRole);

module.exports = router;
