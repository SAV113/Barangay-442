import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../../components/layout/PublicLayout';
import { format, parseISO } from 'date-fns';

const eventCategoryIcons: Record<string, string> = {
  assembly: '🏛️', health: '🏥', sports: '⚽', youth: '🎓', senior: '👴',
  livelihood: '💼', environmental: '🌿', cultural: '🎭', other: '📌',
};

const events = [
  { id: 1, title: 'Barangay Assembly - 3rd Quarter 2026', description: 'Quarterly barangay assembly open to all residents. Discuss community plans, budget, and receive updates from barangay officials. Q&A session included.', eventDate: '2026-08-28', startTime: '09:00:00', endTime: '12:00:00', location: 'Barangay 442 Hall, Zone 44, Sampaloc, Manila', category: 'assembly' },
  { id: 2, title: 'Libre Medical Mission', description: 'Free medical services including general check-up, blood pressure monitoring, blood sugar testing, and medicine distribution.', eventDate: '2026-08-18', startTime: '07:00:00', endTime: '17:00:00', location: 'Barangay 442 Health Center, Zone 44', category: 'health' },
  { id: 3, title: 'Community Clean-Up Drive', description: 'Join us for the quarterly community clean-up drive. Cleaning materials and refreshments provided.', eventDate: '2026-08-15', startTime: '06:00:00', endTime: '10:00:00', location: 'Various locations in Barangay 442, Zone 44', category: 'environmental' },
  { id: 4, title: 'Youth Sports Festival 2026', description: 'Annual sports event for the youth. Events include basketball, volleyball, badminton, and track and field. Open to ages 12-25.', eventDate: '2026-09-05', startTime: '08:00:00', endTime: '18:00:00', location: 'Sampaloc Sports Complex', category: 'sports' },
  { id: 5, title: 'Senior Citizen Appreciation Day', description: 'Special event honoring our beloved senior citizens. Includes free lunch, entertainment, health checks, and special gifts.', eventDate: '2026-09-15', startTime: '09:00:00', endTime: '15:00:00', location: 'Barangay 442 Hall, Zone 44, Sampaloc, Manila', category: 'senior' },
  { id: 6, title: 'Livelihood Training: Stitching and Embroidery', description: '2-week livelihood training program for residents aged 18-60. Certificate of completion will be awarded.', eventDate: '2026-08-25', startTime: '08:00:00', endTime: '17:00:00', location: 'Barangay 442 Multi-Purpose Hall, Zone 44', category: 'livelihood' },
];

function fmtTime(t: string) {
  try { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m); return format(d, 'h:mm a'); } catch { return t; }
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <div className="page-container py-12 lg:py-20">
        <div className="section-header">
          <div className="section-tag"><Calendar size={14} />Community Events</div>
          <h1 className="section-title">Upcoming Events</h1>
          <p className="section-subtitle">Join community activities and stay connected with Barangay 442, Zone 44.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map(event => (
            <Link key={event.id} to={`/events/${event.id}`} id={`public-event-${event.id}`} className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] rounded-xl flex flex-col items-center justify-center text-white">
                  <span className="text-xs font-semibold opacity-80">{format(parseISO(event.eventDate), 'MMM')}</span>
                  <span className="text-xl font-extrabold leading-tight">{format(parseISO(event.eventDate), 'd')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl mb-1">{eventCategoryIcons[event.category] ?? '📌'}</div>
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
      </div>
      <PublicFooter />
    </div>
  );
}

export function EventDetailPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <div className="page-container py-12">
        <Link to="/events" className="flex items-center gap-1.5 text-sm text-[#1e3a8a] font-semibold hover:underline mb-6"><ChevronLeft size={16} />Back to Events</Link>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-5 mb-6">
            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] rounded-2xl flex flex-col items-center justify-center text-white">
              <span className="text-sm font-semibold opacity-80">Aug</span>
              <span className="text-3xl font-extrabold leading-tight">28</span>
            </div>
            <div>
              <span className="text-3xl mb-2 block">🏛️</span>
              <h1 className="text-3xl font-extrabold text-gray-900 font-display">Barangay Assembly - 3rd Quarter 2026</h1>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card card-compact flex items-center gap-3"><Clock size={18} className="text-teal-500" /><div><p className="text-xs text-gray-500">Time</p><p className="font-semibold text-gray-900 text-sm">9:00 AM – 12:00 PM</p></div></div>
            <div className="card card-compact flex items-center gap-3"><MapPin size={18} className="text-teal-500" /><div><p className="text-xs text-gray-500">Location</p><p className="font-semibold text-gray-900 text-sm">Barangay 442 Hall, Zone 44</p></div></div>
            <div className="card card-compact flex items-center gap-3"><Calendar size={18} className="text-teal-500" /><div><p className="text-xs text-gray-500">Category</p><p className="font-semibold text-gray-900 text-sm">Assembly</p></div></div>
          </div>
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
            <p>Quarterly barangay assembly open to all residents of Barangay 442, Zone 44. Discuss community plans, budget, and receive updates from barangay officials.</p>
            <h3>Agenda:</h3>
            <ul>
              <li>Ulat sa paggastos ng barangay funds</li>
              <li>Mga proyektong natapos at kasalukuyang isinasagawa</li>
              <li>Pagtatanggap ng mga mungkahi mula sa mga residente</li>
              <li>Q&A session with barangay officials</li>
            </ul>
            <p>Ang lahat ng mga residente ay inaanyayahang dumalo. Maaaring mag-register sa Barangay Hall bago ang event.</p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
