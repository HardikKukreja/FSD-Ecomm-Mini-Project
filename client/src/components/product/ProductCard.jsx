import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import StarRating from './StarRating';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const inWishlist = has(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return toast.error('Out of stock');
    addItem(product, 1);
    toast.success('Added to cart!');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product);
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Link to={`/products/${product._id}`} className="card group hover:shadow-md transition-shadow duration-200 overflow-hidden block">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round((1 - product.discountPrice / product.price) * 100)}%
          </div>
        )}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-sm hover:scale-110 transition-transform ${inWishlist ? 'text-red-500' : 'text-gray-400'}`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">{product.title}</h3>
        {product.ratingCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <StarRating rating={product.ratingAvg} />
            <span className="text-xs text-gray-500">({product.ratingCount})</span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-gray-900">₹{displayPrice.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full btn-primary text-sm py-2 gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}

