import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Eye, Trash2, Users, UserCheck, UserX, ChevronDown } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import type { Beneficiary, BeneficiaryCategory, BeneficiaryStatus } from '../../types';
import { format, parseISO } from 'date-fns';

// Demo data
const DEMO_BENEFICIARIES: Beneficiary[] = [
  { id: 1, residentId: 3, beneficiaryCode: 'BRY442-SC-001', category: 'senior_citizen', status: 'active', dateRegistered: '2024-01-15', notes: 'Qualified senior citizen beneficiary', createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z', resident: { id: 3, firstName: 'Pedro', lastName: 'Lim', address: '789 Bonifacio St.', createdAt: '', updatedAt: '' } },
  { id: 2, residentId: 4, beneficiaryCode: 'BRY442-SC-002', category: 'senior_citizen', status: 'active', dateRegistered: '2024-01-15', notes: 'Qualified senior citizen beneficiary', createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z', resident: { id: 4, firstName: 'Lucia', lastName: 'Fernandez', address: '321 Quezon St.', createdAt: '', updatedAt: '' } },
  { id: 3, residentId: 7, beneficiaryCode: 'BRY442-SC-003', category: 'senior_citizen', status: 'active', dateRegistered: '2024-02-01', notes: 'Qualified senior citizen beneficiary', createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z', resident: { id: 7, firstName: 'Antonio', lastName: 'Bautista', address: '147 Legarda St.', createdAt: '', updatedAt: '' } },
  { id: 4, residentId: 1, beneficiaryCode: 'BRY442-4PS-001', category: '4ps', status: 'active', dateRegistered: '2024-01-20', notes: '4Ps registered household', createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z', resident: { id: 1, firstName: 'Juan', lastName: 'Dela Cruz', address: '123 Rizal St.', createdAt: '', updatedAt: '' } },
  { id: 5, residentId: 2, beneficiaryCode: 'BRY442-SP-001', category: 'solo_parent', status: 'active', dateRegistered: '2024-03-10', notes: 'Solo parent with 2 children', createdAt: '2024-03-10T00:00:00Z', updatedAt: '2024-03-10T00:00:00Z', resident: { id: 2, firstName: 'Maria', lastName: 'Garcia', address: '456 Mabini Ave.', createdAt: '', updatedAt: '' } },
  { id: 6, residentId: 5, beneficiaryCode: 'BRY442-IND-001', category: 'indigent', status: 'active', dateRegistered: '2024-04-01', notes: 'Indigent family - low income', createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-04-01T00:00:00Z', resident: { id: 5, firstName: 'Roberto', lastName: 'Mendoza', address: '654 Luna St.', createdAt: '', updatedAt: '' } },
  { id: 7, residentId: 8, beneficiaryCode: 'BRY442-PWD-001', category: 'pwd', status: 'active', dateRegistered: '2024-04-10', notes: 'PWD with disability ID', createdAt: '2024-04-10T00:00:00Z', updatedAt: '2024-04-10T00:00:00Z', resident: { id: 8, firstName: 'Elena', lastName: 'Castillo', address: '258 Espana Blvd.', createdAt: '', updatedAt: '' } },
  { id: 8, residentId: 9, beneficiaryCode: 'BRY442-IND-002', category: 'indigent', status: 'inactive', dateRegistered: '2024-05-01', notes: 'Inactive', createdAt: '2024-05-01T00:00:00Z', updatedAt: '2024-05-01T00:00:00Z', resident: { id: 9, firstName: 'Fernando', lastName: 'Torres', address: '369 P. Noval St.', createdAt: '', updatedAt: '' } },
];

const categoryLabels: Record<string, string> = {
  senior_citizen: 'Senior Citizen',
  pwd: 'PWD',
  solo_parent: 'Solo Parent',
  '4ps': '4Ps',
  indigent: 'Indigent',
  other: 'Other',
};

const categoryBadge: Record<string, string> = {
  senior_citizen: 'badge-warning',
  pwd: 'badge-info',
  solo_parent: 'badge-secondary',
  '4ps': 'badge-primary',
  indigent: 'badge-gray',
  other: 'badge-gray',
};

const statusBadge: Record<string, string> = {
  active: 'badge-success',
  inactive: 'badge-gray',
  archived: 'badge-error',
};

export default function AdminBeneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(DEMO_BENEFICIARIES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BeneficiaryCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<BeneficiaryStatus | ''>('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const perPage = 10;

  const filtered = beneficiaries.filter(b => {
    const name = `${b.resident?.firstName ?? ''} ${b.resident?.lastName ?? ''}`.toLowerCase();
    const code = b.beneficiaryCode.toLowerCase();
    const searchMatch = !search || name.includes(search.toLowerCase()) || code.includes(search.toLowerCase());
    const catMatch = !categoryFilter || b.category === categoryFilter;
    const statMatch = !statusFilter || b.status === statusFilter;
    return searchMatch && catMatch && statMatch;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Beneficiaries</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} total records</p>
          </div>
          <button
            id="add-beneficiary-btn"
            onClick={() => { setSelectedBeneficiary(null); setShowModal(true); }}
            className="btn btn-primary"
          >
            <Plus size={17} />
            Add Beneficiary
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: beneficiaries.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: beneficiaries.filter(b => b.status === 'active').length, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Senior Citizens', value: beneficiaries.filter(b => b.category === 'senior_citizen').length, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Inactive', value: beneficiaries.filter(b => b.status === 'inactive').length, icon: UserX, color: 'text-gray-500', bg: 'bg-gray-100' },
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
              <input
                id="beneficiary-search"
                type="search"
                placeholder="Search by name or beneficiary code..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="form-input pl-9"
              />
            </div>
            <select
              id="beneficiary-category-filter"
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value as BeneficiaryCategory | ''); setPage(1); }}
              className="form-input w-full sm:w-48"
            >
              <option value="">All Categories</option>
              {Object.entries(categoryLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select
              id="beneficiary-status-filter"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as BeneficiaryStatus | ''); setPage(1); }}
              className="form-input w-full sm:w-36"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Beneficiary Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Date Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <Users size={28} />
                        </div>
                        <p className="font-semibold text-gray-500">No beneficiaries found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters or add a new beneficiary.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map(b => (
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
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {b.resident?.firstName} {b.resident?.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${categoryBadge[b.category]}`}>
                          {categoryLabels[b.category]}
                        </span>
                      </td>
                      <td>
                        <p className="text-sm text-gray-600 max-w-[200px] truncate">{b.resident?.address}</p>
                      </td>
                      <td>
                        <span className={`badge ${statusBadge[b.status]} capitalize`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {format(parseISO(b.dateRegistered), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            id={`view-beneficiary-${b.id}`}
                            className="btn btn-ghost btn-icon"
                            title="View details"
                            onClick={() => { setSelectedBeneficiary(b); setShowModal(true); }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            id={`edit-beneficiary-${b.id}`}
                            className="btn btn-ghost btn-icon"
                            title="Edit beneficiary"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            id={`delete-beneficiary-${b.id}`}
                            className="btn btn-ghost btn-icon text-red-400 hover:bg-red-50 hover:text-red-600"
                            title="Archive beneficiary"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2 text-gray-400">…</span>
                      )}
                      <button
                        className={`pagination-btn ${page === p ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal (View/Add) */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display">
                    {selectedBeneficiary ? 'Beneficiary Details' : 'Add New Beneficiary'}
                  </h2>
                  {selectedBeneficiary && (
                    <span className="font-mono text-xs text-[#1e3a8a]">{selectedBeneficiary.beneficiaryCode}</span>
                  )}
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)} aria-label="Close modal">
                  ×
                </button>
              </div>

              <div className="modal-body">
                {selectedBeneficiary ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
                        {selectedBeneficiary.resident?.firstName?.[0]}{selectedBeneficiary.resident?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {selectedBeneficiary.resident?.firstName} {selectedBeneficiary.resident?.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge ${categoryBadge[selectedBeneficiary.category]}`}>
                            {categoryLabels[selectedBeneficiary.category]}
                          </span>
                          <span className={`badge ${statusBadge[selectedBeneficiary.status]} capitalize`}>
                            {selectedBeneficiary.status}
                          </span>
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
                  <form className="flex flex-col gap-4">
                    <p className="text-sm text-gray-500">
                      Select a resident and fill in the beneficiary details.
                    </p>
                    <div className="form-group">
                      <label className="form-label form-label-required">Category</label>
                      <select className="form-input">
                        <option value="">Select category...</option>
                        {Object.entries(categoryLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notes</label>
                      <textarea className="form-input" rows={3} placeholder="Optional notes about this beneficiary..." />
                    </div>
                  </form>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  {selectedBeneficiary ? 'Close' : 'Cancel'}
                </button>
                {!selectedBeneficiary && (
                  <button id="save-beneficiary-btn" className="btn btn-primary">
                    Save Beneficiary
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
