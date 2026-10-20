import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, Wallet, Megaphone, User, Settings, LogOut, Building2, ChevronRight, MapPin, Clock, FileText, Loader2 } from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../../components/layout/PublicLayout';
import { useAuth } from '../../contexts/AuthContext';
import { announcementsApi, eventsApi } from '../../services/api';
import type { Announcement, BarangayEvent } from '../../types';
import { format, parseISO } from 'date-fns';

const quickLinks = [
  { icon: Wallet, title: 'View Payout Schedule', desc: 'Check upcoming payout dates and requirements', link: '/payouts', color: 'bg-blue-50', iconColor: 'text-blue-600' },
  { icon: Calendar, title: 'Upcoming Events', desc: 'Community events and activities', link: '/events', color: 'bg-teal-50', iconColor: 'text-teal-600' },
  { icon: Megaphone, title: 'Announcements', desc: 'Latest barangay news and updates', link: '/announcements', color: 'bg-amber-50', iconColor: 'text-amber-600' },
  { icon: FileText, title: 'Request Information', desc: 'Access public barangay documents', link: '/services', color: 'bg-violet-50', iconColor: 'text-violet-600' },
];

function fmtTime(t?: string) {
  if (!t) return '';
  try { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m); return format(d, 'h:mm a'); } catch { return t; }
}

export default function ResidentDashboard() {
  const { user, logout } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<BarangayEvent[]>([]);
  const [loadingA, setLoadingA] = useState(true);
  const [loadingE, setLoadingE] = useState(true);

  useEffect(() => {
    announcementsApi.getPublished({ limit: 5 })
      .then(r => setAnnouncements(r.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingA(false));

    eventsApi.getPublished({ limit: 5 })
      .then(r => setEvents(r.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingE(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <div className="page-container py-8">
        {/* Welcome */}
        <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #14b8a6 100%)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white font-display">
                  Mabuhay, {user?.firstName ?? 'Resident'}!
                </h1>
                <p className="text-white/70 text-sm">Welcome to your MASID Resident Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => logout()} className="btn btn-outline-white btn-sm text-red-200 border-red-300/50 hover:bg-red-500/20">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickLinks.map(link => (
            <Link key={link.title} to={link.link} className="card card-compact group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <link.icon size={18} className={link.iconColor} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#1e3a8a] transition-colors">{link.title}</h3>
              <p className="text-gray-500 text-xs">{link.desc}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Announcements */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 font-display">Recent Announcements</h2>
              <Link to="/announcements" className="text-xs text-[#1e3a8a] font-semibold hover:underline">View All</Link>
            </div>
            {loadingA ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-300" size={24} /></div>
            ) : announcements.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No announcements yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {announcements.map(a => (
                  <Link key={a.id} to={`/announcements/${a.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Megaphone size={16} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1e3a8a] truncate">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.publishedAt ? format(parseISO(a.publishedAt), 'MMM d, yyyy') : ''} · <span className="capitalize">{a.category}</span></p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 font-display">Upcoming Events</h2>
              <Link to="/events" className="text-xs text-[#1e3a8a] font-semibold hover:underline">View All</Link>
            </div>
            {loadingE ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-300" size={24} /></div>
            ) : events.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No upcoming events</p>
            ) : (
              <div className="flex flex-col gap-2">
                {events.map(e => (
                  <Link key={e.id} to={`/events/${e.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] rounded-xl flex flex-col items-center justify-center text-white">
                      <span className="text-[8px] font-semibold opacity-80">{e.eventDate ? format(parseISO(e.eventDate), 'MMM') : ''}</span>
                      <span className="text-sm font-extrabold leading-tight">{e.eventDate ? format(parseISO(e.eventDate), 'd') : ''}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1e3a8a] truncate">{e.title}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1"><Clock size={10} />{fmtTime(e.startTime)}</span>
                        <span className="flex items-center gap-1"><MapPin size={10} />{e.location}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
