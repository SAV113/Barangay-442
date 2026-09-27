import React, { useState } from 'react';
import { FileBarChart, Download, Calendar, Filter, FileText, Table2 } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

type ReportType = 'beneficiaries' | 'payouts' | 'resources' | 'distributions' | 'events' | 'announcements' | 'audit';

const reportTypes: { key: ReportType; label: string; desc: string; icon: string }[] = [
  { key: 'beneficiaries', label: 'Beneficiary Report', desc: 'Registered beneficiaries by category, status, and date range', icon: '👥' },
  { key: 'payouts', label: 'Payout Report', desc: 'Payout programs, schedules, and transaction summaries', icon: '💰' },
  { key: 'resources', label: 'Resource Inventory Report', desc: 'Current inventory levels, low stock, and expiring items', icon: '📦' },
  { key: 'distributions', label: 'Distribution Report', desc: 'Resource distribution history and recipient records', icon: '🤝' },
  { key: 'events', label: 'Event Report', desc: 'Barangay events listing and participation data', icon: '📅' },
  { key: 'announcements', label: 'Announcement Report', desc: 'Published announcements, categories, and timeline', icon: '📢' },
  { key: 'audit', label: 'Audit Report', desc: 'Complete system action trail for accountability', icon: '🔒' },
];

const beneficiaryCategoryData = [
  { name: 'Senior Citizen', value: 4, color: '#f59e0b' },
  { name: '4Ps', value: 1, color: '#1e3a8a' },
  { name: 'Solo Parent', value: 2, color: '#14b8a6' },
  { name: 'Indigent', value: 2, color: '#64748b' },
  { name: 'PWD', value: 1, color: '#8b5cf6' },
];

const monthlyPayoutData = [
  { month: 'Mar', amount: 25000 }, { month: 'Apr', amount: 32000 }, { month: 'May', amount: 28500 },
  { month: 'Jun', amount: 35000 }, { month: 'Jul', amount: 31000 }, { month: 'Aug', amount: 18500 },
];

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('beneficiaries');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-08-31');

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 font-display">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Generate and export comprehensive barangay reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Report Type Selector */}
          <div className="lg:col-span-1">
            <div className="card p-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Report Type</p>
              <nav className="flex flex-col gap-0.5">
                {reportTypes.map(rt => (
                  <button
                    key={rt.key}
                    id={`report-type-${rt.key}`}
                    onClick={() => setSelectedReport(rt.key)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all w-full ${
                      selectedReport === rt.key
                        ? 'bg-blue-50 text-[#1e3a8a] font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{rt.icon}</span>
                    <span className="truncate">{rt.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="card mb-5">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="form-group flex-1">
                  <label className="form-label">Date From</label>
                  <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Date To</label>
                  <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary">
                    <Filter size={15} /> Generate
                  </button>
                  <button id="export-pdf-btn" className="btn btn-outline">
                    <FileText size={15} /> PDF
                  </button>
                  <button id="export-excel-btn" className="btn btn-outline">
                    <Table2 size={15} /> Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Report Header */}
            <div className="card mb-5">
              <div className="text-center mb-6 border-b border-gray-100 pb-5">
                <p className="text-2xl font-extrabold text-gray-900 font-display">
                  {reportTypes.find(r => r.key === selectedReport)?.label}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Barangay 442, Zone 44, Sampaloc, Manila · Generated on {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Period: {dateFrom} to {dateTo}
                </p>
              </div>

              {/* Beneficiary Report Preview */}
              {selectedReport === 'beneficiaries' && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total Registered', value: 10, color: 'text-blue-600' },
                      { label: 'Active', value: 9, color: 'text-green-600' },
                      { label: 'Inactive', value: 1, color: 'text-gray-500' },
                      { label: 'Categories', value: 5, color: 'text-violet-600' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mb-5">
                    <div style={{ width: 280, height: 200 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={beneficiaryCategoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                            {beneficiaryCategoryData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {beneficiaryCategoryData.map(c => (
                      <div key={c.name} className="flex items-center justify-between text-sm px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                          <span className="text-gray-700">{c.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{c.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payout Report Preview */}
              {selectedReport === 'payouts' && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total Programs', value: 5, color: 'text-blue-600' },
                      { label: 'Total Disbursed', value: '₱170.5K', color: 'text-green-600' },
                      { label: 'Total Transactions', value: 11, color: 'text-teal-600' },
                      { label: 'Claimed Rate', value: '73%', color: 'text-amber-600' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                        <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyPayoutData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`₱${v.toLocaleString()}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Other reports - simplified placeholder */}
              {!['beneficiaries', 'payouts'].includes(selectedReport) && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">{reportTypes.find(r => r.key === selectedReport)?.icon}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {reportTypes.find(r => r.key === selectedReport)?.label}
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    {reportTypes.find(r => r.key === selectedReport)?.desc}
                  </p>
                  <div className="mt-6 flex gap-3 justify-center">
                    <button className="btn btn-primary"><Download size={15} /> Export PDF</button>
                    <button className="btn btn-outline"><Download size={15} /> Export Excel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
