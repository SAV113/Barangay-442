import React, { useState } from 'react';
import { Plus, Search, Calendar, MapPin, Clock, Edit, Trash2, Eye, Globe, EyeOff } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import type { BarangayEvent } from '../../types';
import { format, parseISO } from 'date-fns';

const DEMO_EVENTS: BarangayEvent[] = [
  { id: 1, title: 'Barangay Assembly - 3rd Quarter 2026', description: 'Quarterly barangay assembly open to all residents. Discuss community plans, budget, and receive updates.', eventDate: '2026-08-28', startTime: '09:00:00', endTime: '12:00:00', location: 'Barangay 442 Hall, Sampaloc, Manila', category: 'assembly', status: 'published', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 2, title: 'Libre Medical Mission', description: 'Free medical services including general check-up, blood pressure monitoring, blood sugar testing.', eventDate: '2026-08-18', startTime: '07:00:00', endTime: '17:00:00', location: 'Barangay 442 Health Center', category: 'health', status: 'published', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 3, title: 'Community Clean-Up Drive', description: 'Join us for the quarterly community clean-up drive. Cleaning materials provided.', eventDate: '2026-08-15', startTime: '06:00:00', endTime: '10:00:00', location: 'Various locations in Barangay 442', category: 'environmental', status: 'published', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 4, title: 'Youth Sports Festival 2026', description: 'Annual sports event for the youth. Basketball, volleyball, badminton, track and field.', eventDate: '2026-09-05', startTime: '08:00:00', endTime: '18:00:00', location: 'Sampaloc Sports Complex', category: 'sports', status: 'published', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 5, title: 'Senior Citizen Appreciation Day', description: 'Special event honoring our beloved senior citizens.', eventDate: '2026-09-15', startTime: '09:00:00', endTime: '15:00:00', location: 'Barangay 442 Hall', category: 'senior', status: 'published', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 6, title: 'Livelihood Training (Draft)', description: '2-week livelihood training program.', eventDate: '2026-08-25', startTime: '08:00:00', location: 'Barangay 442 Multi-Purpose Hall', category: 'livelihood', status: 'draft', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
];

const categoryEmoji: Record<string, string> = {
  assembly: '🏛️', health: '🏥', sports: '⚽', youth: '🎓', senior: '👴',
  livelihood: '💼', environmental: '🌿', cultural: '🎭', other: '📌',
};

const statusBadge: Record<string, string> = {
  published: 'badge-success',
  draft: 'badge-gray',
  cancelled: 'badge-error',
  completed: 'badge-info',
};

function fmtTime(t: string) {
  try {
    const [h, m] = t.split(':').map(Number);
    const d = new Date(); d.setHours(h, m);
    return format(d, 'h:mm a');
  } catch { return t; }
}

export default function AdminEvents() {
  const [events, setEvents] = useState<BarangayEvent[]>(DEMO_EVENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);

  const filtered = events.filter(e => {
    const titleMatch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    const statMatch = !statusFilter || e.status === statusFilter;
    return titleMatch && statMatch;
  });

  const togglePublish = (id: number) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      return { ...e, status: e.status === 'published' ? 'draft' : 'published' };
    }));
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display">Event Management</h1>
            <p className="text-gray-500 text-sm mt-1">{events.filter(e => e.status === 'published').length} published · {events.filter(e => e.status === 'draft').length} draft</p>
          </div>
          <button id="add-event-btn" onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={17} /> Create Event
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="event-search" type="search" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
            </div>
            <select id="event-status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-full sm:w-40">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(event => (
            <div key={event.id} id={`event-card-${event.id}`} className="card flex flex-col">
              {/* Date badge */}
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

              {event.description && (
                <p className="text-xs text-gray-400 truncate-2 flex-1">{event.description}</p>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button id={`view-event-${event.id}`} className="btn btn-ghost btn-icon btn-sm" title="View"><Eye size={14} /></button>
                  <button id={`edit-event-${event.id}`} className="btn btn-ghost btn-icon btn-sm" title="Edit"><Edit size={14} /></button>
                  <button id={`delete-event-${event.id}`} className="btn btn-ghost btn-icon btn-sm text-red-400 hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                </div>
                <button
                  id={`toggle-publish-event-${event.id}`}
                  onClick={() => togglePublish(event.id)}
                  className={`btn btn-sm flex items-center gap-1 ${event.status === 'published' ? 'btn-ghost text-amber-600 hover:bg-amber-50' : 'btn-secondary'}`}
                  title={event.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {event.status === 'published' ? <><EyeOff size={13} />Unpublish</> : <><Globe size={13} />Publish</>}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card"><div className="empty-state"><div className="empty-state-icon"><Calendar size={28} /></div><p className="font-semibold text-gray-500">No events found</p></div></div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-lg font-bold text-gray-900 font-display">Create New Event</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <form id="create-event-form" className="flex flex-col gap-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Event Title</label>
                    <input type="text" className="form-input" placeholder="Enter event title..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label form-label-required">Date</label>
                      <input type="date" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label form-label-required">Category</label>
                      <select className="form-input">
                        <option value="assembly">Assembly</option>
                        <option value="health">Health</option>
                        <option value="sports">Sports</option>
                        <option value="youth">Youth</option>
                        <option value="senior">Senior</option>
                        <option value="livelihood">Livelihood</option>
                        <option value="environmental">Environmental</option>
                        <option value="cultural">Cultural</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label form-label-required">Start Time</label>
                      <input type="time" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Time</label>
                      <input type="time" className="form-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Location</label>
                    <input type="text" className="form-input" placeholder="Event location..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={3} placeholder="Event description..." />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-event-draft-btn" className="btn btn-outline">Save as Draft</button>
                <button id="save-event-publish-btn" className="btn btn-primary">Publish Event</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
