import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);
    if (socket.user.role === 'admin') socket.join('admins');
    console.log(`Socket connected: ${socket.user.email}`);
    socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.user.email}`));
  });

  return io;
};

export const emitToAdmins = (event, data) => { if (io) io.to('admins').emit(event, data); };
export const emitToUser = (userId, event, data) => { if (io) io.to(`user:${userId}`).emit(event, data); };
export const emitStockUpdate = (productId, newStock) => { if (io) io.emit('stockUpdated', { productId, newStock }); };
export const emitLowStock = (product) => { if (io) io.to('admins').emit('lowStockAlert', product); };

