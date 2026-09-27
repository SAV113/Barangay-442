import React from 'react';
import { Settings, Building2, Bell, Shield, Save } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 font-display">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">System configuration for MASID E-Services</p>
        </div>

        {/* Barangay Information */}
        <div className="card mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Building2 size={18} className="text-blue-600" /></div>
            <div><h2 className="font-bold text-gray-900">Barangay Information</h2><p className="text-xs text-gray-500">Basic barangay details displayed on the portal</p></div>
          </div>

          <form id="settings-form" className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Barangay Name</label>
                <input type="text" className="form-input" defaultValue="Barangay 442" />
              </div>
              <div className="form-group">
                <label className="form-label">Zone</label>
                <input type="text" className="form-input" defaultValue="Zone 44" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">District / City</label>
              <input type="text" className="form-input" defaultValue="Sampaloc, Manila" />
            </div>
            <div className="form-group">
              <label className="form-label">Barangay Captain</label>
              <input type="text" className="form-input" defaultValue="Hon. [Barangay Captain Name]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input type="text" className="form-input" defaultValue="+63 2 8XXX-XXXX" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" defaultValue="barangay442@gmail.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Office Hours</label>
              <input type="text" className="form-input" defaultValue="Monday to Friday, 8:00 AM – 5:00 PM" />
            </div>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="card mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><Bell size={18} className="text-teal-600" /></div>
            <div><h2 className="font-bold text-gray-900">Notifications</h2><p className="text-xs text-gray-500">Configure system notification behavior</p></div>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { label: 'Low stock alerts', desc: 'Notify admins when resources fall below threshold', checked: true },
              { label: 'New beneficiary registration', desc: 'Notify when a new beneficiary is registered', checked: true },
              { label: 'Payout reminders', desc: 'Send reminders before scheduled payouts', checked: true },
              { label: 'Event reminders', desc: 'Send reminders before upcoming events', checked: false },
            ].map(setting => (
              <div key={setting.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{setting.label}</p>
                  <p className="text-xs text-gray-500">{setting.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={setting.checked} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#14b8a6] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="card mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Shield size={18} className="text-red-600" /></div>
            <div><h2 className="font-bold text-gray-900">Security</h2><p className="text-xs text-gray-500">Security and authentication settings</p></div>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Two-factor authentication', desc: 'Require 2FA for admin accounts', checked: false },
              { label: 'Session timeout', desc: 'Automatically log out after inactivity', checked: true },
              { label: 'Audit logging', desc: 'Log all system actions for accountability', checked: true },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={s.checked} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#14b8a6] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button id="save-settings-btn" className="btn btn-primary btn-lg">
            <Save size={17} /> Save Settings
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
