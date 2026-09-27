import React, { useState } from 'react';
import { Plus, Search, Users, Edit, Trash2, UserCheck, UserX, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import type { User } from '../../types';
import { format, parseISO } from 'date-fns';

const DEMO_USERS: (User & { loginCount?: number })[] = [
  { id: 1, email: 'admin@masid.gov.ph', firstName: 'Maria', lastName: 'Santos', role: 'admin', status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-08-11T09:00:00Z', loginCount: 245 },
  { id: 2, email: 'staff1@masid.gov.ph', firstName: 'Jose', lastName: 'Reyes', role: 'staff', status: 'active', createdAt: '2024-01-15T00:00:00Z', updatedAt: '2026-08-11T08:00:00Z', loginCount: 180 },
  { id: 3, email: 'staff2@masid.gov.ph', firstName: 'Ana', lastName: 'Cruz', role: 'staff', status: 'active', createdAt: '2024-02-01T00:00:00Z', updatedAt: '2026-08-10T14:00:00Z', loginCount: 120 },
  { id: 4, email: 'juan.delacruz@gmail.com', firstName: 'Juan', lastName: 'Dela Cruz', role: 'resident', status: 'active', createdAt: '2024-03-10T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z', loginCount: 15 },
  { id: 5, email: 'maria.garcia@gmail.com', firstName: 'Maria', lastName: 'Garcia', role: 'resident', status: 'active', createdAt: '2024-04-20T00:00:00Z', updatedAt: '2026-07-15T00:00:00Z', loginCount: 8 },
  { id: 6, email: 'pedro.lim@gmail.com', firstName: 'Pedro', lastName: 'Lim', role: 'resident', status: 'active', createdAt: '2024-05-05T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z', loginCount: 3 },
];

const roleBadge: Record<string, { badge: string; icon: React.ElementType }> = {
  admin: { badge: 'badge-error', icon: ShieldAlert },
  staff: { badge: 'badge-primary', icon: ShieldCheck },
  resident: { badge: 'badge-gray', icon: Shield },
};

const statusBadge: Record<string, string> = {
  active: 'badge-success', inactive: 'badge-gray', suspended: 'badge-error',
};

export default function AdminUsers() {
  const [users] = useState(DEMO_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = users.filter(u => {
    const sMatch = !search || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const rMatch = !roleFilter || u.role === roleFilter;
    return sMatch && rMatch;
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">User Management</h1>
            <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
          </div>
          <button id="add-user-btn" onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={17} /> Add User
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: ShieldAlert, bg: 'bg-red-50', color: 'text-red-600' },
            { label: 'Staff', value: users.filter(u => u.role === 'staff').length, icon: ShieldCheck, bg: 'bg-blue-50', color: 'text-blue-600' },
            { label: 'Residents', value: users.filter(u => u.role === 'resident').length, icon: Users, bg: 'bg-gray-100', color: 'text-gray-600' },
          ].map(c => (
            <div key={c.label} className="card card-compact flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}><c.icon size={18} className={c.color} /></div>
              <div><p className="text-xl font-extrabold text-gray-900">{c.value}</p><p className="text-xs text-gray-500">{c.label}</p></div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="user-search" type="search" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
            </div>
            <select id="user-role-filter" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="form-input w-full sm:w-40">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="resident">Resident</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Registered</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(u => {
                  const RoleIcon = roleBadge[u.role]?.icon ?? Shield;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">{u.firstName[0]}{u.lastName[0]}</div>
                          <span className="font-semibold text-sm text-gray-900">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td><span className="text-sm text-gray-600">{u.email}</span></td>
                      <td><span className={`badge ${roleBadge[u.role]?.badge ?? 'badge-gray'} capitalize flex items-center gap-1`}><RoleIcon size={11} />{u.role}</span></td>
                      <td><span className={`badge ${statusBadge[u.status]} capitalize`}>{u.status}</span></td>
                      <td><span className="text-sm text-gray-600">{format(parseISO(u.createdAt), 'MMM d, yyyy')}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button className="btn btn-ghost btn-icon btn-sm"><Edit size={14} /></button>
                          {u.role !== 'admin' && <button className="btn btn-ghost btn-icon btn-sm text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-bold text-gray-900 font-display">Add New User</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <form id="add-user-form" className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group"><label className="form-label form-label-required">First Name</label><input type="text" className="form-input" /></div>
                    <div className="form-group"><label className="form-label form-label-required">Last Name</label><input type="text" className="form-input" /></div>
                  </div>
                  <div className="form-group"><label className="form-label form-label-required">Email</label><input type="email" className="form-input" /></div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Role</label>
                    <select className="form-input"><option value="resident">Resident</option><option value="staff">Staff</option><option value="admin">Admin</option></select>
                  </div>
                  <div className="form-group"><label className="form-label form-label-required">Password</label><input type="password" className="form-input" placeholder="Min 8 characters" /></div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary">Create User</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
