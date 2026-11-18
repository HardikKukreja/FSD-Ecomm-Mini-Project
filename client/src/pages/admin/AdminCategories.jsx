import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

const emptyForm = { name: '', slug: '', description: '', image: '' };

export default function AdminCategories() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => api.get('/categories').then(r => r.data) });

  const saveMutation = useMutation({
    mutationFn: (payload) => editing ? api.put(`/categories/${editing._id}`, payload) : api.post('/categories', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success(editing ? 'Updated!' : 'Created!'); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description || '', image: c.image || '' }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.slug) form.slug = form.name.toLowerCase().replace(/\s+/g, '-');
    saveMutation.mutate(form);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openCreate} className="btn-primary gap-2"><Plus className="h-4 w-4" /> Add Category</button>
      </div>

      {isLoading ? <div className="py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Category', 'Slug', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.categories?.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={c.image || 'https://via.placeholder.com/40'} alt={c.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        {c.description && <p className="text-xs text-gray-500 truncate max-w-xs">{c.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(c._id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="input" placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saveMutation.isPending} className="btn-primary">{saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

