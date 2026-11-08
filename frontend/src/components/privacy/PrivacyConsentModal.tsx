import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  CheckCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Database,
  Share2,
  Clock,
  Award,
  Mail,
  Printer,
  XCircle,
  LogOut,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { privacyApi } from '../../services/api';
import type { PrivacyNoticeData } from '../../types';
import toast from 'react-hot-toast';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onConsentSuccess: () => void;
  onDeclineLogout?: () => void;
  requiredVersion?: string;
}

// Fallback notice content if API is unavailable during load
const FALLBACK_NOTICE: PrivacyNoticeData = {
  version: '1.0',
  lastUpdated: 'November 1, 2026',
  title: 'DATA PRIVACY CONSENT',
  subtitle: 'Pursuant to Republic Act No. 10173 (Data Privacy Act of 2012)',
  message:
    'By using this system, you acknowledge that your personal information may be collected, processed, and stored for legitimate purposes related to the operation and delivery of system services.\n\nYour personal information will be handled in accordance with the applicable data privacy laws and regulations. We are committed to protecting your privacy and ensuring that your information is used only for authorized purposes.\n\nPlease review the Data Privacy Notice carefully before proceeding.',
  dpo: {
    title: 'Barangay 442 Data Protection Officer',
    office: 'Office of the Barangay Captain - Data Privacy Desk',
    email: 'dpo@barangay442.gov.ph',
    contact: '+63 2 8XXX-XXXX',
    address: 'Barangay 442 Hall, Zone 44, District IV, Sampaloc, Manila',
    jurisdiction: 'National Privacy Commission (NPC) Philippines',
  },
  sections: [
    {
      id: 'purpose',
      title: 'Purpose of Data Collection',
      icon: 'Target',
      content:
        'The MASID Barangay E-Services platform collects and processes personal information strictly for legitimate public administration and social welfare purposes in Barangay 442, Sampaloc, Manila.',
      points: [
        'Verifying resident identity and qualifications for barangay welfare assistance.',
        'Scheduling, allocating, and auditing financial payouts and cash disbursements.',
        'Managing inventory, queues, and receipt records for relief goods, medicines, and supplies.',
        'Disseminating urgent barangay announcements, safety advisories, and community event notices.',
        'Generating transparent government audit trails and statistical reports for barangay governance.',
      ],
    },
    {
      id: 'information_collected',
      title: 'Personal Information Collected',
      icon: 'UserCheck',
      content:
        'We only collect information directly necessary for the delivery of barangay e-services. Personal data collected includes:',
      points: [
        'Identity details: Full legal name, gender, civil status, and date of birth.',
        'Contact & Residence: Home address within Barangay 442, email address, and mobile/telephone number.',
        'Social Service Category: Senior Citizen, PWD, Solo Parent, 4Ps recipient, or Indigent status.',
        'Assistance History: Payout schedules, claimed/unclaimed amounts, and resource distribution receipt records.',
        'Account Security: Encrypted password credentials, security verification responses, and login timestamps.',
      ],
    },
    {
      id: 'processing_storage',
      title: 'Data Processing and Storage',
      icon: 'Database',
      content:
        'Your personal information is processed electronically within the secure MASID system environment. All records are stored in protected relational databases with Write-Ahead Logging (WAL) integrity, hosted on monitored cloud infrastructure with restricted physical and network access.',
    },
    {
      id: 'protection_security',
      title: 'Data Protection and Security',
      icon: 'Shield',
      content:
        'We apply organizational, physical, and technical security measures in compliance with National Privacy Commission regulations:',
      points: [
        'Data encryption in transit using Transport Layer Security (TLS/HTTPS) and cryptographic hashing for sensitive credentials.',
        'Strict Role-Based Access Control (RBAC) ensuring only authorized barangay administrators and designated staff can access specific resident records.',
        'Automated, tamper-resistant system audit logging that timestamps every record creation, modification, and access.',
        'Regular data validation, automated anomaly alerts, and strict session timeout protection.',
      ],
    },
    {
      id: 'sharing_disclosure',
      title: 'Data Sharing and Disclosure',
      icon: 'Share2',
      content:
        'Your personal information is strictly confidential. We do not sell, rent, trade, or share your data with private commercial entities.',
      points: [
        'Information is accessed exclusively by accredited Barangay 442 officials performing their official duties.',
        'Data may only be shared with verified government agencies (e.g., DSWD, City of Manila Government, or Commission on Audit) when strictly required by statutory mandates or financial assistance validation laws.',
      ],
    },
    {
      id: 'retention',
      title: 'Data Retention and Disposal',
      icon: 'Clock',
      content:
        'Personal information is retained only for as long as necessary to fulfill the legitimate purposes for which it was obtained, or as mandated by Philippine government auditing rules and statutory retention schedules. Upon expiration of the required period, records are permanently archived or securely anonymized.',
    },
    {
      id: 'user_rights',
      title: 'User Rights under R.A. 10173',
      icon: 'Award',
      content:
        'Under the Philippine Data Privacy Act of 2012, as a data subject you possess the following statutory rights:',
      points: [
        'Right to be Informed: To know whether your personal data is being processed and for what purpose.',
        'Right to Access: To request reasonable access to your personal data held by the barangay.',
        'Right to Rectification: To dispute any inaccuracy or error in your personal data and have it corrected.',
        'Right to Object: To withhold or withdraw consent to the processing of your personal information, subject to statutory limits.',
        'Right to Erasure or Blocking: To suspend, withdraw, or order the removal of your personal data upon valid grounds.',
        'Right to Damages: To be indemnified for any damages sustained due to inaccurate, incomplete, or unlawful processing.',
        'Right to File a Complaint: To lodge a formal complaint before the National Privacy Commission (NPC) at https://privacy.gov.ph.',
      ],
    },
    {
      id: 'dpo_contact',
      title: 'Contact Information of the Data Protection Officer',
      icon: 'Mail',
      content:
        'For inquiries, concerns, requests to exercise your data subject rights, or feedback regarding our privacy practices, you may reach the designated Barangay 442 Data Protection Officer:',
      points: [
        'Designated Officer: Barangay 442 Data Protection Officer',
        'Office: Office of the Barangay Captain, Barangay 442, Zone 44, Sampaloc, Manila',
        'Email Address: dpo@barangay442.gov.ph',
        'Telephone: +63 2 8XXX-XXXX',
        'Office Hours: Monday to Friday, 8:00 AM – 5:00 PM',
      ],
    },
  ],
};

