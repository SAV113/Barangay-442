import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Calendar, MapPin, Clock, Edit, Trash2, Eye, Globe, EyeOff, X } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import type { BarangayEvent } from '../../types';
import { eventsApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const categoryEmoji: Record<string, string> = {
  assembly: '🏛️', health: '🏥', sports: '⚽', youth: '🎓', senior: '👴',
  livelihood: '💼', environmental: '🌿', cultural: '🎭', other: '📌',
};
const statusBadge: Record<string, string> = {
  published: 'badge-success', draft: 'badge-gray', cancelled: 'badge-error', completed: 'badge-info',
};

function fmtTime(t: string) {
  try { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m); return format(d, 'h:mm a'); } catch { return t; }
}

const emptyForm = { title: '', eventDate: '', startTime: '', endTime: '', location: '', category: 'assembly', description: '' };

export default function AdminEvents() {
  const [events, setEvents] = useState<BarangayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedEvent, setSelectedEvent] = useState<BarangayEvent | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { limit: 100 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await eventsApi.getAll(params);
      setEvents(res.data.data || res.data || []);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load events'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const openAddModal = () => { setSelectedEvent(null); setFormData(emptyForm); setModalMode('add'); setShowModal(true); };
  const openEditModal = (e: BarangayEvent) => {
    setSelectedEvent(e);
    setFormData({ title: e.title, eventDate: e.eventDate, startTime: e.startTime, endTime: e.endTime || '', location: e.location, category: e.category, description: e.description || '' });
    setModalMode('edit'); setShowModal(true);
  };

  const handleSave = async (publishStatus: 'draft' | 'published') => {
    if (!formData.title || !formData.eventDate || !formData.startTime || !formData.location) { toast.error('Please fill required fields'); return; }
    try {
      setSaving(true);
      const payload = { ...formData, status: publishStatus };
      if (modalMode === 'add') { await eventsApi.create(payload); toast.success(publishStatus === 'published' ? 'Event published!' : 'Event saved as draft'); }
      else if (selectedEvent) { await eventsApi.update(selectedEvent.id, payload); toast.success('Event updated'); }
      setShowModal(false); fetchEvents();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to save event'); }
    finally { setSaving(false); }
  };

  const togglePublish = async (event: BarangayEvent) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await eventsApi.update(event.id, { status: newStatus });
      toast.success(newStatus === 'published' ? 'Event published' : 'Event unpublished');
      fetchEvents();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const handleDelete = async (event: BarangayEvent) => {
    if (!confirm(`Delete "${event.title}"?`)) return;
    try { await eventsApi.delete(event.id); toast.success('Event deleted'); fetchEvents(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const filtered = events.filter(e => {
    const titleMatch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    const statMatch = !statusFilter || e.status === statusFilter;
    return titleMatch && statMatch;
  });

  const publishedCount = events.filter(e => e.status === 'published').length;
  const draftCount = events.filter(e => e.status === 'draft').length;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Event Management</h1>
            <p className="text-gray-500 text-sm mt-1">{publishedCount} published · {draftCount} draft</p>
          </div>
          <button id="add-event-btn" onClick={openAddModal} className="btn btn-primary"><Plus size={17} /> Create Event</button>
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="event-search" type="search" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
            </div>
            <select id="event-status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-full sm:w-40">
              <option value="">All Status</option><option value="published">Published</option><option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option><option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-[#1e3a8a] animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(event => (
              <div key={event.id} id={`event-card-${event.id}`} className="card flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] rounded-xl flex flex-col items-center justify-center text-white">
                    <span className="text-xs font-semibold opacity-80">{format(parseISO(event.eventDate), 'MMM')}</span>
                    <span className="text-lg font-extrabold leading-tight">{format(parseISO(event.eventDate), 'd')}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xl">{categoryEmoji[event.category] ?? '📌'}</span>
                      <span className={`badge ${statusBadge[event.status]} capitalize`}>{event.status}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mt-1 truncate-2">{event.title}</h3>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1.5"><Clock size={12} className="text-teal-500" />{fmtTime(event.startTime)}{event.endTime ? ` – ${fmtTime(event.endTime)}` : ''}</div>
                  <div className="flex items-center gap-1.5"><MapPin size={12} className="text-teal-500" /><span className="truncate">{event.location}</span></div>
                </div>
                {event.description && <p className="text-xs text-gray-400 truncate-2 flex-1">{event.description}</p>}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button id={`edit-event-${event.id}`} onClick={() => openEditModal(event)} className="btn btn-ghost btn-icon btn-sm" title="Edit"><Edit size={14} /></button>
                    <button id={`delete-event-${event.id}`} onClick={() => handleDelete(event)} className="btn btn-ghost btn-icon btn-sm text-red-400 hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                  </div>
                  <button id={`toggle-publish-event-${event.id}`} onClick={() => togglePublish(event)}
                    className={`btn btn-sm flex items-center gap-1 ${event.status === 'published' ? 'btn-ghost text-amber-600 hover:bg-amber-50' : 'btn-secondary'}`}
                    title={event.status === 'published' ? 'Unpublish' : 'Publish'}>
                    {event.status === 'published' ? <><EyeOff size={13} />Unpublish</> : <><Globe size={13} />Publish</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="card"><div className="empty-state"><div className="empty-state-icon"><Calendar size={28} /></div><p className="font-semibold text-gray-500">No events found</p></div></div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-bold text-gray-900 font-display">{modalMode === 'add' ? 'Create New Event' : 'Edit Event'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <form id="create-event-form" className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                  <div className="form-group"><label className="form-label form-label-required">Event Title</label>
                    <input type="text" className="form-input" placeholder="Enter event title..." value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group"><label className="form-label form-label-required">Date</label>
                      <input type="date" className="form-input" value={formData.eventDate} onChange={e => setFormData(p => ({ ...p, eventDate: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label form-label-required">Category</label>
                      <select className="form-input" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                        <option value="assembly">Assembly</option><option value="health">Health</option><option value="sports">Sports</option>
                        <option value="youth">Youth</option><option value="senior">Senior</option><option value="livelihood">Livelihood</option>
                        <option value="environmental">Environmental</option><option value="cultural">Cultural</option><option value="other">Other</option>
                      </select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group"><label className="form-label form-label-required">Start Time</label>
                      <input type="time" className="form-input" value={formData.startTime} onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">End Time</label>
                      <input type="time" className="form-input" value={formData.endTime} onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))} /></div>
                  </div>
                  <div className="form-group"><label className="form-label form-label-required">Location</label>
                    <input type="text" className="form-input" placeholder="Event location..." value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Description</label>
                    <textarea className="form-input" rows={3} placeholder="Event description..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-event-draft-btn" className="btn btn-outline" onClick={() => handleSave('draft')} disabled={saving}>Save as Draft</button>
                <button id="save-event-publish-btn" className="btn btn-primary" onClick={() => handleSave('published')} disabled={saving}>
                  {saving ? 'Saving...' : 'Publish Event'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
