import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useUIStore } from '../../store/uiStore';
import { disconnectSocket } from '../../lib/socket';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuthStore();
  const count = useCartStore((s) => s.count);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { setCartOpen } = useUIStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">ShopSphere</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">Products</Link>
            <Link to="/wishlist" className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors">Wishlist</Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-50">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="relative p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-50">
              <ShoppingCart className="h-5 w-5" />
              {count() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {count()}
                </span>
              )}
            </button>

            {/* User */}
            {isLoggedIn() ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    {isAdmin() && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-50">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-700">Home</Link>
          <Link to="/products" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-700">Products</Link>
          <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-700">Wishlist</Link>
          {isLoggedIn() ? (
            <>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-700">My Orders</Link>
              {isAdmin() && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-700">Admin</Link>}
              <button onClick={handleLogout} className="block py-2 text-sm text-red-600">Logout</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm flex-1 text-center">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm flex-1 text-center">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

