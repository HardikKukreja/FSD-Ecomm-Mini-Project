import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../store/authStore';

export function useSocket() {
  const { token, isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoggedIn() || !token) return;

    const socket = connectSocket(token);

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    socket.on('stockUpdated', ({ productId, newStock }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    });

    socket.on('orderStatusUpdated', ({ orderId, status }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success(`Order status updated to: ${status}`);
    });

    socket.on('newOrder', (order) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(`New order received!`);
    });

    socket.on('lowStockAlert', (product) => {
      toast.error(`Low stock: ${product.title} (${product.stock} left)`, { duration: 6000 });
    });

    socket.on('notification', ({ message }) => {
      toast(message);
    });

    return () => {
      socket.off('stockUpdated');
      socket.off('orderStatusUpdated');
      socket.off('newOrder');
      socket.off('lowStockAlert');
      socket.off('notification');
    };
  }, [token, isLoggedIn, queryClient]);
}

