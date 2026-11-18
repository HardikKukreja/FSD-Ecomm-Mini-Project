import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const emptyForm = { code: '', type: 'percentage', value: '', minCartValue: '', expiryDate: '', usageLimit: '', isActive: true };

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({ queryKey: ['admin-coupons'], queryFn: () => api.get('/coupons').then(r => r.data) });

  const saveMutation = useMutation({
    mutationFn: (payload) => editing ? api.put(`/coupons/${editing._id}`, payload) : api.post('/coupons', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success(editing ? 'Updated!' : 'Created!'); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/coupons/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ code: c.code, type: c.type, value: c.value, minCartValue: c.minCartValue, expiryDate: c.expiryDate?.slice(0, 10), usageLimit: c.usageLimit, isActive: c.isActive });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({ ...form, value: Number(form.value), minCartValue: Number(form.minCartValue || 0), usageLimit: Number(form.usageLimit) });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button onClick={openCreate} className="btn-primary gap-2"><Plus className="h-4 w-4" /> Add Coupon</button>
      </div>

      {isLoading ? <div className="py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Code', 'Type', 'Value', 'Min Cart', 'Expiry', 'Used/Limit', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.coupons?.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary-500" />
                      <span className="font-mono font-semibold text-primary-700">{c.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{c.type}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="px-4 py-3 text-gray-600">{c.minCartValue > 0 ? `₹${c.minCartValue}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{new Date(c.expiryDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-600">{c.usedCount}/{c.usageLimit}</td>
                  <td className="px-4 py-3"><Badge value={c.isActive ? 'active' : 'inactive'} label={c.isActive ? 'Active' : 'Inactive'} /></td>
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Coupon' : 'Add Coupon'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="input font-mono uppercase" required placeholder="SAVE20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
              <input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="input" required min="0" placeholder={form.type === 'percentage' ? '10' : '200'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Cart Value (₹)</label>
              <input type="number" value={form.minCartValue} onChange={e => setForm({...form, minCartValue: e.target.value})} className="input" min="0" placeholder="500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit *</label>
              <input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} className="input" required min="1" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
              <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="input" required />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded text-primary-600" />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
            </div>
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

