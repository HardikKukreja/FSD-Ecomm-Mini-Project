import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';

const emptyForm = { title: '', description: '', price: '', discountPrice: '', sku: '', brand: '', stock: '', category: '', images: '', isFeatured: false };

export default function AdminProducts() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => api.get('/categories').then(r => r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => api.get(`/products?page=${page}&limit=10${search ? `&search=${search}` : ''}`).then(r => r.data),
    keepPreviousData: true,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => editing
      ? api.put(`/products/${editing._id}`, payload)
      : api.post('/products', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(editing ? 'Product updated!' : 'Product created!');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, price: p.price, discountPrice: p.discountPrice || '', sku: p.sku, brand: p.brand || '', stock: p.stock, category: p.category?._id || '', images: p.images?.join(',') || '', isFeatured: p.isFeatured });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock),
      images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    saveMutation.mutate(payload);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate} className="btn-primary gap-2"><Plus className="h-4 w-4" /> Add Product</button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…" className="input pl-9" />
        </div>
      </div>

      {/* Table */}
      {isLoading ? <div className="py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Product', 'SKU', 'Price', 'Stock', 'Category', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.products?.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                        <span className="font-medium text-gray-900 line-clamp-2 max-w-xs">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold">₹{(p.discountPrice || p.price).toLocaleString()}</span>
                        {p.discountPrice && <span className="text-xs text-gray-400 line-through ml-1">₹{p.price.toLocaleString()}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock < 5 ? 'text-red-600' : p.stock < 20 ? 'text-yellow-600' : 'text-green-600'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                    <td className="px-4 py-3">{p.isFeatured ? <Badge value="active" label="Yes" /> : <span className="text-gray-400 text-xs">No</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p._id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
            <span>{data?.totalCount || 0} products</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary text-xs px-3 py-1">Prev</button>
              <span className="px-2 py-1">Page {page} of {data?.totalPages || 1}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= (data?.totalPages || 1)} className="btn-secondary text-xs px-3 py-1">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input min-h-[80px] resize-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input" required min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹)</label>
              <input type="number" value={form.discountPrice} onChange={e => setForm({...form, discountPrice: e.target.value})} className="input" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="input" required min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input" required>
                <option value="">Select category</option>
                {catData?.categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma-separated)</label>
              <input value={form.images} onChange={e => setForm({...form, images: e.target.value})} className="input" placeholder="https://...jpg, https://...jpg" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="rounded text-primary-600" />
              <label htmlFor="featured" className="text-sm text-gray-700">Featured product</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

