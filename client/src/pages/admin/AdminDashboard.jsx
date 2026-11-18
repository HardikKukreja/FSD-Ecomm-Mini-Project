import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then((r) => r.data),
    refetchInterval: 60000,
  });

  if (isLoading) return <div className="py-32"><Spinner size="lg" /></div>;

  const stats = data?.stats;
  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-100 text-green-700' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-blue-100 text-blue-700' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-purple-100 text-purple-700' },
    { label: 'Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/products" className="btn-primary text-sm">Manage Products</Link>
          <Link to="/admin/orders" className="btn-secondary text-sm">Manage Orders</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Revenue (Last 30 Days)</h2>
          </div>
          {stats?.revenueByDay?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} labelFormatter={(l) => `Date: ${l}`} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Order Status */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Orders by Status</h2>
          <div className="space-y-3">
            {stats?.ordersByStatus?.map((s) => (
              <div key={s._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge value={s._id} />
                </div>
                <span className="font-semibold text-gray-900">{s.count}</span>
              </div>
            ))}
            {(!stats?.ordersByStatus || stats.ordersByStatus.length === 0) && (
              <p className="text-gray-400 text-sm">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Top Products by Revenue</h2>
          <div className="space-y-3">
            {stats?.topProducts?.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <img src={p.product?.images?.[0] || 'https://via.placeholder.com/32'} alt={p.product?.title} className="w-9 h-9 rounded-lg object-cover bg-gray-50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.product?.title}</p>
                  <p className="text-xs text-gray-500">{p.totalSold} sold</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">₹{p.totalRevenue?.toLocaleString()}</span>
              </div>
            ))}
            {(!stats?.topProducts || stats.topProducts.length === 0) && (
              <p className="text-gray-400 text-sm">No data yet</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders?.map((o) => (
              <div key={o._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{o.user?.name}</p>
                  <p className="text-xs text-gray-500 font-mono">#{o._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{o.total?.toLocaleString()}</p>
                  <Badge value={o.orderStatus} />
                </div>
              </div>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <p className="text-gray-400 text-sm">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

