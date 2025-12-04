const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateProfile,
  updateStatus
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes are protected

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.put('/status', updateStatus);

module.exports = router;
