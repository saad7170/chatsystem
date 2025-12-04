const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for logged in user
// @route   GET /api/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      'participants.user': req.user._id
    })
      .populate('participants.user', 'name email avatar onlineStatus lastSeenAt')
      .populate('lastMessage')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name avatar'
        }
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create or get private conversation
// @route   POST /api/conversations
// @access  Private
exports.createConversation = async (req, res) => {
  try {
    const { userId, type, name, participantIds } = req.body;

    if (type === 'private') {
      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        type: 'private',
        'participants.user': { $all: [req.user._id, userId] }
      })
        .populate('participants.user', 'name email avatar onlineStatus lastSeenAt')
        .populate('lastMessage');

      if (existingConversation) {
        return res.json({
          success: true,
          data: existingConversation
        });
      }

      // Create new private conversation
      const conversation = await Conversation.create({
        type: 'private',
        participants: [
          { user: req.user._id, isAdmin: false },
          { user: userId, isAdmin: false }
        ],
        createdBy: req.user._id
      });

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants.user', 'name email avatar onlineStatus lastSeenAt')
        .populate('lastMessage');

      res.status(201).json({
        success: true,
        data: populatedConversation
      });
    } else if (type === 'group') {
      // Create group conversation
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Group name is required'
        });
      }

      if (!participantIds || participantIds.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'At least 2 participants required for group'
        });
      }

      const participants = [
        { user: req.user._id, isAdmin: true },
        ...participantIds.map(id => ({ user: id, isAdmin: false }))
      ];

      const conversation = await Conversation.create({
        type: 'group',
        name,
        participants,
        createdBy: req.user._id
      });

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants.user', 'name email avatar onlineStatus lastSeenAt')
        .populate('lastMessage');

      res.status(201).json({
        success: true,
        data: populatedConversation
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get conversation by ID
// @route   GET /api/conversations/:id
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants.user', 'name email avatar onlineStatus lastSeenAt')
      .populate('lastMessage');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete conversation
// @route   DELETE /api/conversations/:id
// @access  Private
exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversation: conversation._id });

    // Delete conversation
    await conversation.deleteOne();

    res.json({
      success: true,
      message: 'Conversation deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add participant to group
// @route   POST /api/conversations/:id/participants
// @access  Private
exports.addParticipant = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Can only add participants to group conversations'
      });
    }

    // Check if requester is admin
    const requesterParticipant = conversation.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!requesterParticipant || !requesterParticipant.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add participants'
      });
    }

    // Check if user is already a participant
    const isAlreadyParticipant = conversation.participants.some(
      p => p.user.toString() === userId
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({
        success: false,
        message: 'User is already a participant'
      });
    }

    // Add participant
    conversation.participants.push({ user: userId, isAdmin: false });
    await conversation.save();

    const updatedConversation = await Conversation.findById(conversation._id)
      .populate('participants.user', 'name email avatar onlineStatus lastSeenAt')
      .populate('lastMessage');

    res.json({
      success: true,
      data: updatedConversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove participant from group
// @route   DELETE /api/conversations/:id/participants/:userId
// @access  Private
exports.removeParticipant = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Can only remove participants from group conversations'
      });
    }

    // Check if requester is admin
    const requesterParticipant = conversation.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!requesterParticipant || !requesterParticipant.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove participants'
      });
    }

    // Remove participant
    conversation.participants = conversation.participants.filter(
      p => p.user.toString() !== req.params.userId
    );

    await conversation.save();

    const updatedConversation = await Conversation.findById(conversation._id)
      .populate('participants.user', 'name email avatar onlineStatus lastSeenAt')
      .populate('lastMessage');

    res.json({
      success: true,
      data: updatedConversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
