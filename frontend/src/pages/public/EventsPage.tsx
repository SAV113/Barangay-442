import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../../components/layout/PublicLayout';
import { eventsApi } from '../../services/api';
import type { BarangayEvent } from '../../types';
import { format, parseISO } from 'date-fns';

const eventCategoryIcons: Record<string, string> = {
  assembly: '🏛️', health: '🏥', sports: '⚽', youth: '🎓', senior: '👴',
  livelihood: '💼', environmental: '🌿', cultural: '🎭', other: '📌',
};

function fmtTime(t?: string) {
  if (!t) return '';
  try { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m); return format(d, 'h:mm a'); } catch { return t; }
}

export default function EventsPage() {
  const [events, setEvents] = useState<BarangayEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getPublished({ limit: 50 })
      .then(r => setEvents(r.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <div className="page-container py-12 lg:py-20">
        <div className="section-header">
          <div className="section-tag"><Calendar size={14} />Community Events</div>
          <h1 className="section-title">Upcoming Events</h1>
          <p className="section-subtitle">Join community activities and stay connected with Barangay 442, Zone 44.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-semibold">No upcoming events</p>
            <p className="text-sm">Check back later for new community events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} id={`public-event-${event.id}`} className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] rounded-xl flex flex-col items-center justify-center text-white">
                    <span className="text-xs font-semibold opacity-80">{event.eventDate ? format(parseISO(event.eventDate), 'MMM') : ''}</span>
                    <span className="text-xl font-extrabold leading-tight">{event.eventDate ? format(parseISO(event.eventDate), 'd') : ''}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl mb-1">{eventCategoryIcons[event.category ?? ''] ?? '📌'}</div>
                    <h3 className="font-bold text-gray-900 text-base group-hover:text-[#1e3a8a] transition-colors truncate-2">{event.title}</h3>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-2"><Clock size={13} className="flex-shrink-0 text-teal-500" />{fmtTime(event.startTime)}{event.endTime ? ` – ${fmtTime(event.endTime)}` : ''}</div>
                  <div className="flex items-center gap-2"><MapPin size={13} className="flex-shrink-0 text-teal-500" /><span className="truncate">{event.location}</span></div>
                </div>
                <p className="text-sm text-gray-400 truncate-2 flex-1">{event.description}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[#1e3a8a] text-sm font-semibold">View Details <ChevronRight size={15} /></div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<BarangayEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Events /public endpoint doesn't have getById, so fetch all published and find
    eventsApi.getPublished({ limit: 100 })
      .then(r => {
        const found = (r.data?.data ?? []).find((e: BarangayEvent) => e.id === parseInt(id));
        if (found) {
          setEvent(found);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <div className="page-container py-12">
        <Link to="/events" className="flex items-center gap-1.5 text-sm text-[#1e3a8a] font-semibold hover:underline mb-6"><ChevronLeft size={16} />Back to Events</Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : error || !event ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-semibold">Event not found</p>
            <p className="text-sm mt-1">It may have been removed or is no longer published.</p>
          </div>
        ) : (
          <article className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{eventCategoryIcons[event.category ?? ''] ?? '📌'}</span>
              <span className="badge badge-primary capitalize">{event.category}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-display mb-3">{event.title}</h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              {event.eventDate && (
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-[#1e3a8a]" />
                  {format(parseISO(event.eventDate), 'EEEE, MMMM d, yyyy')}
                </div>
              )}
              {event.startTime && (
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#1e3a8a]" />
                  {fmtTime(event.startTime)}{event.endTime ? ` – ${fmtTime(event.endTime)}` : ''}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#1e3a8a]" />
                  {event.location}
                </div>
              )}
            </div>

            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </article>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}
