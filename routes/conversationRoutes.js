const express = require('express');
const router = express.Router();
const {
  getConversations,
  createConversation,
  getConversation,
  deleteConversation,
  addParticipant,
  removeParticipant
} = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes are protected

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.route('/:id')
  .get(getConversation)
  .delete(deleteConversation);

router.post('/:id/participants', addParticipant);
router.delete('/:id/participants/:userId', removeParticipant);

module.exports = router;
