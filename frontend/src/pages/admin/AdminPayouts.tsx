import React, { useState } from 'react';
import { Plus, Search, Wallet, Calendar, Clock, MapPin, ChevronRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { format, parseISO } from 'date-fns';

// Demo data
const programs = [
  { id: 1, name: 'Ayuda sa Matatanda', category: 'financial', budget: 50000, amountPerBeneficiary: 500, status: 'active', schedulesCount: 2 },
  { id: 2, name: '4Ps Barangay Supplement', category: 'financial', budget: 20000, amountPerBeneficiary: 1000, status: 'active', schedulesCount: 1 },
  { id: 3, name: 'Tulong sa Nangangailangan', category: 'financial', budget: 30000, amountPerBeneficiary: 750, status: 'active', schedulesCount: 1 },
  { id: 4, name: 'Pamigay ng Bigas at Pagkain', category: 'food', budget: 80000, amountPerBeneficiary: null, status: 'active', schedulesCount: 0 },
  { id: 5, name: 'Solo Parent Assistance', category: 'financial', budget: 25000, amountPerBeneficiary: 800, status: 'active', schedulesCount: 1 },
];

const schedules = [
  { id: 1, programId: 1, programName: 'Ayuda sa Matatanda', name: 'August 2026 Senior Citizen Payout', scheduleDate: '2026-08-20', startTime: '08:00:00', endTime: '16:00:00', location: 'Barangay 442 Hall, Zone 44, Sampaloc, Manila', status: 'scheduled', totalBeneficiaries: 4, claimed: 0, pending: 4 },
  { id: 2, programId: 2, programName: '4Ps Barangay Supplement', name: '4Ps August 2026 Supplement', scheduleDate: '2026-08-22', startTime: '09:00:00', endTime: '15:00:00', location: 'Barangay 442 Hall, Zone 44, Sampaloc, Manila', status: 'scheduled', totalBeneficiaries: 1, claimed: 0, pending: 1 },
  { id: 3, programId: 3, programName: 'Tulong sa Nangangailangan', name: 'August Indigent Assistance', scheduleDate: '2026-08-25', startTime: '08:00:00', endTime: '12:00:00', location: 'Barangay 442 Hall, Zone 44, Sampaloc, Manila', status: 'scheduled', totalBeneficiaries: 2, claimed: 0, pending: 2 },
  { id: 4, programId: 5, programName: 'Solo Parent Assistance', name: 'August Solo Parent Assistance', scheduleDate: '2026-08-27', startTime: '09:00:00', endTime: '14:00:00', location: 'Barangay 442 Hall, Zone 44, Sampaloc, Manila', status: 'scheduled', totalBeneficiaries: 0, claimed: 0, pending: 0 },
  { id: 5, programId: 1, programName: 'Ayuda sa Matatanda', name: 'July 2026 Senior Citizen Payout', scheduleDate: '2026-07-20', startTime: '08:00:00', endTime: '16:00:00', location: 'Barangay 442 Hall, Zone 44, Sampaloc, Manila', status: 'completed', totalBeneficiaries: 4, claimed: 3, pending: 0 },
];

const transactions = [
  { id: 1, beneficiaryCode: 'BRY442-SC-001', beneficiaryName: 'Pedro Lim', amount: 500, status: 'claimed', claimedAt: '2026-07-20T09:30:00Z', scheduleName: 'July 2026 Senior Citizen Payout' },
  { id: 2, beneficiaryCode: 'BRY442-SC-002', beneficiaryName: 'Lucia Fernandez', amount: 500, status: 'claimed', claimedAt: '2026-07-20T10:15:00Z', scheduleName: 'July 2026 Senior Citizen Payout' },
  { id: 3, beneficiaryCode: 'BRY442-SC-003', beneficiaryName: 'Antonio Bautista', amount: 500, status: 'unclaimed', claimedAt: null, scheduleName: 'July 2026 Senior Citizen Payout' },
  { id: 4, beneficiaryCode: 'BRY442-SC-004', beneficiaryName: 'Corazon Ramos', amount: 500, status: 'claimed', claimedAt: '2026-07-20T11:00:00Z', scheduleName: 'July 2026 Senior Citizen Payout' },
  { id: 5, beneficiaryCode: 'BRY442-SC-001', beneficiaryName: 'Pedro Lim', amount: 500, status: 'pending', scheduleName: 'August 2026 Senior Citizen Payout' },
  { id: 6, beneficiaryCode: 'BRY442-SC-002', beneficiaryName: 'Lucia Fernandez', amount: 500, status: 'pending', scheduleName: 'August 2026 Senior Citizen Payout' },
  { id: 7, beneficiaryCode: 'BRY442-4PS-001', beneficiaryName: 'Juan Dela Cruz', amount: 1000, status: 'pending', scheduleName: '4Ps August 2026 Supplement' },
];

const statusBadge: Record<string, string> = {
  active: 'badge-success', completed: 'badge-info', cancelled: 'badge-error', draft: 'badge-gray',
  scheduled: 'badge-info', ongoing: 'badge-warning',
  pending: 'badge-warning', claimed: 'badge-success', unclaimed: 'badge-gray',
};

const statusIcon: Record<string, React.ElementType> = {
  claimed: CheckCircle, pending: AlertCircle, unclaimed: XCircle, cancelled: XCircle,
};

type Tab = 'programs' | 'schedules' | 'transactions';

function fmtTime(t: string) {
  try { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m); return format(d, 'h:mm a'); } catch { return t; }
}

