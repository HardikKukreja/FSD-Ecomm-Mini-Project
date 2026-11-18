import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(10, 'Valid phone required'),
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  zip: z.string().min(4, 'ZIP code required'),
  country: z.string().min(2, 'Country required'),
});

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, discount, total, coupon, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { country: 'India' },
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const onSubmit = async (shippingAddress) => {
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({ productId: i.product._id, qty: i.qty }));
      const res = await api.post('/orders', {
        items: orderItems,
        shippingAddress,
        couponCode: coupon?.code || undefined,
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Address Form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Shipping Address</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input {...register('name')} className="input" placeholder="John Doe" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input {...register('phone')} className="input" placeholder="+91 98765 43210" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input {...register('street')} className="input" placeholder="123, Main Street, Apt 4B" />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input {...register('city')} className="input" placeholder="Mumbai" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input {...register('state')} className="input" placeholder="Maharashtra" />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input {...register('zip')} className="input" placeholder="400001" />
                  {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input {...register('country')} className="input" />
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-5">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mock Payment</p>
                    <p className="text-xs text-gray-500">Your order will be placed instantly (demo mode)</p>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                  {loading ? 'Placing Order…' : `Place Order — ₹${total().toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product._id} className="flex gap-3">
                  <img src={item.product.images?.[0] || 'https://via.placeholder.com/48'} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover bg-gray-50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 font-medium line-clamp-2">{item.product.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                    ₹{((item.product.discountPrice || item.product.price) * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal().toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-green-600">Free</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2"><span>Total</span><span>₹{total().toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

