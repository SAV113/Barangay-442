import React, { useState, useEffect } from 'react';
import { Wallet, Calendar, Clock, MapPin, Info, Loader2 } from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../../components/layout/PublicLayout';
import { payoutSchedulesApi } from '../../services/api';
import type { PayoutSchedule } from '../../types';
import { format, parseISO } from 'date-fns';

const statusBadge: Record<string, string> = {
  scheduled: 'badge-info', ongoing: 'badge-warning', completed: 'badge-success', cancelled: 'badge-error',
};

function fmtTime(t?: string) {
  if (!t) return '';
  try { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m); return format(d, 'h:mm a'); } catch { return t; }
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    payoutSchedulesApi.getPublic()
      .then(r => setPayouts(r.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <div className="page-container py-12 lg:py-20">
        <div className="section-header">
          <div className="section-tag"><Wallet size={14} />Assistance Programs</div>
          <h1 className="section-title">Upcoming Payouts</h1>
          <p className="section-subtitle">View the schedule for upcoming payout distributions from Barangay 442, Zone 44. Bring valid ID and qualifying documents.</p>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 mb-8 max-w-3xl mx-auto">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Important Reminder</p>
            <p className="text-blue-700">Only <strong>public payout schedule information</strong> is shown here. Beneficiary records and personal information are secured and accessible only to authorized barangay personnel.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Wallet size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-semibold">No scheduled payouts</p>
            <p className="text-sm">Check back later for upcoming payout schedules.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-w-3xl mx-auto">
            {payouts.map(payout => (
              <div key={payout.id} id={`public-payout-${payout.id}`} className="card border-l-4 border-l-[#1e3a8a]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{payout.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Program: {payout.program?.name ?? 'N/A'}</p>
                  </div>
                  <span className={`badge ${statusBadge[payout.status] ?? 'badge-gray'} capitalize flex-shrink-0`}>{payout.status}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Calendar size={15} className="text-[#1e3a8a]" /></div>
                    <div><p className="text-xs text-gray-400">Date</p><p className="font-semibold">{payout.scheduleDate ? format(parseISO(payout.scheduleDate), 'MMMM d, yyyy') : 'TBD'}</p></div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Clock size={15} className="text-[#1e3a8a]" /></div>
                    <div><p className="text-xs text-gray-400">Time</p><p className="font-semibold">{fmtTime(payout.startTime)} – {fmtTime(payout.endTime)}</p></div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><MapPin size={15} className="text-[#1e3a8a]" /></div>
                    <div><p className="text-xs text-gray-400">Location</p><p className="font-semibold">{payout.location}</p></div>
                  </div>
                </div>

                {payout.notes && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-sm text-amber-800"><strong>Note:</strong> {payout.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}
