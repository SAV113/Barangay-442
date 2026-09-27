import React from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle, Wallet, Package, Users, FileText, Shield, TrendingUp, MapPin, Phone, Mail, Clock, Building2 } from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../../components/layout/PublicLayout';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="py-16 lg:py-24" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0d9488 100%)' }}>
        <div className="page-container text-center">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white font-display mb-4">About MASID</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Monitoring and Administration System for Integrated Delivery — a comprehensive Barangay E-Services platform for Barangay 442, Zone 44, Sampaloc, Manila.
          </p>
        </div>
      </section>

      {/* What is MASID */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 font-display mb-5">What is MASID?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>MASID</strong> is an integrated Barangay E-Services Management System designed to centralize and streamline the delivery of barangay services for the residents of <strong>Barangay 442, Zone 44, Sampaloc, Manila</strong>.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              The system connects barangay administrators, staff, and residents through one unified platform — improving efficiency, transparency, accessibility, and accountability in managing payouts, resources, events, and community information.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: TrendingUp, label: 'Efficiency', desc: 'Streamlined processes reduce paperwork and manual processing time for barangay staff.' },
                { icon: Shield, label: 'Transparency', desc: 'Complete audit trail of all transactions and actions ensures public accountability.' },
                { icon: Users, label: 'Accessibility', desc: 'Digital services available online so residents can access information anytime, anywhere.' },
                { icon: FileText, label: 'Record Management', desc: 'Organized digital records for beneficiaries, resources, payouts, and events.' },
              ].map(item => (
                <div key={item.label} className="card card-compact">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-[#1e3a8a]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{item.label}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-gray-50">
        <div className="page-container">
          <div className="section-header">
            <div className="section-tag"><Star size={14} />Key Features</div>
            <h2 className="section-title">System Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Wallet, title: 'Payout Management', desc: 'Manage payout programs, schedule distributions, record transactions, and generate payout reports.', color: 'bg-blue-50', iconColor: 'text-blue-600' },
              { icon: Package, title: 'Resource Distribution', desc: 'Track resource inventory, record distributions to beneficiaries, and automatically update stock levels.', color: 'bg-teal-50', iconColor: 'text-teal-600' },
              { icon: Users, title: 'Community Information', desc: 'Publish announcements, manage events, and keep residents informed about barangay activities.', color: 'bg-violet-50', iconColor: 'text-violet-600' },
            ].map(f => (
              <div key={f.title} className="card text-center">
                <div className={`w-14 h-14 rounded-xl ${f.color} flex items-center justify-center mx-auto mb-4`}>
                  <f.icon size={26} className={f.iconColor} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barangay Info */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 font-display mb-5 text-center">Barangay 442 Information</h2>
            <div className="card">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] flex items-center justify-center flex-shrink-0">
                  <Building2 size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-xl font-display">Barangay 442</h3>
                  <p className="text-gray-500 text-sm">Zone 44, Sampaloc, Manila</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3"><MapPin size={16} className="text-teal-500 flex-shrink-0" /><div><p className="text-xs text-gray-400">Address</p><p className="text-sm font-medium text-gray-800">Barangay 442, Zone 44, Sampaloc, Manila</p></div></div>
                <div className="flex items-center gap-3"><Phone size={16} className="text-teal-500 flex-shrink-0" /><div><p className="text-xs text-gray-400">Contact</p><p className="text-sm font-medium text-gray-800">+63 2 8XXX-XXXX</p></div></div>
                <div className="flex items-center gap-3"><Mail size={16} className="text-teal-500 flex-shrink-0" /><div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium text-gray-800">barangay442@gmail.com</p></div></div>
                <div className="flex items-center gap-3"><Clock size={16} className="text-teal-500 flex-shrink-0" /><div><p className="text-xs text-gray-400">Office Hours</p><p className="text-sm font-medium text-gray-800">Mon – Fri, 8:00 AM – 5:00 PM</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
