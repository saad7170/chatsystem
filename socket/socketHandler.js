const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

let onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User connects
    socket.on('user:online', async (userId) => {
      try {
        // Store socket ID
        onlineUsers.set(userId, socket.id);

        // Update user status in database
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          onlineStatus: 'online',
          lastSeenAt: new Date()
        });

        // Broadcast to all users
        socket.broadcast.emit('user:status', {
          userId,
          status: 'online',
          socketId: socket.id
        });

        console.log(`User ${userId} is online`);
      } catch (error) {
        console.error('Error in user:online:', error);
      }
    });

    // Join conversation room
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation:${conversationId}`);
    });

    // Leave conversation room
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} left conversation:${conversationId}`);
    });

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, senderId, content, type, replyTo } = data;

        // Create message
        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          content,
          type: type || 'text',
          replyTo: replyTo || null
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });

        // Populate message
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name avatar')
          .populate('replyTo', 'content sender');

        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit('message:receive', populatedMessage);

        console.log(`Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error('Error in message:send:', error);
        socket.emit('message:error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      const { conversationId, userId, userName } = data;
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userId,
        userName,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data) => {
      const { conversationId, userId } = data;
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userId,
        isTyping: false
      });
    });

    // Message read receipt
    socket.on('message:read', async (data) => {
      try {
        const { messageId, userId, conversationId } = data;

        const message = await Message.findById(messageId);

        if (message) {
          const alreadyRead = message.readBy.some(
            r => r.user.toString() === userId
          );

          if (!alreadyRead) {
            message.readBy.push({
              user: userId,
              readAt: new Date()
            });
            await message.save();
          }

          // Emit to conversation room
          io.to(`conversation:${conversationId}`).emit('message:read:update', {
            messageId,
            userId,
            readAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error in message:read:', error);
      }
    });

    // Message edited
    socket.on('message:edit', async (data) => {
      try {
        const { messageId, content, conversationId } = data;

        const message = await Message.findById(messageId);

        if (message) {
          message.content = content;
          message.isEdited = true;
          message.editedAt = new Date();
          await message.save();

          const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar')
            .populate('replyTo', 'content sender');

          // Emit to conversation room
          io.to(`conversation:${conversationId}`).emit('message:edited', populatedMessage);
        }
      } catch (error) {
        console.error('Error in message:edit:', error);
      }
    });

    // Message deleted
    socket.on('message:delete', async (data) => {
      try {
        const { messageId, conversationId } = data;

        const message = await Message.findById(messageId);

        if (message) {
          message.deletedAt = new Date();
          message.content = 'This message was deleted';
          await message.save();

          // Emit to conversation room
          io.to(`conversation:${conversationId}`).emit('message:deleted', {
            messageId,
            deletedAt: message.deletedAt
          });
        }
      } catch (error) {
        console.error('Error in message:delete:', error);
      }
    });

    // User disconnect
    socket.on('disconnect', async () => {
      try {
        // Find user by socket ID
        let disconnectedUserId = null;
        for (const [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            disconnectedUserId = userId;
            onlineUsers.delete(userId);
            break;
          }
        }

        if (disconnectedUserId) {
          // Update user status
          await User.findByIdAndUpdate(disconnectedUserId, {
            socketId: null,
            onlineStatus: 'offline',
            lastSeenAt: new Date()
          });

          // Broadcast to all users
          socket.broadcast.emit('user:status', {
            userId: disconnectedUserId,
            status: 'offline',
            lastSeenAt: new Date()
          });

          console.log(`User ${disconnectedUserId} disconnected`);
        }

        console.log('Client disconnected:', socket.id);
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });
};

module.exports = socketHandler;
