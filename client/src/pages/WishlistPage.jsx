import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import ProductCard from '../components/product/ProductCard';

export default function WishlistPage() {
  const { items, toggle } = useWishlistStore();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
          <Link to="/products" className="btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((product) => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />
              <button
                onClick={() => toggle(product)}
                className="absolute top-2 left-2 p-1.5 bg-white rounded-lg shadow text-red-500 hover:bg-red-50 z-10"
                title="Remove from wishlist"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

