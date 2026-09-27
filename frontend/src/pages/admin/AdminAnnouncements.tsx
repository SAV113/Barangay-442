import React, { useState } from 'react';
import { Plus, Search, Megaphone, Edit, Trash2, Eye, Globe, EyeOff, Archive } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import type { Announcement } from '../../types';
import { format, parseISO } from 'date-fns';

const DEMO_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: 'Barangay Clean-Up Drive - August 2026', category: 'community', content: '<p>Residents are encouraged to participate.</p>', shortDescription: 'Residents are encouraged to participate in the upcoming community clean-up drive scheduled on August 15, 2026.', authorId: 1, status: 'published', publishedAt: '2026-08-01T08:00:00Z', createdAt: '2026-08-01T08:00:00Z', updatedAt: '2026-08-01T08:00:00Z' },
  { id: 2, title: 'Free Medical Mission - August 2026', category: 'health', content: '<p>Free medical services for all residents.</p>', shortDescription: 'Free medical and dental services for all Barangay 442 residents. Bring your barangay ID.', authorId: 1, status: 'published', publishedAt: '2026-08-05T09:00:00Z', createdAt: '2026-08-05T09:00:00Z', updatedAt: '2026-08-05T09:00:00Z' },
  { id: 3, title: 'Barangay Assembly - August 28, 2026', category: 'community', content: '<p>Quarterly assembly for all residents.</p>', shortDescription: 'Attend the 3rd Quarter Barangay Assembly on August 28, 2026 at Barangay 442 Hall.', authorId: 1, status: 'published', publishedAt: '2026-08-08T07:00:00Z', createdAt: '2026-08-08T07:00:00Z', updatedAt: '2026-08-08T07:00:00Z' },
  { id: 4, title: 'Livelihood Training Program', category: 'livelihood', content: '<p>Free 2-week livelihood training.</p>', shortDescription: 'Free 2-week livelihood training on stitching and embroidery for residents aged 18-60.', authorId: 2, status: 'published', publishedAt: '2026-08-10T10:00:00Z', createdAt: '2026-08-10T10:00:00Z', updatedAt: '2026-08-10T10:00:00Z' },
  { id: 5, title: 'Emergency Protocol: Typhoon Preparedness', category: 'emergency', content: '<p>Be prepared for the incoming typhoon.</p>', shortDescription: 'Typhoon preparedness reminder for all Barangay 442 residents. Be ready with emergency kits.', authorId: 1, status: 'published', publishedAt: '2026-08-11T06:00:00Z', createdAt: '2026-08-11T06:00:00Z', updatedAt: '2026-08-11T06:00:00Z' },
  { id: 6, title: 'Water Interruption Notice (Draft)', category: 'general', content: '<p>Scheduled water interruption notice.</p>', shortDescription: 'There will be a scheduled water service interruption on September 1, 2026.', authorId: 1, status: 'draft', createdAt: '2026-08-11T10:00:00Z', updatedAt: '2026-08-11T10:00:00Z' },
];

const categoryColors: Record<string, string> = {
  health: 'badge-success', community: 'badge-primary', emergency: 'badge-error',
  livelihood: 'badge-secondary', general: 'badge-gray', youth: 'badge-info',
  senior: 'badge-warning', environmental: 'badge-secondary',
};

const statusBadge: Record<string, string> = {
  published: 'badge-success', draft: 'badge-gray', archived: 'badge-warning',
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEMO_ANNOUNCEMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = announcements.filter(a => {
    const tMatch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const sMatch = !statusFilter || a.status === statusFilter;
    const cMatch = !categoryFilter || a.category === categoryFilter;
    return tMatch && sMatch && cMatch;
  });

  const togglePublish = (id: number) => {
    setAnnouncements(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === 'published' ? 'draft' : 'published', publishedAt: a.status !== 'published' ? new Date().toISOString() : a.publishedAt } : a
    ));
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Announcements</h1>
            <p className="text-gray-500 text-sm mt-1">
              {announcements.filter(a => a.status === 'published').length} published · {announcements.filter(a => a.status === 'draft').length} drafts
            </p>
          </div>
          <button id="add-announcement-btn" onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={17} /> Create Announcement
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="announcement-search" type="search" placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
            </div>
            <select id="announcement-category-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="form-input w-full sm:w-40">
              <option value="">All Categories</option>
              <option value="health">Health</option>
              <option value="community">Community</option>
              <option value="emergency">Emergency</option>
              <option value="livelihood">Livelihood</option>
              <option value="general">General</option>
            </select>
            <select id="announcement-status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-full sm:w-36">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
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
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Published Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon"><Megaphone size={28} /></div><p className="font-semibold text-gray-500">No announcements found</p></div></td></tr>
                ) : filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="max-w-md">
                        <p className="font-semibold text-gray-900 text-sm truncate">{a.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{a.shortDescription}</p>
                      </div>
                    </td>
                    <td><span className={`badge ${categoryColors[a.category] ?? 'badge-gray'} capitalize`}>{a.category}</span></td>
                    <td><span className={`badge ${statusBadge[a.status] ?? 'badge-gray'} capitalize`}>{a.status}</span></td>
                    <td><span className="text-sm text-gray-600">{a.publishedAt ? format(parseISO(a.publishedAt), 'MMM d, yyyy') : '—'}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button id={`view-announcement-${a.id}`} className="btn btn-ghost btn-icon btn-sm" title="View"><Eye size={14} /></button>
                        <button id={`edit-announcement-${a.id}`} className="btn btn-ghost btn-icon btn-sm" title="Edit"><Edit size={14} /></button>
                        <button
                          id={`toggle-announcement-${a.id}`}
                          onClick={() => togglePublish(a.id)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title={a.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {a.status === 'published' ? <EyeOff size={14} className="text-amber-500" /> : <Globe size={14} className="text-green-500" />}
                        </button>
                        <button id={`delete-announcement-${a.id}`} className="btn btn-ghost btn-icon btn-sm text-red-400 hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-bold text-gray-900 font-display">Create New Announcement</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <form id="create-announcement-form" className="flex flex-col gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Title</label>
                    <input type="text" className="form-input" placeholder="Announcement title..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label form-label-required">Category</label>
                      <select className="form-input">
                        <option value="general">General</option>
                        <option value="health">Health</option>
                        <option value="community">Community</option>
                        <option value="emergency">Emergency</option>
                        <option value="livelihood">Livelihood</option>
                        <option value="youth">Youth</option>
                        <option value="senior">Senior</option>
                        <option value="environmental">Environmental</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Author</label>
                      <input type="text" className="form-input" value="Maria Santos" disabled />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Short Description</label>
                    <input type="text" className="form-input" placeholder="Brief summary shown in listings..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Content</label>
                    <textarea className="form-input" rows={6} placeholder="Full announcement content..." />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-announcement-draft-btn" className="btn btn-outline">Save as Draft</button>
                <button id="save-announcement-publish-btn" className="btn btn-primary">Publish</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
