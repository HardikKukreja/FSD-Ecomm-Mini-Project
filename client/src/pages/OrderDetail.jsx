import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Package } from 'lucide-react';
import api from '../lib/api';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="py-32"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-20 text-red-500">Order not found.</div>;

  const order = data?.order;
  const stepIndex = order.orderStatus === 'cancelled' ? -1 : STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <Badge value={order.orderStatus} />
      </div>

      {/* Status stepper */}
      {order.orderStatus !== 'cancelled' && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= stepIndex ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 capitalize font-medium ${i <= stepIndex ? 'text-primary-600' : 'text-gray-400'}`}>{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${i < stepIndex ? 'bg-primary-600' : 'bg-gray-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Shipping */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Shipping Address</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">{order.shippingAddress?.name}</p>
            <p>{order.shippingAddress?.phone}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Order Summary</h3>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount?.toLocaleString()}</span></div>}
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-green-600">Free</span></div>
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2"><span>Total</span><span>₹{order.total?.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-600"><span>Payment</span><span><Badge value={order.paymentStatus} /></span></div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Items ({order.items.length})</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
              <img src={item.product?.images?.[0] || 'https://via.placeholder.com/80'} alt={item.product?.title} className="w-16 h-16 rounded-lg object-cover bg-gray-50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{item.product?.title}</p>
                <p className="text-xs text-gray-500 mt-1">Qty: {item.qty} × ₹{item.priceAtPurchase?.toLocaleString()}</p>
              </div>
              <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">₹{(item.qty * item.priceAtPurchase).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

