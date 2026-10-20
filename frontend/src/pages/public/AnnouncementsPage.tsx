import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Megaphone, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../../components/layout/PublicLayout';
import { announcementsApi } from '../../services/api';
import type { Announcement } from '../../types';
import { format, parseISO } from 'date-fns';

const categoryColors: Record<string, string> = {
  health: 'badge-success', community: 'badge-primary', emergency: 'badge-error',
  livelihood: 'badge-secondary', general: 'badge-gray', youth: 'badge-info',
  senior: 'badge-warning', environmental: 'badge-secondary',
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementsApi.getPublished({ limit: 50 })
      .then(r => setAnnouncements(r.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <div className="page-container py-12 lg:py-20">
        <div className="section-header">
          <div className="section-tag"><Megaphone size={14} />Stay Informed</div>
          <h1 className="section-title">All Announcements</h1>
          <p className="section-subtitle">Important updates and news from Barangay 442, Zone 44, Sampaloc, Manila.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Megaphone size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-semibold">No announcements yet</p>
            <p className="text-sm">Check back later for updates from the barangay.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {announcements.map(a => (
              <Link key={a.id} to={`/announcements/${a.id}`} id={`announcement-${a.id}`} className="card group flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge ${categoryColors[a.category] ?? 'badge-gray'} capitalize`}>{a.category}</span>
                  <span className="text-xs text-gray-400">{a.publishedAt ? format(parseISO(a.publishedAt), 'MMM d, yyyy') : ''}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-[#1e3a8a] transition-colors truncate-2">{a.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 truncate-3">{a.shortDescription || a.content?.slice(0, 120)}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[#1e3a8a] text-sm font-semibold">Read More <ArrowRight size={14} /></div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    // The getById endpoint is behind auth, so try the public list and find by id
    // Or just call getPublished and filter — but more efficient to just call getById
    // The detail endpoint IS behind auth middleware in announcements.js
    // So we fetch from the public list instead
    announcementsApi.getPublished({ limit: 100 })
      .then(r => {
        const found = (r.data?.data ?? []).find((a: Announcement) => a.id === parseInt(id));
        if (found) {
          setAnnouncement(found);
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
        <Link to="/announcements" className="flex items-center gap-1.5 text-sm text-[#1e3a8a] font-semibold hover:underline mb-6"><ChevronLeft size={16} />Back to Announcements</Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : error || !announcement ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-semibold">Announcement not found</p>
            <p className="text-sm mt-1">It may have been removed or unpublished.</p>
          </div>
        ) : (
          <article className="max-w-3xl mx-auto">
            <span className={`badge ${categoryColors[announcement.category] ?? 'badge-gray'} capitalize mb-3`}>{announcement.category}</span>
            <h1 className="text-3xl font-extrabold text-gray-900 font-display mb-3">{announcement.title}</h1>
            <p className="text-gray-500 text-sm mb-6">
              Published on {announcement.publishedAt ? format(parseISO(announcement.publishedAt), 'MMMM d, yyyy') : 'N/A'}
              {announcement.author && ` · By ${announcement.author.firstName} ${announcement.author.lastName}`}
            </p>
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {announcement.content || announcement.shortDescription}
            </div>
          </article>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}
