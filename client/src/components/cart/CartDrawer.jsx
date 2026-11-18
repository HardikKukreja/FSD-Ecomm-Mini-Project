import { Link } from 'react-router-dom';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUIStore();
  const { items, removeItem, updateQty, subtotal, discount, total, count } = useCartStore();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
      <div className="relative w-full max-w-sm bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Cart ({count()} items)</h2>
          <button onClick={() => setCartOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
            <ShoppingBag className="h-12 w-12 text-gray-300" />
            <p>Your cart is empty</p>
            <Link to="/products" onClick={() => setCartOpen(false)} className="btn-primary text-sm">
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.product._id} className="flex gap-3">
                  <img
                    src={item.product.images?.[0] || 'https://via.placeholder.com/80'}
                    alt={item.product.title}
                    className="h-16 w-16 object-cover rounded-lg bg-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.title}</p>
                    <p className="text-sm text-primary-600 font-semibold">
                      ₹{(item.product.discountPrice || item.product.price).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => item.qty > 1 ? updateQty(item.product._id, item.qty - 1) : removeItem(item.product._id)}
                        className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50"
                      >-</button>
                      <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.product._id, item.qty + 1)}
                        className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50"
                      >+</button>
                      <button onClick={() => removeItem(item.product._id)} className="ml-auto text-red-400 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>₹{subtotal().toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span><span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span><span>₹{total().toLocaleString()}</span>
              </div>
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="btn-primary w-full text-center block"
              >
                View Cart & Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

