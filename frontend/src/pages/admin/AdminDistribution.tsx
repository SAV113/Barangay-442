import React, { useState } from 'react';
import { Plus, Search, Share2, Package, Users, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { format, parseISO } from 'date-fns';

const DEMO_DISTRIBUTIONS = [
  { id: 1, resourceName: 'Premium Rice', beneficiaryName: 'Pedro Lim', beneficiaryCode: 'BRY442-SC-001', quantity: 1, unit: 'bags', distributionDate: '2026-07-15', purpose: 'Monthly rice distribution for senior citizens', distributedBy: 'Jose Reyes' },
  { id: 2, resourceName: 'Premium Rice', beneficiaryName: 'Lucia Fernandez', beneficiaryCode: 'BRY442-SC-002', quantity: 1, unit: 'bags', distributionDate: '2026-07-15', purpose: 'Monthly rice distribution for senior citizens', distributedBy: 'Jose Reyes' },
  { id: 3, resourceName: 'Premium Rice', beneficiaryName: 'Antonio Bautista', beneficiaryCode: 'BRY442-SC-003', quantity: 1, unit: 'bags', distributionDate: '2026-07-15', purpose: 'Monthly rice distribution for senior citizens', distributedBy: 'Jose Reyes' },
  { id: 4, resourceName: 'Canned Sardines', beneficiaryName: 'Juan Dela Cruz', beneficiaryCode: 'BRY442-4PS-001', quantity: 5, unit: 'cans', distributionDate: '2026-07-20', purpose: '4Ps canned goods distribution', distributedBy: 'Jose Reyes' },
  { id: 5, resourceName: 'Paracetamol 500mg', beneficiaryName: 'Elena Castillo', beneficiaryCode: 'BRY442-PWD-001', quantity: 10, unit: 'tablets', distributionDate: '2026-07-22', purpose: 'Medical mission - pain relief', distributedBy: 'Ana Cruz' },
  { id: 6, resourceName: 'Face Masks', recipientName: 'Community Event', quantity: 100, unit: 'pcs', distributionDate: '2026-07-25', purpose: 'Health event face mask distribution', distributedBy: 'Ana Cruz' },
  { id: 7, resourceName: 'Hygiene Kits', beneficiaryName: 'Rosario Villanueva', beneficiaryCode: 'BRY442-SP-002', quantity: 1, unit: 'kits', distributionDate: '2026-08-01', purpose: 'Hygiene kit for solo parent', distributedBy: 'Jose Reyes' },
];

const resources = [
  { id: 1, name: 'Premium Rice', quantity: 450, unit: 'bags' },
  { id: 2, name: 'Canned Sardines', quantity: 800, unit: 'cans' },
  { id: 3, name: 'Paracetamol 500mg', quantity: 500, unit: 'tablets' },
  { id: 5, name: 'Face Masks (Surgical)', quantity: 1200, unit: 'pcs' },
  { id: 7, name: 'Hygiene Kits', quantity: 60, unit: 'kits' },
];

const beneficiaries = [
  { id: 1, code: 'BRY442-SC-001', name: 'Pedro Lim' },
  { id: 2, code: 'BRY442-SC-002', name: 'Lucia Fernandez' },
  { id: 3, code: 'BRY442-SC-003', name: 'Antonio Bautista' },
  { id: 5, code: 'BRY442-4PS-001', name: 'Juan Dela Cruz' },
  { id: 6, code: 'BRY442-SP-001', name: 'Maria Garcia' },
];

export default function AdminDistribution() {
  const [distributions] = useState(DEMO_DISTRIBUTIONS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ resourceId: '', beneficiaryId: '', recipientName: '', quantity: '', purpose: '' });
  const [selectedResource, setSelectedResource] = useState<typeof resources[0] | null>(null);

  const filtered = distributions.filter(d => {
    const s = search.toLowerCase();
    return !search
      || d.resourceName.toLowerCase().includes(s)
      || (d.beneficiaryName ?? '').toLowerCase().includes(s)
      || (d.beneficiaryCode ?? '').toLowerCase().includes(s)
      || (d.recipientName ?? '').toLowerCase().includes(s);
  });

  const handleResourceChange = (id: string) => {
    setFormData(p => ({ ...p, resourceId: id }));
    setSelectedResource(resources.find(r => r.id === Number(id)) || null);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Resource Distribution</h1>
            <p className="text-gray-500 text-sm mt-1">{distributions.length} distribution records</p>
          </div>
          <button id="new-distribution-btn" onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={17} /> New Distribution
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="card card-compact flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Share2 size={18} className="text-blue-600" /></div>
            <div><p className="text-xl font-extrabold text-gray-900">{distributions.length}</p><p className="text-xs text-gray-500">Total Distributions</p></div>
          </div>
          <div className="card card-compact flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><Users size={18} className="text-teal-600" /></div>
            <div><p className="text-xl font-extrabold text-gray-900">{new Set(distributions.map(d => d.beneficiaryCode).filter(Boolean)).size}</p><p className="text-xs text-gray-500">Beneficiaries Served</p></div>
          </div>
          <div className="card card-compact flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><Package size={18} className="text-green-600" /></div>
            <div><p className="text-xl font-extrabold text-gray-900">{new Set(distributions.map(d => d.resourceName)).size}</p><p className="text-xs text-gray-500">Resources Distributed</p></div>
          </div>
        </div>

        {/* Search */}
        <div className="card mb-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input id="distribution-search" type="search" placeholder="Search by resource, beneficiary, or recipient..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Recipient</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Purpose</th>
                  <th>Distributed By</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon"><Share2 size={28} /></div><p className="font-semibold text-gray-500">No distributions found</p></div></td></tr>
                ) : filtered.map(d => (
                  <tr key={d.id}>
                    <td><span className="font-semibold text-sm text-gray-900">{d.resourceName}</span></td>
                    <td>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{d.beneficiaryName ?? d.recipientName}</p>
                        {d.beneficiaryCode && <p className="text-xs text-gray-400 font-mono">{d.beneficiaryCode}</p>}
                      </div>
                    </td>
                    <td><span className="font-bold text-gray-900">{d.quantity}</span> <span className="text-gray-500 text-xs">{d.unit}</span></td>
                    <td><span className="text-sm text-gray-600">{format(parseISO(d.distributionDate), 'MMM d, yyyy')}</span></td>
                    <td><p className="text-sm text-gray-500 max-w-[200px] truncate">{d.purpose}</p></td>
                    <td><span className="text-sm text-gray-600">{d.distributedBy}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribution Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-bold text-gray-900 font-display">Record New Distribution</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <form id="distribution-form" className="flex flex-col gap-4">
                  {/* Resource */}
                  <div className="form-group">
                    <label className="form-label form-label-required">Resource</label>
                    <select className="form-input" value={formData.resourceId} onChange={e => handleResourceChange(e.target.value)}>
                      <option value="">Select resource...</option>
                      {resources.map(r => (
                        <option key={r.id} value={r.id}>{r.name} — {r.quantity} {r.unit} available</option>
                      ))}
                    </select>
                  </div>

                  {selectedResource && (
                    <div className="p-3 bg-blue-50 rounded-xl text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700">Current Stock:</span>
                        <span className="font-bold text-blue-900">{selectedResource.quantity} {selectedResource.unit}</span>
                      </div>
                    </div>
                  )}

                  {/* Beneficiary */}
                  <div className="form-group">
                    <label className="form-label">Beneficiary</label>
                    <select className="form-input" value={formData.beneficiaryId} onChange={e => setFormData(p => ({ ...p, beneficiaryId: e.target.value }))}>
                      <option value="">Select beneficiary (optional)...</option>
                      {beneficiaries.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                    <span className="form-hint">Leave empty for non-beneficiary recipients</span>
                  </div>

                  {!formData.beneficiaryId && (
                    <div className="form-group">
                      <label className="form-label">Recipient Name</label>
                      <input type="text" className="form-input" placeholder="e.g., Community Event" value={formData.recipientName} onChange={e => setFormData(p => ({ ...p, recipientName: e.target.value }))} />
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="form-group">
                    <label className="form-label form-label-required">Quantity</label>
                    <input type="number" className="form-input" placeholder="Enter quantity..." min={1} max={selectedResource?.quantity || 9999} value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} />
                    {selectedResource && Number(formData.quantity) > selectedResource.quantity && (
                      <span className="form-error"><AlertCircle size={12} />Cannot distribute more than available stock ({selectedResource.quantity} {selectedResource.unit})</span>
                    )}
                  </div>

                  {/* Preview */}
                  {selectedResource && formData.quantity && Number(formData.quantity) <= selectedResource.quantity && (
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-xs font-semibold text-green-700 mb-2">Stock Preview After Distribution</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600">{selectedResource.quantity} {selectedResource.unit}</span>
                        <ArrowRight size={14} className="text-green-500" />
                        <span className="font-bold text-green-700">{selectedResource.quantity - Number(formData.quantity)} {selectedResource.unit}</span>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Purpose</label>
                    <textarea className="form-input" rows={2} placeholder="Reason for distribution..." value={formData.purpose} onChange={e => setFormData(p => ({ ...p, purpose: e.target.value }))} />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button
                  id="confirm-distribution-btn"
                  className="btn btn-primary"
                  disabled={!formData.resourceId || !formData.quantity || (selectedResource ? Number(formData.quantity) > selectedResource.quantity : false)}
                >
                  <CheckCircle size={15} /> Confirm Distribution
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
