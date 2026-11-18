import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShoppingBag, Zap, Shield, Truck } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';

export default function Home() {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products?isFeatured=true&limit=8').then((r) => r.data),
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Shop Everything,<br />
              <span className="text-primary-200">Anywhere.</span>
            </h1>
            <p className="text-lg text-primary-100 mb-8">
              Discover thousands of products across electronics, fashion, home & more. Fast delivery, easy returns, and unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
                <ShoppingBag className="h-5 w-5" /> Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/products?sort=newest" className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹499' },
              { icon: Shield, title: 'Secure Payments', desc: '100% safe & encrypted' },
              { icon: Zap, title: 'Easy Returns', desc: '30-day hassle-free returns' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categoriesData?.categories?.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
              All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categoriesData.categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                  <img src={cat.image || 'https://via.placeholder.com/80'} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="pb-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredData?.products?.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-primary-50 py-14">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get the best deals first</h2>
          <p className="text-gray-500 mb-6">Subscribe to our newsletter for exclusive offers and updates.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="input flex-1" />
            <button type="submit" className="btn-primary px-6 whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

