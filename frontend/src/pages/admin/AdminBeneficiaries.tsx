import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Eye, Trash2, Users, UserCheck, UserX, X } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import type { Beneficiary, BeneficiaryCategory, BeneficiaryStatus, Resident } from '../../types';
import { beneficiariesApi, residentsApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const categoryLabels: Record<string, string> = {
  senior_citizen: 'Senior Citizen', pwd: 'PWD', solo_parent: 'Solo Parent',
  '4ps': '4Ps', indigent: 'Indigent', other: 'Other',
};
const categoryBadge: Record<string, string> = {
  senior_citizen: 'badge-warning', pwd: 'badge-info', solo_parent: 'badge-secondary',
  '4ps': 'badge-primary', indigent: 'badge-gray', other: 'badge-gray',
};
const statusBadge: Record<string, string> = {
  active: 'badge-success', inactive: 'badge-gray', archived: 'badge-error',
};

const categoryCodePrefix: Record<string, string> = {
  senior_citizen: 'SC', pwd: 'PWD', solo_parent: 'SP', '4ps': '4PS', indigent: 'IND', other: 'OTH',
};

export default function AdminBeneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BeneficiaryCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<BeneficiaryStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'add' | 'edit'>('view');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

  // Form state
  const [residents, setResidents] = useState<Resident[]>([]);
  const [formData, setFormData] = useState({
    residentId: '', category: '' as BeneficiaryCategory | '', beneficiaryCode: '', notes: '', dateRegistered: new Date().toISOString().split('T')[0], status: 'active' as BeneficiaryStatus,
  });
  const [saving, setSaving] = useState(false);

  // Summary counts (from all data)
  const [summaryStats, setSummaryStats] = useState({ total: 0, active: 0, seniors: 0, inactive: 0 });

  const fetchBeneficiaries = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page, limit: perPage };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await beneficiariesApi.getAll(params);
      setBeneficiaries(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  const fetchSummary = async () => {
    try {
      const all = await beneficiariesApi.getAll({ limit: 9999 });
      const list: Beneficiary[] = all.data.data || [];
      setSummaryStats({
        total: list.length,
        active: list.filter(b => b.status === 'active').length,
        seniors: list.filter(b => b.category === 'senior_citizen').length,
        inactive: list.filter(b => b.status === 'inactive').length,
      });
    } catch { /* ignore summary error */ }
  };

  useEffect(() => { fetchBeneficiaries(); }, [fetchBeneficiaries]);
  useEffect(() => { fetchSummary(); }, []);

  const fetchResidents = async () => {
    try {
      const res = await residentsApi.getAll({ limit: 9999 });
      setResidents(res.data.data || res.data || []);
    } catch { /* ignore */ }
  };

  const openAddModal = () => {
    setSelectedBeneficiary(null);
    setFormData({ residentId: '', category: '', beneficiaryCode: '', notes: '', dateRegistered: new Date().toISOString().split('T')[0], status: 'active' });
    setModalMode('add');
    setShowModal(true);
    fetchResidents();
  };

  const openEditModal = (b: Beneficiary) => {
    setSelectedBeneficiary(b);
    setFormData({
      residentId: String(b.residentId), category: b.category, beneficiaryCode: b.beneficiaryCode,
      notes: b.notes || '', dateRegistered: b.dateRegistered, status: b.status,
    });
    setModalMode('edit');
    setShowModal(true);
    fetchResidents();
  };

  const openViewModal = (b: Beneficiary) => {
    setSelectedBeneficiary(b);
    setModalMode('view');
    setShowModal(true);
  };

  const generateCode = (category: string) => {
    const prefix = categoryCodePrefix[category] || 'OTH';
    const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `BRY442-${prefix}-${num}`;
  };

  const handleCategoryChange = (cat: string) => {
    setFormData(p => ({ ...p, category: cat as BeneficiaryCategory, beneficiaryCode: generateCode(cat) }));
  };

  const handleSave = async () => {
    if (!formData.category || !formData.dateRegistered) {
      toast.error('Please fill in required fields');
      return;
    }
    if (modalMode === 'add' && !formData.residentId) {
      toast.error('Please select a resident');
      return;
    }
    try {
      setSaving(true);
      if (modalMode === 'add') {
        await beneficiariesApi.create({
          residentId: Number(formData.residentId), category: formData.category,
          beneficiaryCode: formData.beneficiaryCode || generateCode(formData.category),
          dateRegistered: formData.dateRegistered, notes: formData.notes,
        });
        toast.success('Beneficiary added successfully');
      } else if (modalMode === 'edit' && selectedBeneficiary) {
        await beneficiariesApi.update(selectedBeneficiary.id, {
          category: formData.category, status: formData.status,
          beneficiaryCode: formData.beneficiaryCode, notes: formData.notes,
        });
        toast.success('Beneficiary updated successfully');
      }
      setShowModal(false);
      fetchBeneficiaries();
      fetchSummary();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save beneficiary');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: Beneficiary) => {
    if (!confirm(`Are you sure you want to delete ${b.resident?.firstName} ${b.resident?.lastName} (${b.beneficiaryCode})?`)) return;
    try {
      await beneficiariesApi.delete(b.id);
      toast.success('Beneficiary deleted');
      fetchBeneficiaries();
      fetchSummary();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Beneficiaries</h1>
            <p className="text-gray-500 text-sm mt-1">{total} total records</p>
          </div>
          <button id="add-beneficiary-btn" onClick={openAddModal} className="btn btn-primary">
            <Plus size={17} /> Add Beneficiary
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: summaryStats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: summaryStats.active, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Senior Citizens', value: summaryStats.seniors, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Inactive', value: summaryStats.inactive, icon: UserX, color: 'text-gray-500', bg: 'bg-gray-100' },
          ].map(card => (
            <div key={card.label} className="card card-compact flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                <card.icon size={18} className={card.color} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="beneficiary-search" type="search" placeholder="Search by name or beneficiary code..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="form-input pl-9" />
            </div>
            <select id="beneficiary-category-filter" value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value as BeneficiaryCategory | ''); setPage(1); }}
              className="form-input w-full sm:w-48">
              <option value="">All Categories</option>
              {Object.entries(categoryLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select id="beneficiary-status-filter" value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as BeneficiaryStatus | ''); setPage(1); }}
              className="form-input w-full sm:w-36">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-[#1e3a8a] animate-spin" />
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Beneficiary Code</th><th>Name</th><th>Category</th>
                    <th>Address</th><th>Status</th><th>Date Registered</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.length === 0 ? (
                    <tr><td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-state-icon"><Users size={28} /></div>
                        <p className="font-semibold text-gray-500">No beneficiaries found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters or add a new beneficiary.</p>
                      </div>
                    </td></tr>
                  ) : beneficiaries.map(b => (
                    <tr key={b.id}>
                      <td>
                        <span className="font-mono text-xs font-semibold text-[#1e3a8a] bg-blue-50 px-2 py-1 rounded-lg">
                          {b.beneficiaryCode}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {b.resident?.firstName?.[0]}{b.resident?.lastName?.[0]}
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {b.resident?.firstName} {b.resident?.lastName}
                          </p>
                        </div>
                      </td>
                      <td><span className={`badge ${categoryBadge[b.category]}`}>{categoryLabels[b.category]}</span></td>
                      <td><p className="text-sm text-gray-600 max-w-[200px] truncate">{b.resident?.address}</p></td>
                      <td><span className={`badge ${statusBadge[b.status]} capitalize`}>{b.status}</span></td>
                      <td><span className="text-sm text-gray-600">{format(parseISO(b.dateRegistered), 'MMM d, yyyy')}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button id={`view-beneficiary-${b.id}`} className="btn btn-ghost btn-icon" title="View" onClick={() => openViewModal(b)}><Eye size={15} /></button>
                          <button id={`edit-beneficiary-${b.id}`} className="btn btn-ghost btn-icon" title="Edit" onClick={() => openEditModal(b)}><Edit size={15} /></button>
                          <button id={`delete-beneficiary-${b.id}`} className="btn btn-ghost btn-icon text-red-400 hover:bg-red-50 hover:text-red-600" title="Delete" onClick={() => handleDelete(b)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 text-gray-400">…</span>}
                    <button className={`pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  </React.Fragment>
                ))}
                <button className="pagination-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display">
                    {modalMode === 'view' ? 'Beneficiary Details' : modalMode === 'add' ? 'Add New Beneficiary' : 'Edit Beneficiary'}
                  </h2>
                  {selectedBeneficiary && modalMode === 'view' && (
                    <span className="font-mono text-xs text-[#1e3a8a]">{selectedBeneficiary.beneficiaryCode}</span>
                  )}
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)} aria-label="Close modal"><X size={18} /></button>
              </div>

              <div className="modal-body">
                {modalMode === 'view' && selectedBeneficiary ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
                        {selectedBeneficiary.resident?.firstName?.[0]}{selectedBeneficiary.resident?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{selectedBeneficiary.resident?.firstName} {selectedBeneficiary.resident?.lastName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge ${categoryBadge[selectedBeneficiary.category]}`}>{categoryLabels[selectedBeneficiary.category]}</span>
                          <span className={`badge ${statusBadge[selectedBeneficiary.status]} capitalize`}>{selectedBeneficiary.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Beneficiary Code', value: selectedBeneficiary.beneficiaryCode },
                        { label: 'Date Registered', value: format(parseISO(selectedBeneficiary.dateRegistered), 'MMMM d, yyyy') },
                        { label: 'Address', value: selectedBeneficiary.resident?.address ?? '—' },
                        { label: 'Notes', value: selectedBeneficiary.notes ?? '—' },
                      ].map(field => (
                        <div key={field.label} className={field.label === 'Address' || field.label === 'Notes' ? 'col-span-2' : ''}>
                          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{field.label}</p>
                          <p className="text-sm text-gray-800">{field.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    {modalMode === 'add' && (
                      <div className="form-group">
                        <label className="form-label form-label-required">Resident</label>
                        <select className="form-input" value={formData.residentId} onChange={e => setFormData(p => ({ ...p, residentId: e.target.value }))}>
                          <option value="">Select a resident...</option>
                          {residents.map(r => (
                            <option key={r.id} value={r.id}>{r.firstName} {r.lastName} — {r.address}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label form-label-required">Category</label>
                      <select className="form-input" value={formData.category} onChange={e => handleCategoryChange(e.target.value)}>
                        <option value="">Select category...</option>
                        {Object.entries(categoryLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    {formData.beneficiaryCode && (
                      <div className="form-group">
                        <label className="form-label">Beneficiary Code</label>
                        <input type="text" className="form-input" value={formData.beneficiaryCode} onChange={e => setFormData(p => ({ ...p, beneficiaryCode: e.target.value }))} />
                      </div>
                    )}
                    {modalMode === 'edit' && (
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-input" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as BeneficiaryStatus }))}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Notes</label>
                      <textarea className="form-input" rows={3} placeholder="Optional notes..." value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                  </form>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button id="save-beneficiary-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : modalMode === 'add' ? 'Save Beneficiary' : 'Update Beneficiary'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
