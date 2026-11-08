import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  CheckCircle,
  FileText,
  Mail,
  Phone,
  Building2,
  Clock,
  Printer,
  ChevronRight,
  UserCheck,
  Database,
  Share2,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicNavbar, PublicFooter } from '../../components/layout/PublicLayout';
import { privacyApi } from '../../services/api';
import type { PrivacyNoticeData } from '../../types';

export default function PrivacyPage() {
  const [notice, setNotice] = useState<PrivacyNoticeData | null>(null);

  useEffect(() => {
    privacyApi
      .getNotice()
      .then((res) => {
        if (res.data) setNotice(res.data);
      })
      .catch(() => {});
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#0d9488] text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="page-container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-teal-200 text-xs font-semibold mb-4 backdrop-blur-sm">
              <Shield size={14} className="text-teal-300" />
              Republic Act No. 10173 · Data Privacy Act of 2012
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight mb-4">
              Data Privacy Notice & Consent Policy
            </h1>

            <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl">
              Barangay 442, Zone 44, Sampaloc, Manila is dedicated to protecting your fundamental right to privacy while delivering streamlined, transparent barangay e-services through MASID.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-white/70">
              <span><strong>Version:</strong> {notice?.version || '1.0'}</span>
              <span>•</span>
              <span><strong>Last Updated:</strong> {notice?.lastUpdated || 'November 1, 2026'}</span>
              <span>•</span>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Policy</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="page-container max-w-4xl">
          {/* Official Commitment Banner */}
          <div className="card mb-8 border-l-4 border-l-[#1e3a8a]">
            <h2 className="text-lg font-bold text-slate-900 mb-2 font-display flex items-center gap-2">
              <Lock size={18} className="text-[#1e3a8a]" />
              Official Declaration of Privacy Protection
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              By using the MASID Barangay E-Services platform, you acknowledge that your personal information may be collected, processed, and stored for legitimate public administration and welfare delivery purposes in Barangay 442, Sampaloc, Manila.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your personal data will always be processed strictly in accordance with Republic Act No. 10173 (Data Privacy Act of 2012), its Implementing Rules and Regulations (IRR), and relevant issuances of the National Privacy Commission (NPC).
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6">
            {/* Section 1 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#1e3a8a] flex items-center justify-center font-bold text-sm">1</span>
                <h3 className="font-bold text-slate-900 text-lg">Purpose of Data Collection</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Personal information is collected and processed exclusively for legitimate barangay operations and social welfare service delivery, including:
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5">
                <li>Validating resident identity, address, and eligibility for assistance programs.</li>
                <li>Administering and scheduling financial payouts (e.g. Senior Citizen subsidies, 4Ps supplements, educational and medical assistance).</li>
                <li>Managing resource distribution queues for relief food packs, medicines, hygiene kits, and emergency equipment.</li>
                <li>Sending priority notifications, public health announcements, and community assembly alerts.</li>
                <li>Maintaining non-tamperable government audit trails for transparent public accountability.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">2</span>
                <h3 className="font-bold text-slate-900 text-lg">Personal Information Collected</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                We strictly limit data collection to information necessary for service delivery:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <strong>Personal Identity:</strong> Full legal name, date of birth, gender, and civil status.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <strong>Contact & Address:</strong> Street address within Barangay 442, email address, and phone number.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <strong>Beneficiary Category:</strong> Senior Citizen, PWD, Solo Parent, 4Ps, or Indigent classification.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <strong>Transaction Records:</strong> Payout disbursement logs, claim timestamps, and received item quantities.
                </div>
              </div>
            </div>

            {/* Section 3 & 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">3</span>
                  <h3 className="font-bold text-slate-900 text-base">Processing & Storage</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Data is processed electronically using relational databases featuring Write-Ahead Logging (WAL) transaction integrity. Systems are hosted in secure, isolated server environments with restricted access.
                </p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">4</span>
                  <h3 className="font-bold text-slate-900 text-base">Protection & Security</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We implement HTTPS/TLS 1.3 encryption, bcrypt password hashing, role-based access control (RBAC), and automated audit logs recording all data interactions.
                </p>
              </div>
            </div>

            {/* Section 5 & 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">5</span>
                  <h3 className="font-bold text-slate-900 text-base">Data Sharing & Disclosure</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Personal data is never sold or shared for marketing. Shared solely with verified government oversight bodies (e.g., DSWD, City of Manila, COA) under lawful assistance disbursement regulations.
                </p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">6</span>
                  <h3 className="font-bold text-slate-900 text-base">Data Retention</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Data is retained only as long as necessary for active service delivery or to satisfy statutory government audit mandates. Expired records are archived or anonymized.
                </p>
              </div>
            </div>

            {/* Section 7: User Rights */}
            <div className="card border-2 border-teal-100 bg-gradient-to-br from-white to-teal-50/20">
              <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                <span className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-sm">7</span>
                <h3 className="font-bold text-slate-900 text-lg">Your Rights under R.A. 10173</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                As a resident of Barangay 442 and a data subject under Philippine law, you are entitled to:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <strong>Right to be Informed:</strong> To understand how your data is collected and processed.
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <strong>Right to Access:</strong> To obtain a copy of your records held by the barangay.
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <strong>Right to Rectification:</strong> To correct inaccurate or outdated information.
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <strong>Right to Object:</strong> To decline processing where consent is the legal basis.
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <strong>Right to Erasure:</strong> To request removal of data processed unlawfully.
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <strong>Right to File a Complaint:</strong> Before the National Privacy Commission (NPC).
                </div>
              </div>
            </div>

            {/* Section 8: DPO Contact */}
            <div className="card bg-slate-900 text-white">
              <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Data Protection Officer (DPO) Contact</h3>
                  <p className="text-xs text-slate-400">Official Data Privacy Compliance Desk</p>
                </div>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong>Designated Officer:</strong> {notice?.dpo.title || 'Barangay 442 Data Protection Officer'}
                </p>
                <p>
                  <strong>Office:</strong> {notice?.dpo.office || 'Office of the Barangay Captain'} — Barangay 442 Hall, Zone 44, District IV, Sampaloc, Manila
                </p>
                <div className="flex flex-wrap gap-6 pt-2 font-mono text-xs text-teal-300">
                  <span><strong>Email:</strong> {notice?.dpo.email || 'dpo@barangay442.gov.ph'}</span>
                  <span><strong>Telephone:</strong> {notice?.dpo.contact || '+63 2 8XXX-XXXX'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="btn btn-outline">
              ← Return to MASID Home
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
