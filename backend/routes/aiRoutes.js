const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/tips', protect, aiController.getAiTips);
router.post('/chat', protect, aiController.chatFreshCurator);

module.exports = router;
