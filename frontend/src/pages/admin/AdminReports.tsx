import React, { useState, useEffect, useCallback } from 'react';
import { FileBarChart, Download, Calendar, Filter, FileText, Table2, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { reportsApi } from '../../services/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

type ReportType = 'beneficiaries' | 'payouts' | 'resources' | 'distributions' | 'events';

const reportTypes: { key: ReportType; label: string; desc: string; icon: string }[] = [
  { key: 'beneficiaries', label: 'Beneficiary Report', desc: 'Registered beneficiaries by category, status, and date range', icon: '👥' },
  { key: 'payouts', label: 'Payout Report', desc: 'Payout programs, schedules, and transaction summaries', icon: '💰' },
  { key: 'resources', label: 'Resource Inventory Report', desc: 'Current inventory levels, low stock, and expiring items', icon: '📦' },
  { key: 'distributions', label: 'Distribution Report', desc: 'Resource distribution history and recipient records', icon: '🤝' },
  { key: 'events', label: 'Event Report', desc: 'Barangay events listing and participation data', icon: '📅' },
];

const CATEGORY_COLORS = ['#1e3a8a', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#ef4444', '#22c55e'];

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function printReport() {
  window.print();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('beneficiaries');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateReport = useCallback(async () => {
    setLoading(true);
    setGenerated(false);
    try {
      const params: Record<string, string> = { dateFrom, dateTo };
      let res;
      switch (selectedReport) {
        case 'beneficiaries': res = await reportsApi.getBeneficiaries(params); break;
        case 'payouts': res = await reportsApi.getPayouts(params); break;
        case 'resources': res = await reportsApi.getResources(params); break;
        case 'distributions': res = await reportsApi.getDistributions(params); break;
        case 'events': res = await reportsApi.getEvents(params); break;
      }
      setReportData(res?.data?.data ?? []);
      setGenerated(true);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  }, [selectedReport, dateFrom, dateTo]);

  // Auto-generate on type change
  useEffect(() => {
    generateReport();
  }, [selectedReport]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExportCSV = () => {
    if (reportData.length === 0) return toast.error('No data to export');
    const headers = Object.keys(reportData[0]);
    const rows = reportData.map(r => headers.map(h => r[h]));
    downloadCSV(`${selectedReport}_report.csv`, headers, rows);
    toast.success('CSV exported!');
  };

  const handlePrintPDF = () => {
    printReport();
  };

  // ---- Render helpers for each report type ----

  const renderBeneficiaryReport = () => {
    const total = reportData.length;
    const active = reportData.filter(b => b.status === 'active').length;
    const inactive = total - active;
    const byCategory = groupBy(reportData, b => b.category || 'unknown');
    const categoryData = Object.entries(byCategory).map(([name, items], i) => ({
      name, value: items.length, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Registered', value: total, color: 'text-blue-600' },
            { label: 'Active', value: active, color: 'text-green-600' },
            { label: 'Inactive', value: inactive, color: 'text-gray-500' },
            { label: 'Categories', value: categoryData.length, color: 'text-violet-600' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {categoryData.length > 0 && (
          <div className="flex justify-center mb-5">
            <div style={{ width: 280, height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {categoryData.map(c => (
            <div key={c.name} className="flex items-center justify-between text-sm px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                <span className="text-gray-700 capitalize">{c.name}</span>
              </div>
              <span className="font-bold text-gray-900">{c.value}</span>
            </div>
          ))}
        </div>

        {/* Data table */}
        {reportData.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Category</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Registered</th>
                </tr>
              </thead>
              <tbody>
                {reportData.slice(0, 20).map((b: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">{b.first_name} {b.last_name}</td>
                    <td className="py-2 px-3 capitalize">{b.category}</td>
                    <td className="py-2 px-3"><span className={`badge ${b.status === 'active' ? 'badge-success' : 'badge-gray'} capitalize`}>{b.status}</span></td>
                    <td className="py-2 px-3 text-gray-500">{b.date_registered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.length > 20 && <p className="text-xs text-gray-400 mt-2 px-3">Showing 20 of {reportData.length} records. Export to see all.</p>}
          </div>
        )}
      </div>
    );
  };

  const renderPayoutReport = () => {
    const total = reportData.length;
    const claimed = reportData.filter(t => t.status === 'claimed').length;
    const pending = reportData.filter(t => t.status === 'pending').length;
    const totalAmount = reportData.reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);

    // Group by month for chart
    const byMonth = groupBy(reportData.filter(t => t.schedule_date), t => t.schedule_date?.substring(0, 7) ?? '');
    const monthlyData = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, items]) => ({
      month, amount: items.reduce((s: number, t: any) => s + (parseFloat(t.amount) || 0), 0),
    }));

    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Transactions', value: total, color: 'text-blue-600' },
            { label: 'Total Disbursed', value: `₱${totalAmount.toLocaleString()}`, color: 'text-green-600' },
            { label: 'Claimed', value: claimed, color: 'text-teal-600' },
            { label: 'Pending', value: pending, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {monthlyData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`₱${v.toLocaleString()}`, 'Amount']} />
              <Bar dataKey="amount" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {reportData.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Beneficiary</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Program</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.slice(0, 20).map((t: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">{t.first_name} {t.last_name}</td>
                    <td className="py-2 px-3">{t.program_name}</td>
                    <td className="py-2 px-3 font-semibold">₱{parseFloat(t.amount || 0).toLocaleString()}</td>
                    <td className="py-2 px-3"><span className={`badge ${t.status === 'claimed' ? 'badge-success' : 'badge-warning'} capitalize`}>{t.status}</span></td>
                    <td className="py-2 px-3 text-gray-500">{t.schedule_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.length > 20 && <p className="text-xs text-gray-400 mt-2 px-3">Showing 20 of {reportData.length} records. Export to see all.</p>}
          </div>
        )}
      </div>
    );
  };

  const renderResourceReport = () => {
    const total = reportData.length;
    const lowStock = reportData.filter(r => r.status === 'low_stock' || (r.quantity !== undefined && r.quantity < (r.minimum_quantity || 10))).length;
    const byCategory = groupBy(reportData, r => r.category || 'uncategorized');
    const categoryData = Object.entries(byCategory).map(([name, items], i) => ({
      name, value: items.length, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Resources', value: total, color: 'text-blue-600' },
            { label: 'Low Stock Items', value: lowStock, color: 'text-red-600' },
            { label: 'Categories', value: categoryData.length, color: 'text-violet-600' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {reportData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Category</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Qty</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Unit</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">{r.name}</td>
                    <td className="py-2 px-3 capitalize">{r.category}</td>
                    <td className="py-2 px-3 font-semibold">{r.quantity}</td>
                    <td className="py-2 px-3 text-gray-500">{r.unit}</td>
                    <td className="py-2 px-3"><span className={`badge ${r.status === 'available' ? 'badge-success' : r.status === 'low_stock' ? 'badge-warning' : 'badge-error'} capitalize`}>{r.status?.replace('_', ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderDistributionReport = () => {
    const total = reportData.length;
    const totalQty = reportData.reduce((s: number, d: any) => s + (parseInt(d.quantity) || 0), 0);

    return (
      <div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Total Distributions', value: total, color: 'text-blue-600' },
            { label: 'Total Items Distributed', value: totalQty, color: 'text-teal-600' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {reportData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Resource</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Recipient</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Qty</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.slice(0, 20).map((d: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">{d.resource_name}</td>
                    <td className="py-2 px-3">{d.first_name} {d.last_name}</td>
                    <td className="py-2 px-3 font-semibold">{d.quantity} {d.unit}</td>
                    <td className="py-2 px-3 text-gray-500">{d.distribution_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.length > 20 && <p className="text-xs text-gray-400 mt-2 px-3">Showing 20 of {reportData.length} records. Export to see all.</p>}
          </div>
        )}
      </div>
    );
  };

  const renderEventReport = () => {
    const total = reportData.length;
    const published = reportData.filter(e => e.status === 'published').length;
    const byCategory = groupBy(reportData, e => e.category || 'other');
    const categoryData = Object.entries(byCategory).map(([name, items], i) => ({
      name, value: items.length, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Events', value: total, color: 'text-blue-600' },
            { label: 'Published', value: published, color: 'text-green-600' },
            { label: 'Categories', value: categoryData.length, color: 'text-violet-600' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {reportData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Title</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Category</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Location</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.slice(0, 20).map((e: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">{e.title}</td>
                    <td className="py-2 px-3 capitalize">{e.category}</td>
                    <td className="py-2 px-3">{e.event_date}</td>
                    <td className="py-2 px-3 text-gray-500">{e.location}</td>
                    <td className="py-2 px-3"><span className={`badge ${e.status === 'published' ? 'badge-success' : 'badge-gray'} capitalize`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.length > 20 && <p className="text-xs text-gray-400 mt-2 px-3">Showing 20 of {reportData.length} records. Export to see all.</p>}
          </div>
        )}
      </div>
    );
  };

  const reportRenderers: Record<ReportType, () => React.ReactNode> = {
    beneficiaries: renderBeneficiaryReport,
    payouts: renderPayoutReport,
    resources: renderResourceReport,
    distributions: renderDistributionReport,
    events: renderEventReport,
  };

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
                  <button className="btn btn-primary" onClick={generateReport} disabled={loading}>
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Filter size={15} />} Generate
                  </button>
                  <button id="export-pdf-btn" className="btn btn-outline" onClick={handlePrintPDF} disabled={reportData.length === 0}>
                    <FileText size={15} /> Print
                  </button>
                  <button id="export-excel-btn" className="btn btn-outline" onClick={handleExportCSV} disabled={reportData.length === 0}>
                    <Table2 size={15} /> CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="card" id="report-printable">
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

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
              ) : !generated ? (
                <div className="text-center py-16 text-gray-400">
                  <FileBarChart size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">Click "Generate" to create report</p>
                </div>
              ) : reportData.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FileBarChart size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No data found</p>
                  <p className="text-sm mt-1">Try adjusting the date range or filters.</p>
                </div>
              ) : (
                reportRenderers[selectedReport]()
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
