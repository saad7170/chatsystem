const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['private', 'group'],
      default: 'private'
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Conversation name cannot be more than 100 characters']
    },
    avatar: {
      type: String
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        joinedAt: {
          type: Date,
          default: Date.now
        },
        lastReadAt: {
          type: Date,
          default: Date.now
        },
        isAdmin: {
          type: Boolean,
          default: false
        }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