const iconMap: Record<string, React.ElementType> = {
  Target: Lock,
  UserCheck: UserCheck,
  Database: Database,
  Shield: Shield,
  Share2: Share2,
  Clock: Clock,
  Award: Award,
  Mail: Mail,
};

export function PrivacyConsentModal({
  isOpen,
  onConsentSuccess,
  onDeclineLogout,
  requiredVersion,
}: PrivacyConsentModalProps) {
  const [notice, setNotice] = useState<PrivacyNoticeData>(FALLBACK_NOTICE);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch latest notice configuration from backend
      privacyApi
        .getNotice()
        .then((res) => {
          if (res.data) {
            setNotice(res.data);
          }
        })
        .catch(() => {
          // Keep fallback if API call fails
        });
      // Reset checkboxes
      setHasAgreed(false);
      setIsDeclined(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAgree = async () => {
    if (!hasAgreed) return;

    try {
      setIsSubmitting(true);
      await privacyApi.submitConsent({
        consentStatus: 'agreed',
        version: notice.version || requiredVersion || '1.0',
        purpose: 'barangay_services_operation',
      });

      // Cache locally to avoid redundant fetches
      localStorage.setItem('masid_privacy_consented_version', notice.version);

      toast.success('Data Privacy Consent recorded. Thank you!');
      onConsentSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save your privacy consent. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    try {
      // Record decline in backend database
      await privacyApi.submitConsent({
        consentStatus: 'declined',
        version: notice.version || requiredVersion || '1.0',
        purpose: 'barangay_services_operation',
      });
    } catch {
      // Ignore network error on decline
    }
    setIsDeclined(true);
  };

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#0d9488] text-white px-5 py-4 sm:px-6 sm:py-5 flex-shrink-0 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="text-teal-300" size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="privacy-modal-title" className="text-lg sm:text-xl font-extrabold tracking-wide font-display text-white">
                    {notice.title}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/30">
                    v{notice.version}
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium">
                  Barangay 442, Zone 44, Sampaloc, Manila · R.A. 10173 Compliant
                </p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white/90 transition-colors"
              title="Print Privacy Notice"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {isDeclined ? (
          /* Declined State Screen */
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 mb-4 animate-scale-in">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
              Consent Required for System Operation
            </h3>

            <p className="text-sm text-slate-600 max-w-lg mb-4 leading-relaxed">
              You have chosen to decline the Data Privacy Consent Notice. Because MASID processes official barangay services, cash disbursements, and resident records, your consent is legally required under Republic Act No. 10173 to create and operate your account.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 max-w-lg text-left mb-6 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <span>Your information is strictly used for official barangay welfare, verification, and audit purposes.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <span>We never sell or disclose your personal data to commercial third parties.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={14} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <span>You can review the notice again at any time or contact our Data Protection Officer for inquiries.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeclined(false)}
                className="btn btn-primary"
              >
                <RotateCcw size={16} />
                Review Notice Again
              </button>

              {onDeclineLogout ? (
                <button
                  type="button"
                  onClick={onDeclineLogout}
                  className="btn btn-outline text-slate-700"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              ) : (
                <Link to="/" className="btn btn-outline text-slate-700">
                  Return to Home
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* Active Notice Content */
          <>
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 text-slate-700 text-sm leading-relaxed scrollbar-thin">
              {/* Primary Intro Box */}
              <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-teal-50/60 border border-blue-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1e3a8a] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Lock size={16} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900 leading-snug">
                      Official Notice to All Barangay 442 E-Services Users
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {notice.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notice Metadata */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 gap-2">
                <span>
                  <strong>Governing Law:</strong> Republic Act No. 10173 (Philippine Data Privacy Act)
                </span>
                <span>
                  <strong>Last Revision:</strong> {notice.lastUpdated}
                </span>
              </div>

              {/* Notice Sections (Accordion / List) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                  Summary of Privacy Principles & Practices
                </h3>

                {notice.sections.map((section, idx) => {
                  const Icon = iconMap[section.icon] || FileText;
                  const isExpanded = expandedSection === section.id;

                  return (
                    <div
                      key={section.id}
                      className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors bg-white shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="w-full text-left px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#1e3a8a] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {section.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      <div className={`px-4 py-3.5 space-y-2.5 text-xs sm:text-sm text-slate-600 ${isExpanded ? 'block' : 'block'}`}>
                        <p>{section.content}</p>
                        {section.points && section.points.length > 0 && (
                          <ul className="space-y-1.5 pl-4 list-disc text-slate-700">
                            {section.points.map((pt, pIdx) => (
                              <li key={pIdx} className="leading-relaxed">
                                {pt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Protection Officer Contact Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">Data Protection Officer (DPO)</p>
                    <p>{notice.dpo.office} — {notice.dpo.address}</p>
                    <div className="flex flex-wrap gap-4 pt-1 font-mono text-[11px] text-slate-700">
                      <span><strong>Email:</strong> {notice.dpo.email}</span>
                      <span><strong>Tel:</strong> {notice.dpo.contact}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* External Full Policy Link */}
              <div className="text-center pt-1">
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e3a8a] hover:text-blue-800 transition-colors"
                >
                  <ExternalLink size={13} />
                  Read Full Official Data Privacy Policy Documentation
                </Link>
              </div>
            </div>

            {/* Footer with Consent Action Controls */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 sm:px-6 sm:py-5 flex-shrink-0 space-y-3">
              {/* Checkbox (Explicit, not checked by default) */}
              <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <input
                  id="privacy-consent-checkbox"
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded text-[#1e3a8a] focus:ring-[#1e3a8a] border-slate-300 cursor-pointer flex-shrink-0"
                />
                <label
                  htmlFor="privacy-consent-checkbox"
                  className="text-xs sm:text-sm text-slate-800 font-medium leading-snug cursor-pointer select-none"
                >
                  I have read and understood the Data Privacy Notice and voluntarily consent to the processing of my personal information as described in accordance with Republic Act No. 10173.
                </label>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  id="privacy-decline-btn"
                  onClick={handleDecline}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={16} className="text-slate-500" />
                  Decline
                </button>

                <button
                  type="button"
                  id="privacy-agree-btn"
                  onClick={handleAgree}
                  disabled={!hasAgreed || isSubmitting}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${
                    hasAgreed && !isSubmitting
                      ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white hover:opacity-95 cursor-pointer transform hover:-translate-y-0.5'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Recording Consent...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>I Agree and Continue</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PrivacyConsentModal;
