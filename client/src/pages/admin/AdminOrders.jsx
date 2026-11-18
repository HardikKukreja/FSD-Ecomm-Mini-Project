import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, filterStatus],
    queryFn: () => api.get(`/orders?page=${page}&limit=15${filterStatus ? `&status=${filterStatus}` : ''}`).then(r => r.data),
    keepPreviousData: true,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, orderStatus }) => api.put(`/orders/${id}/status`, { orderStatus }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); qc.invalidateQueries({ queryKey: ['dashboard-stats'] }); toast.success('Order status updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="input w-auto text-sm">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {isLoading ? <div className="py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Update Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.orders?.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{order.user?.name}</p>
                        <p className="text-xs text-gray-500">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-1">
                        {order.items?.slice(0, 3).map((item, i) => (
                          <img key={i} src={item.product?.images?.[0] || 'https://via.placeholder.com/32'} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white bg-gray-100" />
                        ))}
                        {order.items?.length > 3 && <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">+{order.items.length - 3}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{order.total?.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge value={order.paymentStatus} /></td>
                    <td className="px-4 py-3"><Badge value={order.orderStatus} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.orderStatus}
                        onChange={e => updateMutation.mutate({ id: order._id, orderStatus: e.target.value })}
                        className="input text-xs py-1 w-32"
                        disabled={updateMutation.isPending}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
            <span>{data?.total || 0} orders</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-secondary text-xs px-3 py-1">Prev</button>
              <span className="px-2 py-1">Page {page} of {data?.totalPages || 1}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= (data?.totalPages || 1)} className="btn-secondary text-xs px-3 py-1">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

