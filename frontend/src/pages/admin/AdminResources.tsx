import React, { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, XCircle, Edit, Trash2, TrendingDown } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import type { Resource } from '../../types';
import { format, parseISO } from 'date-fns';

const DEMO_RESOURCES: Resource[] = [
  { id: 1, name: 'Premium Rice', category: 'food', quantity: 450, unit: 'bags', lowStockThreshold: 50, dateAdded: '2026-07-01', expirationDate: '2027-07-01', description: '50kg bags of premium rice from DSWD', status: 'available', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 2, name: 'Canned Sardines', category: 'food', quantity: 800, unit: 'cans', lowStockThreshold: 100, dateAdded: '2026-07-01', expirationDate: '2027-06-30', description: 'Assorted canned sardines', status: 'available', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z' },
  { id: 3, name: 'Paracetamol 500mg', category: 'medicine', quantity: 500, unit: 'tablets', lowStockThreshold: 100, dateAdded: '2026-06-15', expirationDate: '2027-12-31', description: 'Generic paracetamol tablets', status: 'available', createdAt: '2026-06-15T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z' },
  { id: 4, name: 'Amoxicillin 500mg', category: 'medicine', quantity: 200, unit: 'capsules', lowStockThreshold: 50, dateAdded: '2026-06-15', expirationDate: '2027-06-30', description: 'Antibiotic capsules', status: 'available', createdAt: '2026-06-15T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z' },
  { id: 5, name: 'Face Masks (Surgical)', category: 'hygiene', quantity: 1200, unit: 'pcs', lowStockThreshold: 200, dateAdded: '2026-07-10', description: 'Disposable surgical face masks', status: 'available', createdAt: '2026-07-10T00:00:00Z', updatedAt: '2026-07-10T00:00:00Z' },
  { id: 6, name: 'Alcohol 70% (500ml)', category: 'hygiene', quantity: 80, unit: 'bottles', lowStockThreshold: 20, dateAdded: '2026-07-10', expirationDate: '2027-07-10', description: 'Isopropyl alcohol 70%', status: 'low_stock', createdAt: '2026-07-10T00:00:00Z', updatedAt: '2026-07-10T00:00:00Z' },
  { id: 7, name: 'Hygiene Kits', category: 'hygiene', quantity: 60, unit: 'kits', lowStockThreshold: 20, dateAdded: '2026-07-15', description: 'Soap, toothbrush, toothpaste, shampoo', status: 'low_stock', createdAt: '2026-07-15T00:00:00Z', updatedAt: '2026-07-15T00:00:00Z' },
  { id: 8, name: 'Folding Tables', category: 'equipment', quantity: 15, unit: 'pcs', lowStockThreshold: 3, dateAdded: '2026-01-01', description: 'Foldable tables for events', status: 'available', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 9, name: 'Monobloc Chairs', category: 'equipment', quantity: 100, unit: 'pcs', lowStockThreshold: 20, dateAdded: '2026-01-01', description: 'White monobloc chairs', status: 'available', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 10, name: 'Vitamins C 500mg', category: 'medicine', quantity: 5, unit: 'bottles', lowStockThreshold: 10, dateAdded: '2026-05-01', expirationDate: '2026-12-31', description: 'Vitamin C supplements', status: 'out_of_stock', createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
];

const statusConfig: Record<string, { label: string; badge: string; icon: React.ElementType; color: string }> = {
  available: { label: 'Available', badge: 'badge-success', icon: CheckCircle, color: 'text-green-500' },
  low_stock: { label: 'Low Stock', badge: 'badge-warning', icon: AlertTriangle, color: 'text-amber-500' },
  out_of_stock: { label: 'Out of Stock', badge: 'badge-error', icon: XCircle, color: 'text-red-500' },
};

const categoryColors: Record<string, string> = {
  food: 'bg-amber-100 text-amber-700',
  medicine: 'bg-green-100 text-green-700',
  hygiene: 'bg-blue-100 text-blue-700',
  clothing: 'bg-pink-100 text-pink-700',
  equipment: 'bg-gray-100 text-gray-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function AdminResources() {
  const [resources] = useState<Resource[]>(DEMO_RESOURCES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = resources.filter(r => {
    const nameMatch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const catMatch = !categoryFilter || r.category === categoryFilter;
    const statMatch = !statusFilter || r.status === statusFilter;
    return nameMatch && catMatch && statMatch;
  });

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
          <button id="add-resource-btn" className="btn btn-primary">
            <Plus size={17} /> Add Resource
          </button>
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
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                <c.icon size={18} className={c.color} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
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
                id="resource-search"
                type="search"
                placeholder="Search resources..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input pl-9"
              />
            </div>
            <select
              id="resource-category-filter"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="form-input w-full sm:w-40"
            >
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="medicine">Medicine</option>
              <option value="hygiene">Hygiene</option>
              <option value="clothing">Clothing</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>
            <select
              id="resource-status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-input w-full sm:w-40"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(resource => {
            const sc = statusConfig[resource.status];
            const percentUsed = resource.quantity > 0
              ? Math.min(100, (resource.quantity / (resource.quantity + 50)) * 100)
              : 0;

            return (
              <div key={resource.id} id={`resource-card-${resource.id}`} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[resource.category]} capitalize mb-2 inline-block`}>
                      {resource.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base">{resource.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button id={`edit-resource-${resource.id}`} className="btn btn-ghost btn-icon btn-sm"><Edit size={14} /></button>
                    <button id={`delete-resource-${resource.id}`} className="btn btn-ghost btn-icon btn-sm text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </div>

                {/* Quantity display */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-3xl font-extrabold text-gray-900">{resource.quantity.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{resource.unit}</p>
                  </div>
                  <span className={`badge ${sc.badge} flex items-center gap-1`}>
                    <sc.icon size={11} />
                    {sc.label}
                  </span>
                </div>

                {/* Stock Bar */}
                {resource.status !== 'out_of_stock' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Stock Level</span>
                      <span>Threshold: {resource.lowStockThreshold} {resource.unit}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          resource.status === 'low_stock' ? 'bg-amber-400' : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, (resource.quantity / Math.max(resource.quantity, resource.lowStockThreshold * 3)) * 100)}%` }}
                      />
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

        {filtered.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><Package size={28} /></div>
              <p className="font-semibold text-gray-500">No resources found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
