import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Megaphone, Edit, Trash2, Globe, EyeOff, X, RefreshCw, Clock } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import type { Announcement } from '../../types';
import { announcementsApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const categoryColors: Record<string, string> = {
  health: 'badge-success', community: 'badge-primary', emergency: 'badge-error',
  livelihood: 'badge-secondary', general: 'badge-gray', youth: 'badge-info',
  senior: 'badge-warning', environmental: 'badge-secondary',
};
const statusBadge: Record<string, string> = {
  published: 'badge-success', draft: 'badge-gray', archived: 'badge-warning',
};

const emptyForm = { title: '', category: 'general', shortDescription: '', content: '' };

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<(Announcement & { expirationDate?: string; expiredAt?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { limit: 100 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await announcementsApi.getAll(params);
      setAnnouncements(res.data.data || res.data || []);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load announcements'); }
    finally { setLoading(false); }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const openAddModal = () => { setSelectedAnnouncement(null); setFormData(emptyForm); setModalMode('add'); setShowModal(true); };
  const openEditModal = (a: Announcement) => {
    setSelectedAnnouncement(a);
    setFormData({ title: a.title, category: a.category, shortDescription: a.shortDescription || '', content: a.content });
    setModalMode('edit'); setShowModal(true);
  };

  const handleSave = async (publishStatus: 'draft' | 'published') => {
    if (!formData.title || !formData.content) { toast.error('Title and content are required'); return; }
    try {
      setSaving(true);
      const payload = { ...formData, status: publishStatus };
      if (modalMode === 'add') { await announcementsApi.create(payload); toast.success(publishStatus === 'published' ? 'Announcement published!' : 'Saved as draft'); }
      else if (selectedAnnouncement) { await announcementsApi.update(selectedAnnouncement.id, payload); toast.success('Announcement updated'); }
      setShowModal(false); fetchAnnouncements();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const togglePublish = async (a: Announcement) => {
    try {
      if (a.status === 'published') { await announcementsApi.unpublish(a.id); toast.success('Unpublished'); }
      else { await announcementsApi.publish(a.id); toast.success('Published!'); }
      fetchAnnouncements();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  // Item 7: Republish expired/archived announcements
  const handleRepublish = async (a: Announcement) => {
    if (!confirm(`Republish "${a.title}"? This will set a new 3-month expiration period.`)) return;
    try {
      await announcementsApi.republish(a.id);
      toast.success('Announcement republished with new 3-month period');
      fetchAnnouncements();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to republish'); }
  };

  const handleDelete = async (a: Announcement) => {
    if (!confirm(`Permanently delete "${a.title}"?`)) return;
    try { await announcementsApi.delete(a.id); toast.success('Deleted'); fetchAnnouncements(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const filtered = announcements;

  // Calculate days until expiration
  const getDaysUntilExpiry = (expirationDate?: string) => {
    if (!expirationDate) return null;
    const exp = new Date(expirationDate);
    const now = new Date();
    const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Announcements</h1>
            <p className="text-gray-500 text-sm mt-1">
              {announcements.filter(a => a.status === 'published').length} published · {announcements.filter(a => a.status === 'draft').length} drafts · {announcements.filter(a => a.status === 'archived').length} archived
            </p>
          </div>
          <button id="add-announcement-btn" onClick={openAddModal} className="btn btn-primary"><Plus size={17} /> Create Announcement</button>
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="announcement-search" type="search" placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
            </div>
            <select id="announcement-category-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="form-input w-full sm:w-40">
              <option value="">All Categories</option><option value="health">Health</option><option value="community">Community</option>
              <option value="emergency">Emergency</option><option value="livelihood">Livelihood</option><option value="general">General</option>
              <option value="youth">Youth</option><option value="senior">Senior</option><option value="environmental">Environmental</option>
            </select>
            <select id="announcement-status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-full sm:w-36">
              <option value="">All Status</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived / Expired</option>
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
                <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Published</th><th>Expires</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon"><Megaphone size={28} /></div><p className="font-semibold text-gray-500">No announcements found</p></div></td></tr>
                  ) : filtered.map(a => {
                    const daysLeft = getDaysUntilExpiry((a as any).expirationDate);
                    const isExpired = (a as any).expiredAt || (daysLeft !== null && daysLeft <= 0);
                    return (
                      <tr key={a.id}>
                        <td>
                          <div className="max-w-md">
                            <p className="font-semibold text-gray-900 text-sm truncate">{a.title}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{a.shortDescription}</p>
                          </div>
                        </td>
                        <td><span className={`badge ${categoryColors[a.category] ?? 'badge-gray'} capitalize`}>{a.category}</span></td>
                        <td>
                          <div className="flex flex-col gap-1">
                            <span className={`badge ${statusBadge[a.status] ?? 'badge-gray'} capitalize`}>{a.status}</span>
                            {isExpired && a.status === 'archived' && (
                              <span className="badge badge-error text-xs">Auto-Expired</span>
                            )}
                          </div>
                        </td>
                        <td><span className="text-sm text-gray-600">{a.publishedAt ? format(parseISO(a.publishedAt), 'MMM d, yyyy') : '—'}</span></td>
                        <td>
                          {(a as any).expirationDate ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm text-gray-600">{format(parseISO((a as any).expirationDate), 'MMM d, yyyy')}</span>
                              {a.status === 'published' && daysLeft !== null && (
                                <span className={`text-xs font-medium ${daysLeft <= 14 ? 'text-red-500' : daysLeft <= 30 ? 'text-amber-500' : 'text-green-600'}`}>
                                  <Clock size={10} className="inline mr-1" />
                                  {daysLeft > 0 ? `${daysLeft} days left` : 'Expiring soon'}
                                </span>
                              )}
                            </div>
                          ) : <span className="text-sm text-gray-400">—</span>}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button id={`edit-announcement-${a.id}`} onClick={() => openEditModal(a)} className="btn btn-ghost btn-icon btn-sm" title="Edit"><Edit size={14} /></button>
                            {a.status === 'published' ? (
                              <button onClick={() => togglePublish(a)} className="btn btn-ghost btn-icon btn-sm" title="Unpublish">
                                <EyeOff size={14} className="text-amber-500" />
                              </button>
                            ) : a.status === 'archived' || a.status === 'draft' ? (
                              <>
                                {(isExpired || a.status === 'archived') && (
                                  <button onClick={() => handleRepublish(a)} className="btn btn-ghost btn-icon btn-sm" title="Republish (new 3-month period)">
                                    <RefreshCw size={14} className="text-green-500" />
                                  </button>
                                )}
                                {a.status === 'draft' && !isExpired && (
                                  <button onClick={() => togglePublish(a)} className="btn btn-ghost btn-icon btn-sm" title="Publish">
                                    <Globe size={14} className="text-green-500" />
                                  </button>
                                )}
                              </>
                            ) : null}
                            <button id={`delete-announcement-${a.id}`} onClick={() => handleDelete(a)} className="btn btn-ghost btn-icon btn-sm text-red-400 hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-bold text-gray-900 font-display">{modalMode === 'add' ? 'Create New Announcement' : 'Edit Announcement'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <form id="create-announcement-form" className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                  <div className="form-group"><label className="form-label form-label-required">Title</label>
                    <input type="text" className="form-input" placeholder="Announcement title..." value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label form-label-required">Category</label>
                    <select className="form-input" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                      <option value="general">General</option><option value="health">Health</option><option value="community">Community</option>
                      <option value="emergency">Emergency</option><option value="livelihood">Livelihood</option><option value="youth">Youth</option>
                      <option value="senior">Senior</option><option value="environmental">Environmental</option>
                    </select></div>
                  <div className="form-group"><label className="form-label">Short Description</label>
                    <input type="text" className="form-input" placeholder="Brief summary shown in listings..." value={formData.shortDescription} onChange={e => setFormData(p => ({ ...p, shortDescription: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label form-label-required">Content</label>
                    <textarea className="form-input" rows={6} placeholder="Full announcement content..." value={formData.content} onChange={e => setFormData(p => ({ ...p, content: e.target.value }))} /></div>
                  {modalMode === 'add' && (
                    <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                      <Clock size={14} className="inline mr-1" />
                      Published announcements will automatically expire after <strong>3 months</strong> (quarterly period).
                    </div>
                  )}
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-announcement-draft-btn" className="btn btn-outline" onClick={() => handleSave('draft')} disabled={saving}>Save as Draft</button>
                <button id="save-announcement-publish-btn" className="btn btn-primary" onClick={() => handleSave('published')} disabled={saving}>
                  {saving ? 'Saving...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
