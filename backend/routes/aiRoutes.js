const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// @route   POST api/ai/chat
// @desc    Chat with LiftRank AI Coach
// @access  Private
router.post('/chat', auth, aiController.chatWithCoach);

module.exports = router;
