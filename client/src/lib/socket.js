import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let socket = null;

export const connectSocket = (token) => {
  if (socket && socket.connected) return socket;
  socket = io(URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

