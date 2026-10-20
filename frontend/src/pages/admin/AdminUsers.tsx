import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Users, Edit, Trash2, Shield, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import type { User } from '../../types';
import { usersApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const roleBadge: Record<string, { badge: string; icon: React.ElementType }> = {
  admin: { badge: 'badge-error', icon: ShieldAlert },
  staff: { badge: 'badge-primary', icon: ShieldCheck },
  resident: { badge: 'badge-gray', icon: Shield },
};
const statusBadge: Record<string, string> = {
  active: 'badge-success', inactive: 'badge-gray', suspended: 'badge-error',
};

const emptyForm = { firstName: '', lastName: '', email: '', role: 'resident', password: '', status: 'active' };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { limit: 100 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await usersApi.getAll(params);
      setUsers(res.data.data || res.data || []);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load users'); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAddModal = () => { setSelectedUser(null); setFormData(emptyForm); setModalMode('add'); setShowModal(true); };
  const openEditModal = (u: User) => {
    setSelectedUser(u);
    setFormData({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, password: '', status: u.status });
    setModalMode('edit'); setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) { toast.error('Fill required fields'); return; }
    if (modalMode === 'add' && !formData.password) { toast.error('Password is required'); return; }
    try {
      setSaving(true);
      if (modalMode === 'add') {
        await usersApi.create(formData);
        toast.success('User created');
      } else if (selectedUser) {
        const payload: any = { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, role: formData.role, status: formData.status };
        if (formData.password) payload.password = formData.password;
        await usersApi.update(selectedUser.id, payload);
        toast.success('User updated');
      }
      setShowModal(false); fetchUsers();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save user'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Delete user ${u.firstName} ${u.lastName}?`)) return;
    try { await usersApi.delete(u.id); toast.success('User deleted'); fetchUsers(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

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
          <button id="add-user-btn" onClick={openAddModal} className="btn btn-primary"><Plus size={17} /> Add User</button>
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
              <option value="">All Roles</option><option value="admin">Admin</option><option value="staff">Staff</option><option value="resident">Resident</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-[#1e3a8a] animate-spin" /></div>
          ) : (
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
                            <button onClick={() => openEditModal(u)} className="btn btn-ghost btn-icon btn-sm"><Edit size={14} /></button>
                            {u.role !== 'admin' && <button onClick={() => handleDelete(u)} className="btn btn-ghost btn-icon btn-sm text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon"><Users size={28} /></div><p className="font-semibold text-gray-500">No users found</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit User Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-bold text-gray-900 font-display">{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <form id="add-user-form" className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group"><label className="form-label form-label-required">First Name</label>
                      <input type="text" className="form-input" value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label form-label-required">Last Name</label>
                      <input type="text" className="form-input" value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} /></div>
                  </div>
                  <div className="form-group"><label className="form-label form-label-required">Email</label>
                    <input type="email" className="form-input" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group"><label className="form-label form-label-required">Role</label>
                      <select className="form-input" value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                        <option value="resident">Resident</option><option value="staff">Staff</option><option value="admin">Admin</option>
                      </select></div>
                    {modalMode === 'edit' && (
                      <div className="form-group"><label className="form-label">Status</label>
                        <select className="form-input" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                          <option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
                        </select></div>
                    )}
                  </div>
                  <div className="form-group"><label className="form-label {modalMode === 'add' ? 'form-label-required' : ''}">{modalMode === 'add' ? 'Password' : 'New Password (leave blank to keep)'}</label>
                    <input type="password" className="form-input" placeholder="Min 8 characters" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} /></div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Create User' : 'Update User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
