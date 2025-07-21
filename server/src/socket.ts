import { Server } from 'socket.io';
import http from 'http';
import Message from './models/Message';
import User from './models/User';

export function setupSocket(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // Authenticate user (for demo, userId in query)
    const userId = socket.handshake.query.userId as string;
    if (!userId) return socket.disconnect();
    socket.join(userId);

    // Join all property rooms and DM rooms (client should send roomIds)
    socket.on('join_rooms', ({ roomIds }) => {
      try {
        if (Array.isArray(roomIds)) {
          roomIds.forEach(roomId => socket.join(roomId));
        }
      } catch (err) {
        socket.emit('error', { message: 'Sorry, we could not join your chat rooms. Please try again.' });
      }
    });

    // Send message (group or DM)
    socket.on('send_message', async (data) => {
      try {
        const { roomId, recipient, content, type, attachment } = data;
        const message = await Message.create({
          roomId,
          sender: userId,
          recipient,
          content,
          type: type || 'text',
          attachment,
          status: 'sent',
          deliveredTo: [],
          readBy: [],
        });
        io.to(roomId).emit('message', message);
        if (recipient) io.to(recipient).emit('message', message);
      } catch (err) {
        socket.emit('error', { message: 'Sorry, we could not send your message. Please try again.' });
      }
    });

    // Delivered
    socket.on('delivered', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message && !message.deliveredTo.includes(userId)) {
          message.deliveredTo.push(userId);
          message.status = 'delivered';
          await message.save();
          io.to(message.sender.toString()).emit('delivered', { messageId, userId });
        }
      } catch (err) {
        socket.emit('error', { message: 'Sorry, we could not update message delivery status.' });
      }
    });

    // Read
    socket.on('read', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message && !message.readBy.includes(userId)) {
          message.readBy.push(userId);
          message.status = 'read';
          await message.save();
          io.to(message.sender.toString()).emit('read', { messageId, userId });
        }
      } catch (err) {
        socket.emit('error', { message: 'Sorry, we could not update message read status.' });
      }
    });

    // Typing
    socket.on('typing', ({ roomId }) => {
      try {
        socket.to(roomId).emit('typing', { userId });
      } catch (err) {
        socket.emit('error', { message: 'Sorry, typing indicator failed.' });
      }
    });

    socket.on('disconnect', () => {
      // Handle disconnect logic if needed
    });
  });
}
