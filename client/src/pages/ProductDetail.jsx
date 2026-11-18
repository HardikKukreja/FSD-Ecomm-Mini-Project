import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Minus, Plus, ArrowLeft, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import StarRating from '../components/product/StarRating';
import ProductCard from '../components/product/ProductCard';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
  });

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get(`/products/${id}/reviews`).then((r) => r.data),
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related-products', productData?.product?.category?._id],
    queryFn: () => api.get(`/products?category=${productData.product.category._id}&limit=4`).then((r) => r.data),
    enabled: !!productData?.product?.category?._id,
  });

  if (isLoading) return <div className="py-32"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-20 text-red-500">Product not found.</div>;

  const product = productData?.product;
  const inWishlist = has(product._id);
  const displayPrice = product.discountPrice || product.price;

  const handleAddToCart = () => {
    if (product.stock === 0) return toast.error('Out of stock');
    if (qty > product.stock) return toast.error(`Only ${product.stock} in stock`);
    addItem(product, qty);
    toast.success(`${product.title} added to cart!`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) return toast.error('Login to submit a review');
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted!');
      setReviewComment('');
      refetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const relatedProducts = relatedData?.products?.filter((p) => p._id !== id).slice(0, 4) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
            <img src={product.images?.[activeImg] || 'https://via.placeholder.com/600'} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${i === activeImg ? 'border-primary-600' : 'border-transparent'}`}>
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.category && <Badge value="active" label={product.category.name} />}
            {product.brand && <span className="text-sm text-gray-500">{product.brand}</span>}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>

          {product.ratingCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.ratingAvg} size="md" />
              <span className="text-sm text-gray-500">{product.ratingAvg} ({product.ratingCount} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">₹{displayPrice.toLocaleString()}</span>
            {product.discountPrice && product.discountPrice < product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="text-green-600 font-semibold text-sm">
                  {Math.round((1 - product.discountPrice / product.price) * 100)}% off
                </span>
              </>
            )}
          </div>

          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium text-sm">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-500 font-medium text-sm">✗ Out of Stock</span>
            )}
          </div>

          {/* Quantity + Actions */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-gray-50 rounded-l-lg">
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 font-medium text-sm">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-2 hover:bg-gray-50 rounded-r-lg">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary flex-1 gap-2 py-2.5">
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </button>
            <button
              onClick={() => { toggle(product); toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist!'); }}
              className={`p-2.5 rounded-lg border ${inWishlist ? 'border-red-300 text-red-500 bg-red-50' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-10">
        <div className="flex border-b border-gray-200 mb-6">
          {['description', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {tab} {tab === 'reviews' && reviewsData?.total ? `(${reviewsData.total})` : ''}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose max-w-none text-gray-600 leading-relaxed">{product.description}</div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {/* Review form */}
            {isLoggedIn() && (
              <form onSubmit={handleSubmitReview} className="card p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Rating</label>
                  <StarRating rating={reviewRating} onRate={setReviewRating} size="lg" />
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product…"
                  className="input min-h-[100px] resize-none mb-4"
                  required
                />
                <button type="submit" disabled={submittingReview} className="btn-primary">
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Reviews list */}
            {reviewsData?.reviews?.length === 0 && <p className="text-gray-500">No reviews yet. Be the first!</p>}
            <div className="space-y-4">
              {reviewsData?.reviews?.map((r) => (
                <div key={r._id} className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-xs">{r.user?.name?.[0]}</span>
                      </div>
                      <span className="font-medium text-sm text-gray-900">{r.user?.name}</span>
                      {r.verifiedPurchase && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified Purchase</span>}
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="text-gray-600 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

