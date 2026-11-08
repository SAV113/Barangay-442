import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Wallet, Calendar, Clock, MapPin, ChevronRight, CheckCircle, AlertCircle, XCircle, X, Filter, Archive, RotateCcw, ArrowUpDown } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { payoutProgramsApi, payoutSchedulesApi, payoutTransactionsApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);

  // Data
  const [programs, setPrograms] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Item 2 & 3: Filter states
  const [txStatusFilter, setTxStatusFilter] = useState('');
  const [txScheduleFilter, setTxScheduleFilter] = useState('');
  const [txDateFrom, setTxDateFrom] = useState('');
  const [txDateTo, setTxDateTo] = useState('');
  const [progStatusFilter, setProgStatusFilter] = useState('');
  const [progCategoryFilter, setProgCategoryFilter] = useState('');
  const [progSort, setProgSort] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'program' | 'schedule' | 'transaction'>('program');
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Pagination
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [txTotalPages, setTxTotalPages] = useState(1);

  const fetchPrograms = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { limit: 100 };
      if (progStatusFilter) params.status = progStatusFilter;
      if (progCategoryFilter) params.category = progCategoryFilter;
      if (progSort) params.sort = progSort;
      if (showArchived) params.includeArchived = 'true';
      if (search && activeTab === 'programs') params.search = search;
      const res = await payoutProgramsApi.getAll(params);
      setPrograms(res.data.data || res.data || []);
    } catch (err: any) { toast.error('Failed to load programs'); }
  }, [progStatusFilter, progCategoryFilter, progSort, showArchived, search, activeTab]);

  const fetchSchedules = async () => {
    try { const res = await payoutSchedulesApi.getAll({ limit: 100 }); setSchedules(res.data.data || res.data || []); }
    catch (err: any) { toast.error('Failed to load schedules'); }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { limit: 20, page: txPage };
      if (txStatusFilter) params.status = txStatusFilter;
      if (txScheduleFilter) params.scheduleId = txScheduleFilter;
      if (txDateFrom) params.dateFrom = txDateFrom;
      if (txDateTo) params.dateTo = txDateTo;
      if (search && activeTab === 'transactions') params.search = search;
      const res = await payoutTransactionsApi.getAll(params);
      setTransactions(res.data.data || res.data || []);
      setTxTotal(res.data.meta?.total || 0);
      setTxTotalPages(res.data.meta?.totalPages || 1);
    } catch (err: any) { toast.error('Failed to load transactions'); }
  }, [txStatusFilter, txScheduleFilter, txDateFrom, txDateTo, search, activeTab, txPage]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPrograms(), fetchSchedules(), fetchTransactions()]);
    setLoading(false);
  }, [fetchPrograms, fetchTransactions]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const clearFilters = () => {
    setSearch(''); setTxStatusFilter(''); setTxScheduleFilter('');
    setTxDateFrom(''); setTxDateTo(''); setProgStatusFilter('');
    setProgCategoryFilter(''); setProgSort(''); setShowArchived(false);
    setTxPage(1);
  };

  const openAddModal = () => {
    if (activeTab === 'programs') {
      setModalType('program');
      setFormData({ name: '', description: '', category: 'financial', budget: '', amountPerBeneficiary: '', status: 'active' });
    } else if (activeTab === 'schedules') {
      setModalType('schedule');
      setFormData({ programId: '', name: '', scheduleDate: '', startTime: '', endTime: '', location: '', notes: '', status: 'scheduled' });
    }
    setShowModal(true);
  };

  const handleSaveProgram = async () => {
    if (!formData.name) { toast.error('Name is required'); return; }
    try {
      setSaving(true);
      await payoutProgramsApi.create({ ...formData, budget: Number(formData.budget) || 0, amountPerBeneficiary: Number(formData.amountPerBeneficiary) || null });
      toast.success('Program created'); setShowModal(false); fetchPrograms();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create program'); }
    finally { setSaving(false); }
  };

  const handleSaveSchedule = async () => {
    if (!formData.name || !formData.scheduleDate || !formData.programId) { toast.error('Fill required fields'); return; }
    try {
      setSaving(true);
      await payoutSchedulesApi.create({ ...formData, programId: Number(formData.programId) });
      toast.success('Schedule created'); setShowModal(false); fetchSchedules();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create schedule'); }
    finally { setSaving(false); }
  };

  const markClaimed = async (id: number) => {
    try {
      await payoutTransactionsApi.updateStatus(id, 'claimed');
      toast.success('Marked as claimed'); fetchTransactions();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  // Item 4: Archive / Restore programs
  const archiveProgram = async (id: number, name: string) => {
    if (!confirm(`Archive "${name}"? It will be moved to the archived section.`)) return;
    try { await payoutProgramsApi.archive(id); toast.success('Program archived'); fetchPrograms(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to archive'); }
  };

  const restoreProgram = async (id: number, name: string) => {
    if (!confirm(`Restore "${name}" from archive?`)) return;
    try { await payoutProgramsApi.restore(id); toast.success('Program restored'); fetchPrograms(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to restore'); }
  };

  const deleteProgram = async (id: number) => {
    if (!confirm('Permanently delete this program?')) return;
    try { await payoutProgramsApi.delete(id); toast.success('Deleted'); fetchPrograms(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const hasActiveFilters = txStatusFilter || txScheduleFilter || txDateFrom || txDateTo || progStatusFilter || progCategoryFilter || progSort || showArchived;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Payout Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage payout programs, schedules, and transactions</p>
          </div>
          {activeTab !== 'transactions' && (
            <button id="add-payout-btn" onClick={openAddModal} className="btn btn-primary">
              <Plus size={17} /> {activeTab === 'programs' ? 'New Program' : 'New Schedule'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {([
            { key: 'programs' as Tab, label: 'Programs', count: programs.length },
            { key: 'schedules' as Tab, label: 'Schedules', count: schedules.length },
            { key: 'transactions' as Tab, label: 'Transactions', count: txTotal || transactions.length },
          ]).map(tab => (
            <button key={tab.key} id={`payout-tab-${tab.key}`}
              onClick={() => { setActiveTab(tab.key); setSearch(''); clearFilters(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-white text-[#1e3a8a] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label} <span className="ml-1 text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="payout-search" type="search" placeholder={`Search ${activeTab}...`} value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
              </div>

              {/* Item 2: Transaction filters */}
              {activeTab === 'transactions' && (
                <>
                  <select value={txStatusFilter} onChange={e => { setTxStatusFilter(e.target.value); setTxPage(1); }} className="form-input w-full sm:w-36">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option><option value="claimed">Claimed</option>
                    <option value="unclaimed">Unclaimed</option><option value="cancelled">Cancelled</option>
                  </select>
                  <select value={txScheduleFilter} onChange={e => { setTxScheduleFilter(e.target.value); setTxPage(1); }} className="form-input w-full sm:w-44">
                    <option value="">All Schedules</option>
                    {schedules.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </>
              )}

              {/* Item 3: Program filters */}
              {activeTab === 'programs' && (
                <>
                  <select value={progStatusFilter} onChange={e => setProgStatusFilter(e.target.value)} className="form-input w-full sm:w-36">
                    <option value="">All Status</option>
                    <option value="active">Active</option><option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option><option value="draft">Draft</option>
                  </select>
                  <select value={progCategoryFilter} onChange={e => setProgCategoryFilter(e.target.value)} className="form-input w-full sm:w-36">
                    <option value="">All Categories</option>
                    <option value="financial">Financial</option><option value="food">Food</option>
                    <option value="medical">Medical</option><option value="educational">Educational</option>
                    <option value="livelihood">Livelihood</option><option value="other">Other</option>
                  </select>
                  <select value={progSort} onChange={e => setProgSort(e.target.value)} className="form-input w-full sm:w-36">
                    <option value="">Default Sort</option>
                    <option value="newest">Newest First</option><option value="oldest">Oldest First</option>
                    <option value="name">By Name</option>
                  </select>
                </>
              )}
            </div>

            {/* Date range filters for transactions */}
            {activeTab === 'transactions' && (
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="form-group mb-0 flex-1">
                  <label className="form-label text-xs">From Date</label>
                  <input type="date" className="form-input" value={txDateFrom} onChange={e => { setTxDateFrom(e.target.value); setTxPage(1); }} />
                </div>
                <div className="form-group mb-0 flex-1">
                  <label className="form-label text-xs">To Date</label>
                  <input type="date" className="form-input" value={txDateTo} onChange={e => { setTxDateTo(e.target.value); setTxPage(1); }} />
                </div>
              </div>
            )}

            {/* Item 4: Archive toggle + Clear Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeTab === 'programs' && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} className="rounded border-gray-300" />
                    <Archive size={14} /> Show Archived
                  </label>
                )}
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-ghost btn-sm text-gray-500">
                  <XCircle size={14} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-[#1e3a8a] animate-spin" /></div>
        ) : (
          <>
            {/* Programs Tab */}
            {activeTab === 'programs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map((p: any) => (
                  <div key={p.id} id={`program-card-${p.id}`} className={`card ${p.deletedAt ? 'opacity-70 border-dashed' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0"><Wallet size={18} className="text-blue-600" /></div>
                      <div className="flex items-center gap-1">
                        <span className={`badge ${statusBadge[p.status]} capitalize`}>{p.status}</span>
                        {p.deletedAt && <span className="badge badge-warning text-xs">Archived</span>}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-2">{p.name}</h3>
                    <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                      <div className="flex justify-between"><span>Budget:</span><span className="font-semibold text-gray-800">₱{(p.budget || 0).toLocaleString()}</span></div>
                      {p.amountPerBeneficiary && <div className="flex justify-between"><span>Per Beneficiary:</span><span className="font-semibold text-gray-800">₱{p.amountPerBeneficiary.toLocaleString()}</span></div>}
                      <div className="flex justify-between"><span>Category:</span><span className="font-semibold text-gray-800 capitalize">{p.category}</span></div>
                      <div className="flex justify-between"><span>Schedules:</span><span className="font-semibold text-gray-800">{p.schedulesCount || 0}</span></div>
                    </div>
                    <div className="flex items-center justify-between gap-1 text-xs mt-3 pt-3 border-t border-gray-100">
                      {p.deletedAt ? (
                        <button onClick={() => restoreProgram(p.id, p.name)} className="text-green-600 font-semibold hover:opacity-80 flex items-center gap-1">
                          <RotateCcw size={13} /> Restore
                        </button>
                      ) : (
                        <>
                          <span className="text-[#1e3a8a] font-semibold cursor-pointer hover:opacity-80 flex items-center gap-1">View Details <ChevronRight size={13} /></span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => archiveProgram(p.id, p.name)} className="text-amber-500 hover:text-amber-700 text-xs font-medium flex items-center gap-1" title="Archive">
                              <Archive size={12} /> Archive
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {programs.length === 0 && <div className="col-span-3 card"><div className="empty-state"><div className="empty-state-icon"><Wallet size={28} /></div><p className="font-semibold text-gray-500">{showArchived ? 'No archived programs' : 'No programs yet'}</p></div></div>}
              </div>
            )}

            {/* Schedules Tab */}
            {activeTab === 'schedules' && (
              <div className="flex flex-col gap-4">
                {schedules.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase())).map((s: any) => (
                  <div key={s.id} id={`schedule-card-${s.id}`} className="card">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] rounded-xl flex flex-col items-center justify-center text-white">
                          <span className="text-xs font-semibold opacity-80">{s.scheduleDate ? format(parseISO(s.scheduleDate), 'MMM') : ''}</span>
                          <span className="text-xl font-extrabold leading-tight">{s.scheduleDate ? format(parseISO(s.scheduleDate), 'd') : ''}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-900">{s.name}</h3>
                            <span className={`badge ${statusBadge[s.status]} capitalize`}>{s.status}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">Program: {s.programName || s.program?.name || `#${s.programId}`}</p>
                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                            {s.startTime && <span className="flex items-center gap-1"><Clock size={12} className="text-teal-500" />{fmtTime(s.startTime)}{s.endTime ? ` – ${fmtTime(s.endTime)}` : ''}</span>}
                            {s.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-teal-500" />{s.location}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
                        {[
                          { label: 'Total', value: s.transactionsCount || 0, color: 'text-gray-800' },
                          { label: 'Claimed', value: s.claimedCount || 0, color: 'text-green-600' },
                          { label: 'Pending', value: s.pendingCount || 0, color: 'text-amber-600' },
                        ].map(stat => (
                          <div key={stat.label} className="text-center">
                            <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {schedules.length === 0 && <div className="card"><div className="empty-state"><div className="empty-state-icon"><Calendar size={28} /></div><p className="font-semibold text-gray-500">No schedules yet</p></div></div>}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <>
                <div className="card p-0 overflow-hidden">
                  <div className="table-container">
                    <table className="data-table">
                      <thead><tr><th>ID</th><th>Beneficiary</th><th>Schedule</th><th>Amount</th><th>Status</th><th>Claimed At</th><th>Actions</th></tr></thead>
                      <tbody>
                        {transactions.length === 0 ? (
                          <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon"><Wallet size={28} /></div><p className="font-semibold text-gray-500">No transactions found</p></div></td></tr>
                        ) : transactions.map((t: any) => {
                          const StatusIcon = statusIcon[t.status] ?? AlertCircle;
                          return (
                            <tr key={t.id}>
                              <td><span className="font-mono text-xs text-gray-500">#{t.id}</span></td>
                              <td>
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">{t.beneficiary?.resident?.firstName ? `${t.beneficiary.resident.firstName} ${t.beneficiary.resident.lastName}` : `#${t.beneficiaryId}`}</p>
                                  <p className="text-xs text-gray-400 font-mono">{t.beneficiary?.beneficiaryCode || ''}</p>
                                </div>
                              </td>
                              <td><p className="text-sm text-gray-600 max-w-[200px] truncate">{t.schedule?.name || `Schedule #${t.scheduleId}`}</p></td>
                              <td><span className="font-bold text-gray-900">₱{(t.amount || 0).toLocaleString()}</span></td>
                              <td>
                                <span className={`badge ${statusBadge[t.status]} capitalize flex items-center gap-1`}>
                                  <StatusIcon size={11} />{t.status}
                                </span>
                              </td>
                              <td><span className="text-sm text-gray-600">{t.claimedAt ? format(parseISO(t.claimedAt), 'MMM d, yyyy h:mm a') : '—'}</span></td>
                              <td>
                                {t.status === 'pending' && (
                                  <button onClick={() => markClaimed(t.id)} className="btn btn-secondary btn-sm">
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

                {/* Pagination */}
                {txTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">Showing {transactions.length} of {txTotal} transactions</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage <= 1} className="btn btn-ghost btn-sm disabled:opacity-50">Previous</button>
                      <span className="text-sm text-gray-600">Page {txPage} of {txTotalPages}</span>
                      <button onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))} disabled={txPage >= txTotalPages} className="btn btn-ghost btn-sm disabled:opacity-50">Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Add Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-bold text-gray-900 font-display">
                  {modalType === 'program' ? 'New Payout Program' : 'New Payout Schedule'}
                </h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                {modalType === 'program' ? (
                  <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                    <div className="form-group"><label className="form-label form-label-required">Program Name</label>
                      <input type="text" className="form-input" placeholder="e.g., Ayuda sa Matatanda" value={formData.name} onChange={e => setFormData((p: any) => ({ ...p, name: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Description</label>
                      <textarea className="form-input" rows={2} value={formData.description} onChange={e => setFormData((p: any) => ({ ...p, description: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-group"><label className="form-label">Category</label>
                        <select className="form-input" value={formData.category} onChange={e => setFormData((p: any) => ({ ...p, category: e.target.value }))}>
                          <option value="financial">Financial</option><option value="food">Food</option><option value="medical">Medical</option>
                          <option value="educational">Educational</option><option value="livelihood">Livelihood</option><option value="other">Other</option>
                        </select></div>
                      <div className="form-group"><label className="form-label">Budget</label>
                        <input type="number" className="form-input" placeholder="₱" value={formData.budget} onChange={e => setFormData((p: any) => ({ ...p, budget: e.target.value }))} /></div>
                    </div>
                    <div className="form-group"><label className="form-label">Amount Per Beneficiary</label>
                      <input type="number" className="form-input" placeholder="₱" value={formData.amountPerBeneficiary} onChange={e => setFormData((p: any) => ({ ...p, amountPerBeneficiary: e.target.value }))} /></div>
                  </form>
                ) : (
                  <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                    <div className="form-group"><label className="form-label form-label-required">Program</label>
                      <select className="form-input" value={formData.programId} onChange={e => setFormData((p: any) => ({ ...p, programId: e.target.value }))}>
                        <option value="">Select program...</option>
                        {programs.filter((p: any) => !p.deletedAt).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select></div>
                    <div className="form-group"><label className="form-label form-label-required">Schedule Name</label>
                      <input type="text" className="form-input" placeholder="e.g., August 2026 Senior Citizen Payout" value={formData.name} onChange={e => setFormData((p: any) => ({ ...p, name: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-group"><label className="form-label form-label-required">Date</label>
                        <input type="date" className="form-input" value={formData.scheduleDate} onChange={e => setFormData((p: any) => ({ ...p, scheduleDate: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Location</label>
                        <input type="text" className="form-input" value={formData.location} onChange={e => setFormData((p: any) => ({ ...p, location: e.target.value }))} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-group"><label className="form-label">Start Time</label>
                        <input type="time" className="form-input" value={formData.startTime} onChange={e => setFormData((p: any) => ({ ...p, startTime: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">End Time</label>
                        <input type="time" className="form-input" value={formData.endTime} onChange={e => setFormData((p: any) => ({ ...p, endTime: e.target.value }))} /></div>
                    </div>
                    <div className="form-group"><label className="form-label">Notes</label>
                      <textarea className="form-input" rows={2} value={formData.notes} onChange={e => setFormData((p: any) => ({ ...p, notes: e.target.value }))} /></div>
                  </form>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving}
                  onClick={modalType === 'program' ? handleSaveProgram : handleSaveSchedule}>
                  {saving ? 'Saving...' : modalType === 'program' ? 'Create Program' : 'Create Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
