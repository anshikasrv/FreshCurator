const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/tips', aiController.getAiTips);
router.post('/chat', aiController.chatFreshCurator);

module.exports = router;
