import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight, ChevronLeft } from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../../components/layout/PublicLayout';
import { format, parseISO } from 'date-fns';

const categoryColors: Record<string, string> = {
  health: 'badge-success', community: 'badge-primary', emergency: 'badge-error',
  livelihood: 'badge-secondary', general: 'badge-gray', youth: 'badge-info',
  senior: 'badge-warning', environmental: 'badge-secondary',
};

const announcements = [
  { id: 1, title: 'Barangay Clean-Up Drive - August 2026', category: 'community', shortDescription: 'Residents are encouraged to participate in the upcoming community clean-up drive scheduled on August 15, 2026.', publishedAt: '2026-08-01T08:00:00Z' },
  { id: 2, title: 'Free Medical Mission - August 2026', category: 'health', shortDescription: 'Free medical and dental services for all Barangay 442 residents. Bring your barangay ID.', publishedAt: '2026-08-05T09:00:00Z' },
  { id: 3, title: 'Barangay Assembly - August 28, 2026', category: 'community', shortDescription: 'Attend the 3rd Quarter Barangay Assembly on August 28, 2026 at Barangay 442 Hall.', publishedAt: '2026-08-08T07:00:00Z' },
  { id: 4, title: 'Livelihood Training Program - Stitching and Embroidery', category: 'livelihood', shortDescription: 'Free 2-week livelihood training on stitching and embroidery for Barangay 442 residents aged 18-60.', publishedAt: '2026-08-10T10:00:00Z' },
  { id: 5, title: 'Emergency Protocol: Typhoon Preparedness Reminder', category: 'emergency', shortDescription: 'Typhoon preparedness reminder for all Barangay 442 residents. Be ready with emergency kits.', publishedAt: '2026-08-11T06:00:00Z' },
];

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <div className="page-container py-12 lg:py-20">
        <div className="section-header">
          <div className="section-tag"><Megaphone size={14} />Stay Informed</div>
          <h1 className="section-title">All Announcements</h1>
          <p className="section-subtitle">Important updates and news from Barangay 442, Zone 44, Sampaloc, Manila.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {announcements.map(a => (
            <Link key={a.id} to={`/announcements/${a.id}`} id={`announcement-${a.id}`} className="card group flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className={`badge ${categoryColors[a.category] ?? 'badge-gray'} capitalize`}>{a.category}</span>
                <span className="text-xs text-gray-400">{format(parseISO(a.publishedAt), 'MMM d, yyyy')}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-[#1e3a8a] transition-colors truncate-2">{a.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1 truncate-3">{a.shortDescription}</p>
              <div className="mt-4 flex items-center gap-1.5 text-[#1e3a8a] text-sm font-semibold">Read More <ArrowRight size={14} /></div>
            </Link>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

export function AnnouncementDetailPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <div className="page-container py-12">
        <Link to="/announcements" className="flex items-center gap-1.5 text-sm text-[#1e3a8a] font-semibold hover:underline mb-6"><ChevronLeft size={16} />Back to Announcements</Link>
        <article className="max-w-3xl mx-auto">
          <span className="badge badge-primary capitalize mb-3">Community</span>
          <h1 className="text-3xl font-extrabold text-gray-900 font-display mb-3">Barangay Clean-Up Drive - August 2026</h1>
          <p className="text-gray-500 text-sm mb-6">Published on August 1, 2026 · By Maria Santos</p>
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
            <p>Ang Barangay 442, Zone 44 ay naglulunsad ng isang malaking <strong>Clean-Up Drive</strong> ngayong Agosto 2026!</p>
            <p>Ang lahat ng mga residente ay tinatawagan na lumahok sa programang ito upang panatilihing malinis at maayos ang ating barangay.</p>
            <h3>Mga Detalye:</h3>
            <ul>
              <li><strong>Petsa:</strong> Agosto 15, 2026</li>
              <li><strong>Oras:</strong> 6:00 AM - 10:00 AM</li>
              <li><strong>Lugar:</strong> Iba't ibang sulok ng Barangay 442</li>
            </ul>
            <p>Dalhin ang inyong sariling cleaning materials. May magbibigay ng garbage bags ang barangay.</p>
          </div>
        </article>
      </div>
      <PublicFooter />
    </div>
  );
}
