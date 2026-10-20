import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, XCircle, Edit, Trash2, X } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import type { Resource } from '../../types';
import { resourcesApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { label: string; badge: string; icon: React.ElementType; color: string }> = {
  available: { label: 'Available', badge: 'badge-success', icon: CheckCircle, color: 'text-green-500' },
  low_stock: { label: 'Low Stock', badge: 'badge-warning', icon: AlertTriangle, color: 'text-amber-500' },
  out_of_stock: { label: 'Out of Stock', badge: 'badge-error', icon: XCircle, color: 'text-red-500' },
};
const categoryColors: Record<string, string> = {
  food: 'bg-amber-100 text-amber-700', medicine: 'bg-green-100 text-green-700',
  hygiene: 'bg-blue-100 text-blue-700', clothing: 'bg-pink-100 text-pink-700',
  equipment: 'bg-gray-100 text-gray-700', other: 'bg-gray-100 text-gray-700',
};

const emptyForm = { name: '', category: 'food', quantity: '', unit: 'pcs', lowStockThreshold: '10', dateAdded: new Date().toISOString().split('T')[0], expirationDate: '', description: '', status: 'available' };

export default function AdminResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { limit: 100 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await resourcesApi.getAll(params);
      setResources(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const openAddModal = () => {
    setSelectedResource(null); setFormData(emptyForm); setModalMode('add'); setShowModal(true);
  };
  const openEditModal = (r: Resource) => {
    setSelectedResource(r);
    setFormData({ name: r.name, category: r.category, quantity: String(r.quantity), unit: r.unit, lowStockThreshold: String(r.lowStockThreshold), dateAdded: r.dateAdded, expirationDate: r.expirationDate || '', description: r.description || '', status: r.status });
    setModalMode('edit'); setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) { toast.error('Name and category are required'); return; }
    try {
      setSaving(true);
      const payload = { name: formData.name, category: formData.category, quantity: Number(formData.quantity) || 0, unit: formData.unit, lowStockThreshold: Number(formData.lowStockThreshold) || 10, dateAdded: formData.dateAdded, expirationDate: formData.expirationDate || null, description: formData.description || null, status: formData.status };
      if (modalMode === 'add') {
        await resourcesApi.create(payload);
        toast.success('Resource added');
      } else if (selectedResource) {
        await resourcesApi.update(selectedResource.id, payload);
        toast.success('Resource updated');
      }
      setShowModal(false); fetchResources();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save resource');
    } finally { setSaving(false); }
  };

  const handleDelete = async (r: Resource) => {
    if (!confirm(`Delete "${r.name}"?`)) return;
    try { await resourcesApi.delete(r.id); toast.success('Resource deleted'); fetchResources(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const totalQty = resources.reduce((s, r) => s + r.quantity, 0);
  const lowStock = resources.filter(r => r.status === 'low_stock').length;
  const outOfStock = resources.filter(r => r.status === 'out_of_stock').length;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Resource Inventory</h1>
            <p className="text-gray-500 text-sm mt-1">{resources.length} items in inventory</p>
          </div>
          <button id="add-resource-btn" onClick={openAddModal} className="btn btn-primary"><Plus size={17} /> Add Resource</button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Items', value: resources.length, icon: Package, bg: 'bg-blue-50', color: 'text-blue-600' },
            { label: 'Total Quantity', value: totalQty.toLocaleString(), icon: Package, bg: 'bg-teal-50', color: 'text-teal-600' },
            { label: 'Low Stock', value: lowStock, icon: AlertTriangle, bg: 'bg-amber-50', color: 'text-amber-600' },
            { label: 'Out of Stock', value: outOfStock, icon: XCircle, bg: 'bg-red-50', color: 'text-red-500' },
          ].map(c => (
            <div key={c.label} className="card card-compact flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}><c.icon size={18} className={c.color} /></div>
              <div><p className="text-xl font-extrabold text-gray-900">{c.value}</p><p className="text-xs text-gray-500">{c.label}</p></div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="resource-search" type="search" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
            </div>
            <select id="resource-category-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="form-input w-full sm:w-40">
              <option value="">All Categories</option>
              <option value="food">Food</option><option value="medicine">Medicine</option>
              <option value="hygiene">Hygiene</option><option value="clothing">Clothing</option>
              <option value="equipment">Equipment</option><option value="other">Other</option>
            </select>
            <select id="resource-status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-full sm:w-40">
              <option value="">All Status</option>
              <option value="available">Available</option><option value="low_stock">Low Stock</option><option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Resource Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-[#1e3a8a] animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(resource => {
              const sc = statusConfig[resource.status] || statusConfig.available;
              return (
                <div key={resource.id} id={`resource-card-${resource.id}`} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[resource.category]} capitalize mb-2 inline-block`}>{resource.category}</span>
                      <h3 className="font-bold text-gray-900 text-base">{resource.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button id={`edit-resource-${resource.id}`} onClick={() => openEditModal(resource)} className="btn btn-ghost btn-icon btn-sm"><Edit size={14} /></button>
                      <button id={`delete-resource-${resource.id}`} onClick={() => handleDelete(resource)} className="btn btn-ghost btn-icon btn-sm text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-3xl font-extrabold text-gray-900">{resource.quantity.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{resource.unit}</p>
                    </div>
                    <span className={`badge ${sc.badge} flex items-center gap-1`}><sc.icon size={11} />{sc.label}</span>
                  </div>
                  {resource.status !== 'out_of_stock' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Stock Level</span><span>Threshold: {resource.lowStockThreshold} {resource.unit}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${resource.status === 'low_stock' ? 'bg-amber-400' : 'bg-teal-500'}`}
                          style={{ width: `${Math.min(100, (resource.quantity / Math.max(resource.quantity, resource.lowStockThreshold * 3)) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 text-xs text-gray-500">
                    <span>Added: {format(parseISO(resource.dateAdded), 'MMM d, yyyy')}</span>
                    {resource.expirationDate && (
                      <span className={new Date(resource.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-red-500 font-semibold' : ''}>
                        Expires: {format(parseISO(resource.expirationDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && resources.length === 0 && (
          <div className="card"><div className="empty-state"><div className="empty-state-icon"><Package size={28} /></div><p className="font-semibold text-gray-500">No resources found</p><p className="text-sm text-gray-400">Try adjusting your search or filters.</p></div></div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-bold text-gray-900 font-display">{modalMode === 'add' ? 'Add New Resource' : 'Edit Resource'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                  <div className="form-group"><label className="form-label form-label-required">Name</label>
                    <input type="text" className="form-input" placeholder="Resource name..." value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group"><label className="form-label form-label-required">Category</label>
                      <select className="form-input" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                        <option value="food">Food</option><option value="medicine">Medicine</option><option value="hygiene">Hygiene</option>
                        <option value="clothing">Clothing</option><option value="equipment">Equipment</option><option value="other">Other</option>
                      </select></div>
                    <div className="form-group"><label className="form-label form-label-required">Status</label>
                      <select className="form-input" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                        <option value="available">Available</option><option value="low_stock">Low Stock</option><option value="out_of_stock">Out of Stock</option>
                      </select></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="form-group"><label className="form-label form-label-required">Quantity</label>
                      <input type="number" className="form-input" min={0} value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Unit</label>
                      <input type="text" className="form-input" value={formData.unit} onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Low Stock Threshold</label>
                      <input type="number" className="form-input" min={0} value={formData.lowStockThreshold} onChange={e => setFormData(p => ({ ...p, lowStockThreshold: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group"><label className="form-label">Date Added</label>
                      <input type="date" className="form-input" value={formData.dateAdded} onChange={e => setFormData(p => ({ ...p, dateAdded: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Expiration Date</label>
                      <input type="date" className="form-input" value={formData.expirationDate} onChange={e => setFormData(p => ({ ...p, expirationDate: e.target.value }))} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Description</label>
                    <textarea className="form-input" rows={2} placeholder="Optional description..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : modalMode === 'add' ? 'Add Resource' : 'Update Resource'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
