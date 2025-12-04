const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  markConversationAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes are protected

// Conversation messages
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/read', markConversationAsRead);

// Individual messages
router.put('/messages/:id', editMessage);
router.delete('/messages/:id', deleteMessage);
router.put('/messages/:id/read', markAsRead);

module.exports = router;
