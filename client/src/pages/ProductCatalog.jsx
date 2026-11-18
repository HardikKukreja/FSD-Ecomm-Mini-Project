import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';

export default function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filterOpen, setFilterOpen] = useState(false);

  const page = Number(searchParams.get('page') || 1);
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    if (key !== 'page') p.delete('page');
    setSearchParams(p);
  };

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, category, minPrice, maxPrice, sort, search],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: 12, sort });
      if (category) params.set('category', category);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (search) params.set('search', search);
      return api.get(`/products?${params}`).then((r) => r.data);
    },
    keepPreviousData: true,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('search', search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`w-full md:w-56 flex-shrink-0 ${filterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button className="md:hidden" onClick={() => setFilterOpen(false)}><X className="h-4 w-4" /></button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cat" checked={!category} onChange={() => setParam('category', '')} className="text-primary-600" />
                  <span className="text-sm text-gray-600">All</span>
                </label>
                {categoriesData?.categories?.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" checked={category === cat._id} onChange={() => setParam('category', cat._id)} className="text-primary-600" />
                    <span className="text-sm text-gray-600">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number" placeholder="Min" value={minPrice}
                  onChange={(e) => setParam('minPrice', e.target.value)}
                  className="input text-xs py-1.5 px-2"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number" placeholder="Max" value={maxPrice}
                  onChange={(e) => setParam('maxPrice', e.target.value)}
                  className="input text-xs py-1.5 px-2"
                />
              </div>
            </div>

            {/* Clear filters */}
            {(category || minPrice || maxPrice || search) && (
              <button onClick={() => { setSearch(''); setSearchParams({}); }} className="text-sm text-red-500 hover:text-red-700 font-medium">
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <form onSubmit={handleSearch} className="flex-1 min-w-0 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search" placeholder="Search products…" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-9"
                />
              </div>
              <button type="submit" className="btn-primary px-4">Search</button>
            </form>
            <select value={sort} onChange={(e) => setParam('sort', e.target.value)} className="input w-auto">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <button onClick={() => setFilterOpen(true)} className="md:hidden btn-secondary gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>

          {data && (
            <p className="text-sm text-gray-500 mb-4">
              Showing {data.products?.length} of {data.totalCount} products
            </p>
          )}

          {isLoading ? (
            <div className="py-20"><Spinner size="lg" /></div>
          ) : data?.products?.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No products found. Try different filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data?.products?.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={data?.totalPages || 1}
            onPageChange={(p) => setParam('page', p)}
          />
        </div>
      </div>
    </div>
  );
}

