import React, { useState, useEffect } from 'react';
import {
  Users, Wallet, Package, Share2, Calendar, Megaphone,
  TrendingUp, AlertTriangle, CheckCircle, Clock, ArrowRight,
  Activity, BarChart3, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import toast from 'react-hot-toast';

const PAYOUT_COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626'];

const actionColors: Record<string, string> = {
  CREATE: 'badge-success',
  UPDATE: 'badge-info',
  DELETE: 'badge-error',
  PUBLISH: 'badge-primary',
  LOGIN: 'badge-gray',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  link?: string;
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, change, changeType, link }: StatCardProps) {
  const card = (
    <div className="stat-card group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className={`stat-card-icon ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            changeType === 'up' ? 'text-green-700 bg-green-100' :
            changeType === 'down' ? 'text-red-700 bg-red-100' :
            'text-gray-600 bg-gray-100'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-extrabold text-gray-900 font-display">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link} className="block">{card}</Link>;
  }
  return card;
}

interface DashboardStats {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  upcomingPayouts: number;
  pendingTransactions: number;
  totalResources: number;
  lowStockItems: number;
  outOfStockItems: number;
  distributedThisMonth: number;
  upcomingEvents: number;
  publishedAnnouncements: number;
  payoutsByStatus: { status: string; count: number }[];
  resourcesByCategory: { category: string; quantity: number }[];
  monthlyAssistance: { month: string; amount: number; count: number }[];
  recentAuditLogs: {
    id: number; userName: string; action: string; module: string;
    details: string; createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-[#1e3a8a] animate-spin" />
            <p className="text-gray-500 text-sm font-medium">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-gray-500">Failed to load dashboard data.</p>
          <button onClick={fetchStats} className="btn btn-primary">
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  // Map payout status data for pie chart
  const statusColorMap: Record<string, string> = {
    claimed: '#16a34a', pending: '#2563eb', unclaimed: '#d97706', cancelled: '#dc2626',
  };
  const payoutStatusData = (stats.payoutsByStatus || []).map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    color: statusColorMap[s.status] || '#94a3b8',
  }));

  // Map resource category data for bar chart
  const resourceCategoryData = (stats.resourcesByCategory || []).map(r => ({
    name: r.category.charAt(0).toUpperCase() + r.category.slice(1),
    quantity: r.quantity,
  }));

  // Monthly assistance data
  const monthlyAssistanceData = stats.monthlyAssistance || [];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Barangay 442, Sampaloc, Manila — Real-time overview
            </p>
          </div>
          <button onClick={fetchStats} className="btn btn-ghost btn-sm" title="Refresh">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Alert: Low Stock */}
        {stats.lowStockItems > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 mb-6 animate-fade-in">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-sm">Attention: </span>
              <span className="text-sm">
                {stats.lowStockItems} resource item(s) are running low on stock.{' '}
                {stats.outOfStockItems > 0 && `${stats.outOfStockItems} item(s) out of stock.`}
              </span>
            </div>
            <Link to="/admin/resources" className="text-sm font-semibold text-amber-700 hover:underline whitespace-nowrap">
              Manage →
            </Link>
          </div>
        )}

        {/* Stat Cards - Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <StatCard
            title="Active Beneficiaries"
            value={stats.activeBeneficiaries}
            icon={Users}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            link="/admin/beneficiaries"
          />
          <StatCard
            title="Upcoming Payouts"
            value={stats.upcomingPayouts}
            icon={Wallet}
            iconBg="bg-teal-100"
            iconColor="text-teal-600"
            link="/admin/payouts"
          />
          <StatCard
            title="Pending Transactions"
            value={stats.pendingTransactions}
            icon={Clock}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            change={stats.pendingTransactions > 0 ? 'Action needed' : undefined}
            changeType="neutral"
            link="/admin/payouts"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={Calendar}
            iconBg="bg-violet-100"
            iconColor="text-violet-600"
            link="/admin/events"
          />
        </div>

        {/* Stat Cards - Row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Resources"
            value={stats.totalResources}
            icon={Package}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            link="/admin/resources"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            icon={AlertTriangle}
            iconBg="bg-red-100"
            iconColor="text-red-500"
            change={stats.lowStockItems > 0 ? 'Needs restock' : undefined}
            changeType="down"
            link="/admin/resources"
          />
          <StatCard
            title="Distributed This Month"
            value={stats.distributedThisMonth}
            icon={Share2}
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            link="/admin/distribution"
          />
          <StatCard
            title="Published Announcements"
            value={stats.publishedAnnouncements}
            icon={Megaphone}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            link="/admin/announcements"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Monthly Assistance Line Chart */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900 text-base font-display">Monthly Assistance</h2>
                <p className="text-gray-500 text-xs mt-0.5">Payout amount and beneficiary count</p>
              </div>
              <Link to="/admin/reports" className="text-xs text-[#1e3a8a] font-semibold hover:underline flex items-center gap-1">
                Full Report <ArrowRight size={12} />
              </Link>
            </div>
            {monthlyAssistanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyAssistanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(val: any, name: any) => [
                      name === 'amount' ? `₱${val.toLocaleString()}` : val,
                      name === 'amount' ? 'Total Amount' : 'Beneficiaries',
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#1e3a8a" strokeWidth={2.5} dot={{ r: 4, fill: '#1e3a8a' }} name="amount" />
                  <Line yAxisId="right" type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4, fill: '#14b8a6' }} name="count" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                No monthly assistance data yet
              </div>
            )}
          </div>

          {/* Payout Status Pie Chart */}
          <div className="card">
            <div className="mb-5">
              <h2 className="font-bold text-gray-900 text-base font-display">Payout Status</h2>
              <p className="text-gray-500 text-xs mt-0.5">Transaction distribution</p>
            </div>
            {payoutStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={payoutStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {payoutStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-2">
                  {payoutStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
                No payout data yet
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Resource Distribution Bar Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900 text-base font-display">Resource Inventory</h2>
                <p className="text-gray-500 text-xs mt-0.5">Current stock by category</p>
              </div>
              <Link to="/admin/resources" className="text-xs text-[#1e3a8a] font-semibold hover:underline flex items-center gap-1">
                Manage <ArrowRight size={12} />
              </Link>
            </div>
            {resourceCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={resourceCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="quantity" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Quantity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">
                No resource data yet
              </div>
            )}
          </div>

          {/* Recent Audit Logs */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900 text-base font-display">Recent Activity</h2>
                <p className="text-gray-500 text-xs mt-0.5">Latest system actions</p>
              </div>
              <Link to="/admin/audit-logs" className="text-xs text-[#1e3a8a] font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {(stats.recentAuditLogs || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
              ) : (
                (stats.recentAuditLogs || []).slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(log.userName || 'S').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{log.userName || 'System'}</span>
                        <span className={`badge badge-sm ${actionColors[log.action] ?? 'badge-gray'} text-xs`}>
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{log.details}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{(log.module || '').replace('_', ' ')} · {formatTime(log.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
