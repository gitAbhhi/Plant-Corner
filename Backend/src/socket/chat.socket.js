const { verifyToken } = require('../utils/jwt.utils');
const User     = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Message  = require('../models/Message');

const initSocket = (io) => {
  // Auth middleware for every socket connection
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');

      if (!user)           return next(new Error('User not found'));
      if (user.isBlocked)  return next(new Error('Account is blocked'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.user.username} [${socket.id}]`);

    // Join a chat room
    socket.on('join_room', async (roomId) => {
      try {
        const room = await ChatRoom.findById(roomId);
        if (!room) return socket.emit('error', 'Room not found');

        const isParticipant =
          room.buyer.toString()  === socket.user._id.toString() ||
          room.seller.toString() === socket.user._id.toString();

        if (!isParticipant) return socket.emit('error', 'Not a participant');

        socket.join(roomId);
        console.log(`📥 ${socket.user.username} joined room ${roomId}`);
      } catch (err) {
        socket.emit('error', 'Failed to join room');
      }
    });

    // Send a message — persist to DB then broadcast
    socket.on('send_message', async ({ chatRoomId, content }) => {
      try {
        if (!chatRoomId || !content?.trim()) return;

        const room = await ChatRoom.findById(chatRoomId);
        if (!room) return socket.emit('error', 'Room not found');

        const isParticipant =
          room.buyer.toString()  === socket.user._id.toString() ||
          room.seller.toString() === socket.user._id.toString();

        if (!isParticipant) return socket.emit('error', 'Not a participant');

        // Save to MongoDB
        const message = await Message.create({
          chatRoom: chatRoomId,
          sender:   socket.user._id,
          content:  content.trim(),
        });

        // Broadcast payload to everyone in the room
        const payload = {
          id:         message._id,
          chatRoomId: chatRoomId,
          senderId:   socket.user._id,
          senderName: socket.user.username,
          content:    message.content,
          timestamp:  message.createdAt,
        };

        io.to(chatRoomId).emit('receive_message', payload);
      } catch (err) {
        console.error('Socket send_message error:', err);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Leave a room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`📤 ${socket.user.username} left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Disconnected: ${socket.user?.username}`);
    });
  });
};

module.exports = initSocket;
