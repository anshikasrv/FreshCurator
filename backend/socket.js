const { Server } = require('socket.io');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // Delivery Boy accepts order -> joins order room
    socket.on('accept_order', (data) => {
      const { orderId, deliveryBoyId } = data;
      const roomName = `order_${orderId}`;
      socket.join(roomName);
      console.log(`🚴 Delivery boy ${deliveryBoyId} joined room ${roomName}`);
      io.to(roomName).emit('order_status_update', {
        orderId,
        status: 'Accepted',
        message: 'Delivery boy has accepted your order.'
      });
    });

    // User joins to listen to their order status
    socket.on('join_order_room', (orderId) => {
      const roomName = `order_${orderId}`;
      socket.join(roomName);
      console.log(`👤 User joined room ${roomName}`);
    });

    // Delivery boy sends location update
    socket.on('update_location', (data) => {
      const { orderId, location } = data;
      const roomName = `order_${orderId}`;
      io.to(roomName).emit('location_update', location);
    });

    // Delivery boy updates order status (picked up / delivered)
    socket.on('delivery_status_changed', (data) => {
      const { orderId, status } = data;
      const roomName = `order_${orderId}`;
      io.to(roomName).emit('order_status_update', { orderId, status });
      // Also broadcast to admin
      io.emit('order_updated', { orderId, status });
      console.log(`📦 Order ${orderId} status changed to: ${status}`);
    });

    // Chat logic
    socket.on('get_history', async (orderId) => {
      const Message = require('./models/Message');
      const messages = await Message.find({ orderId }).sort({ createdAt: 1 });
      socket.emit('chat_history', messages);
    });

    socket.on('send_message', async (data) => {
      const Message = require('./models/Message');
      const { orderId, senderName, senderRole, content } = data;
      const roomName = `order_${orderId}`;
      const msg = await Message.create({ orderId, senderName, senderRole, content });
      io.to(roomName).emit('receive_message', msg);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocket, getIO };
