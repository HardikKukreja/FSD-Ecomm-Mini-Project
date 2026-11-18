import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import api from '../lib/api';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';

export default function OrderHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my').then((r) => r.data),
  });

  if (isLoading) return <div className="py-32"><Spinner size="lg" /></div>;

  const orders = data?.orders || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-24">
          <Package className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card p-5 block hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">₹{order.total.toLocaleString()}</p>
                  <Badge value={order.orderStatus} />
                </div>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {order.items.map((item) => (
                  <img key={item._id} src={item.product?.images?.[0] || 'https://via.placeholder.com/48'} alt={item.product?.title} className="w-12 h-12 rounded-lg object-cover bg-gray-50 flex-shrink-0 border border-gray-100" />
                ))}
                <span className="text-sm text-gray-500 whitespace-nowrap">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

