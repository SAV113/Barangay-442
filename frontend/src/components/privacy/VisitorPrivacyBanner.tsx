import React, { useState, useEffect } from 'react';
import { Shield, Lock, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PrivacyConsentModal } from './PrivacyConsentModal';

export function VisitorPrivacyBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Check if visitor has already consented or acknowledged
    const consent = localStorage.getItem('masid_privacy_consented_version') || localStorage.getItem('masid_visitor_privacy_acknowledged');
    if (!consent) {
      // Delay slightly for smooth appearance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem('masid_visitor_privacy_acknowledged', '1.0');
    setIsVisible(false);
  };

  const handleConsentSuccess = () => {
    localStorage.setItem('masid_visitor_privacy_acknowledged', '1.0');
    setModalOpen(false);
    setIsVisible(false);
  };

  if (!isVisible && !modalOpen) return null;

  return (
    <>
      {isVisible && (
        <aside
          role="region"
          aria-label="Data Privacy Notice"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 p-4 animate-fade-in"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-xs">
              <Shield size={18} className="text-teal-200" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm font-display">
                  DATA PRIVACY NOTICE
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-[#1e3a8a] rounded-full border border-blue-100">
                  R.A. 10173
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                By using MASID Barangay 442 E-Services, your personal information is protected and processed solely for legitimate barangay welfare, payouts, and service records.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Lock size={12} />
                  <span>Review Notice</span>
                </button>

                <button
                  type="button"
                  onClick={handleAcknowledge}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Accept & Dismiss
                </button>

                <Link
                  to="/privacy"
                  className="text-xs text-slate-500 hover:text-[#1e3a8a] transition-colors ml-auto underline"
                >
                  Read Policy
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAcknowledge}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 cursor-pointer"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </aside>
      )}

      {/* Full Modal invoked by "Review Notice" */}
      <PrivacyConsentModal
        isOpen={modalOpen}
        onConsentSuccess={handleConsentSuccess}
        onDeclineLogout={() => setModalOpen(false)}
        requiredVersion="1.0"
      />
    </>
  );
}

export default VisitorPrivacyBanner;
