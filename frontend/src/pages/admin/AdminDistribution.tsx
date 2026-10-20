import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Share2, Package, Users, ArrowRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { distributionApi, resourcesApi, beneficiariesApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface DistRecord {
  id: number; resourceId: number; beneficiaryId?: number; recipientName?: string;
  quantity: number; distributionDate: string; purpose?: string; notes?: string;
  distributedBy: number; createdAt: string;
  resource?: { name: string; unit: string };
}
interface ResOption { id: number; name: string; quantity: number; unit: string; }
interface BenOption { id: number; code: string; name: string; }

export default function AdminDistribution() {
  const [distributions, setDistributions] = useState<DistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ resourceId: '', beneficiaryId: '', recipientName: '', quantity: '', purpose: '' });
  const [resources, setResources] = useState<ResOption[]>([]);
  const [beneficiaryOptions, setBeneficiaryOptions] = useState<BenOption[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResOption | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchDistributions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await distributionApi.getAll({ limit: 100 });
      setDistributions(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load distributions');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDistributions(); }, [fetchDistributions]);

  const openModal = async () => {
    setFormData({ resourceId: '', beneficiaryId: '', recipientName: '', quantity: '', purpose: '' });
    setSelectedResource(null);
    setShowModal(true);
    try {
      const [resRes, benRes] = await Promise.all([
        resourcesApi.getAll({ limit: 999 }),
        beneficiariesApi.getAll({ limit: 999, status: 'active' }),
      ]);
      const resList = (resRes.data.data || []).filter((r: any) => r.quantity > 0);
      setResources(resList.map((r: any) => ({ id: r.id, name: r.name, quantity: r.quantity, unit: r.unit })));
      const benList = benRes.data.data || [];
      setBeneficiaryOptions(benList.map((b: any) => ({
        id: b.id, code: b.beneficiaryCode,
        name: b.resident ? `${b.resident.firstName} ${b.resident.lastName}` : `#${b.id}`,
      })));
    } catch { /* ignore dropdown load errors */ }
  };

  const handleResourceChange = (id: string) => {
    setFormData(p => ({ ...p, resourceId: id }));
    setSelectedResource(resources.find(r => r.id === Number(id)) || null);
  };

  const handleSubmit = async () => {
    if (!formData.resourceId || !formData.quantity) { toast.error('Resource and quantity are required'); return; }
    if (selectedResource && Number(formData.quantity) > selectedResource.quantity) { toast.error('Cannot exceed available stock'); return; }
    try {
      setSaving(true);
      await distributionApi.create({
        resourceId: Number(formData.resourceId),
        beneficiaryId: formData.beneficiaryId ? Number(formData.beneficiaryId) : null,
        recipientName: formData.recipientName || null,
        quantity: Number(formData.quantity),
        distributionDate: new Date().toISOString().split('T')[0],
        purpose: formData.purpose || null,
      });
      toast.success('Distribution recorded successfully');
      setShowModal(false);
      fetchDistributions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record distribution');
    } finally { setSaving(false); }
  };

  const filtered = distributions.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (d.resource?.name || '').toLowerCase().includes(s) ||
      (d.recipientName || '').toLowerCase().includes(s);
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Resource Distribution</h1>
            <p className="text-gray-500 text-sm mt-1">{distributions.length} distribution records</p>
          </div>
          <button id="new-distribution-btn" onClick={openModal} className="btn btn-primary"><Plus size={17} /> New Distribution</button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="card card-compact flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Share2 size={18} className="text-blue-600" /></div>
            <div><p className="text-xl font-extrabold text-gray-900">{distributions.length}</p><p className="text-xs text-gray-500">Total Distributions</p></div>
          </div>
          <div className="card card-compact flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><Users size={18} className="text-teal-600" /></div>
            <div><p className="text-xl font-extrabold text-gray-900">{new Set(distributions.filter(d => d.beneficiaryId).map(d => d.beneficiaryId)).size}</p><p className="text-xs text-gray-500">Beneficiaries Served</p></div>
          </div>
          <div className="card card-compact flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><Package size={18} className="text-green-600" /></div>
            <div><p className="text-xl font-extrabold text-gray-900">{new Set(distributions.map(d => d.resource?.name).filter(Boolean)).size}</p><p className="text-xs text-gray-500">Resources Distributed</p></div>
          </div>
        </div>

        {/* Search */}
        <div className="card mb-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input id="distribution-search" type="search" placeholder="Search by resource or recipient..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-[#1e3a8a] animate-spin" /></div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Resource</th><th>Recipient</th><th>Quantity</th><th>Date</th><th>Purpose</th></tr></thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon"><Share2 size={28} /></div><p className="font-semibold text-gray-500">No distributions found</p></div></td></tr>
                  ) : filtered.map(d => (
                    <tr key={d.id}>
                      <td><span className="font-semibold text-sm text-gray-900">{d.resource?.name || `Resource #${d.resourceId}`}</span></td>
                      <td><p className="font-medium text-sm text-gray-900">{d.recipientName || '—'}</p></td>
                      <td><span className="font-bold text-gray-900">{d.quantity}</span> <span className="text-gray-500 text-xs">{d.resource?.unit || ''}</span></td>
                      <td><span className="text-sm text-gray-600">{format(parseISO(d.distributionDate), 'MMM d, yyyy')}</span></td>
                      <td><p className="text-sm text-gray-500 max-w-[200px] truncate">{d.purpose || '—'}</p></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Distribution Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-bold text-gray-900 font-display">Record New Distribution</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <form id="distribution-form" className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                  <div className="form-group">
                    <label className="form-label form-label-required">Resource</label>
                    <select className="form-input" value={formData.resourceId} onChange={e => handleResourceChange(e.target.value)}>
                      <option value="">Select resource...</option>
                      {resources.map(r => (<option key={r.id} value={r.id}>{r.name} — {r.quantity} {r.unit} available</option>))}
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
                  <div className="form-group">
                    <label className="form-label">Beneficiary</label>
                    <select className="form-input" value={formData.beneficiaryId} onChange={e => setFormData(p => ({ ...p, beneficiaryId: e.target.value }))}>
                      <option value="">Select beneficiary (optional)...</option>
                      {beneficiaryOptions.map(b => (<option key={b.id} value={b.id}>{b.name} ({b.code})</option>))}
                    </select>
                    <span className="form-hint">Leave empty for non-beneficiary recipients</span>
                  </div>
                  {!formData.beneficiaryId && (
                    <div className="form-group">
                      <label className="form-label">Recipient Name</label>
                      <input type="text" className="form-input" placeholder="e.g., Community Event" value={formData.recipientName} onChange={e => setFormData(p => ({ ...p, recipientName: e.target.value }))} />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label form-label-required">Quantity</label>
                    <input type="number" className="form-input" placeholder="Enter quantity..." min={1} max={selectedResource?.quantity || 9999} value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} />
                    {selectedResource && Number(formData.quantity) > selectedResource.quantity && (
                      <span className="form-error"><AlertCircle size={12} />Cannot distribute more than available stock ({selectedResource.quantity} {selectedResource.unit})</span>
                    )}
                  </div>
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
                <button id="confirm-distribution-btn" className="btn btn-primary" onClick={handleSubmit}
                  disabled={saving || !formData.resourceId || !formData.quantity || (selectedResource ? Number(formData.quantity) > selectedResource.quantity : false)}>
                  {saving ? 'Processing...' : <><CheckCircle size={15} /> Confirm Distribution</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