export default function AdminPayouts() {
  const [activeTab, setActiveTab] = useState<Tab>('schedules');
  const [search, setSearch] = useState('');

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Payout Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage payout programs, schedules, and transactions</p>
          </div>
          <button id="add-payout-btn" className="btn btn-primary">
            <Plus size={17} /> {activeTab === 'programs' ? 'New Program' : activeTab === 'schedules' ? 'New Schedule' : 'Record Payout'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {[
            { key: 'programs' as Tab, label: 'Programs', count: programs.length },
            { key: 'schedules' as Tab, label: 'Schedules', count: schedules.length },
            { key: 'transactions' as Tab, label: 'Transactions', count: transactions.length },
          ].map(tab => (
            <button
              key={tab.key}
              id={`payout-tab-${tab.key}`}
              onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[#1e3a8a] shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} <span className="ml-1 text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="card mb-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="payout-search"
              type="search"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
        </div>

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map(p => (
              <div key={p.id} id={`program-card-${p.id}`} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Wallet size={18} className="text-blue-600" />
                  </div>
                  <span className={`badge ${statusBadge[p.status]} capitalize`}>{p.status}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{p.name}</h3>
                <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span className="font-semibold text-gray-800">₱{p.budget.toLocaleString()}</span>
                  </div>
                  {p.amountPerBeneficiary && (
                    <div className="flex justify-between">
                      <span>Per Beneficiary:</span>
                      <span className="font-semibold text-gray-800">₱{p.amountPerBeneficiary.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Schedules:</span>
                    <span className="font-semibold text-gray-800">{p.schedulesCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#1e3a8a] font-semibold mt-3 pt-3 border-t border-gray-100 cursor-pointer hover:opacity-80">
                  View Details <ChevronRight size={13} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="flex flex-col gap-4">
            {schedules.map(s => (
              <div key={s.id} id={`schedule-card-${s.id}`} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] rounded-xl flex flex-col items-center justify-center text-white">
                      <span className="text-xs font-semibold opacity-80">{format(parseISO(s.scheduleDate), 'MMM')}</span>
                      <span className="text-xl font-extrabold leading-tight">{format(parseISO(s.scheduleDate), 'd')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900">{s.name}</h3>
                        <span className={`badge ${statusBadge[s.status]} capitalize`}>{s.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">Program: {s.programName}</p>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={12} className="text-teal-500" />{fmtTime(s.startTime)} – {fmtTime(s.endTime)}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-teal-500" />{s.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
                    {[
                      { label: 'Total', value: s.totalBeneficiaries, color: 'text-gray-800' },
                      { label: 'Claimed', value: s.claimed, color: 'text-green-600' },
                      { label: 'Pending', value: s.pending, color: 'text-amber-600' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center">
                        <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </div>
                    ))}
                    <button className="btn btn-outline btn-sm">
                      Manage <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="card p-0 overflow-hidden">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Beneficiary</th>
                    <th>Schedule</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Claimed At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => {
                    const StatusIcon = statusIcon[t.status] ?? AlertCircle;
                    return (
                      <tr key={t.id}>
                        <td>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{t.beneficiaryName}</p>
                            <p className="text-xs text-gray-400 font-mono">{t.beneficiaryCode}</p>
                          </div>
                        </td>
                        <td><p className="text-sm text-gray-600 max-w-[200px] truncate">{t.scheduleName}</p></td>
                        <td><span className="font-bold text-gray-900">₱{t.amount.toLocaleString()}</span></td>
                        <td>
                          <span className={`badge ${statusBadge[t.status]} capitalize flex items-center gap-1`}>
                            <StatusIcon size={11} />
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-gray-600">
                            {t.claimedAt ? format(parseISO(t.claimedAt), 'MMM d, yyyy h:mm a') : '—'}
                          </span>
                        </td>
                        <td>
                          {t.status === 'pending' && (
                            <button className="btn btn-secondary btn-sm">
                              <CheckCircle size={13} /> Mark Claimed
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
