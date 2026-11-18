import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, discount, total, setCoupon, removeCoupon, coupon } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (!isLoggedIn()) { toast.error('Login to apply coupon'); return; }
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, cartTotal: subtotal() });
      setCoupon(res.data.coupon, res.data.discount);
      toast.success(`Coupon applied! You save ₹${res.data.discount.toLocaleString()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn()) { toast.error('Login to checkout'); navigate('/login'); return; }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product._id} className="card p-4 flex gap-4">
              <img
                src={item.product.images?.[0] || 'https://via.placeholder.com/80'}
                alt={item.product.title}
                className="w-20 h-20 object-cover rounded-lg bg-gray-50 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product._id}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2 text-sm">
                  {item.product.title}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{item.product.brand}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => item.qty > 1 ? updateQty(item.product._id, item.qty - 1) : removeItem(item.product._id)}
                      className="px-3 py-1 hover:bg-gray-50 text-lg leading-none rounded-l-lg"
                    >-</button>
                    <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.product._id, item.qty + 1)}
                      className="px-3 py-1 hover:bg-gray-50 text-lg leading-none rounded-r-lg"
                    >+</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">
                      ₹{((item.product.discountPrice || item.product.price) * item.qty).toLocaleString()}
                    </span>
                    <button onClick={() => removeItem(item.product._id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>₹{subtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span><span className="text-green-600">Free</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span><span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span><span>₹{total().toLocaleString()}</span>
              </div>
            </div>

            {/* Coupon */}
            {coupon ? (
              <div className="mb-4 flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <Tag className="h-4 w-4" /><span className="font-medium">{coupon.code}</span>
                </div>
                <button onClick={() => { removeCoupon(); setCouponCode(''); }} className="text-red-500 text-xs hover:text-red-700 font-medium">Remove</button>
              </div>
            ) : (
              <form onSubmit={handleCoupon} className="mb-4 flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="input flex-1 text-sm"
                />
                <button type="submit" disabled={couponLoading} className="btn-secondary text-sm px-3 whitespace-nowrap">
                  {couponLoading ? '…' : 'Apply'}
                </button>
              </form>
            )}
            <p className="text-xs text-gray-400 mb-5">Try: WELCOME10 · FLAT200 · SALE25</p>

            <button onClick={handleCheckout} className="btn-primary w-full py-3 text-base">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

