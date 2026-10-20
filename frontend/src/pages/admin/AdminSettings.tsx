import React, { useState, useEffect } from 'react';
import { Building2, Bell, Shield, Save, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { settingsApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Setting {
  id: number; settingKey: string; settingValue: string; description: string;
}

const settingLabels: Record<string, { label: string; section: string }> = {
  barangay_name: { label: 'Barangay Name', section: 'barangay' },
  zone: { label: 'Zone', section: 'barangay' },
  district_city: { label: 'District / City', section: 'barangay' },
  barangay_captain: { label: 'Barangay Captain', section: 'barangay' },
  contact_number: { label: 'Contact Number', section: 'barangay' },
  email_address: { label: 'Email Address', section: 'barangay' },
  office_hours: { label: 'Office Hours', section: 'barangay' },
  low_stock_alerts: { label: 'Low stock alerts', section: 'notifications' },
  new_beneficiary_notifications: { label: 'New beneficiary registration', section: 'notifications' },
  payout_reminders: { label: 'Payout reminders', section: 'notifications' },
  event_reminders: { label: 'Event reminders', section: 'notifications' },
  two_factor_auth: { label: 'Two-factor authentication', section: 'security' },
  session_timeout: { label: 'Session timeout', section: 'security' },
  audit_logging: { label: 'Audit logging', section: 'security' },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getAll();
      const data: Setting[] = res.data || [];
      setSettings(data);
      const values: Record<string, string> = {};
      data.forEach(s => { values[s.settingKey] = s.settingValue; });
      setFormValues(values);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load settings');
    } finally { setLoading(false); }
  };

  const handleChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Save all changed settings
      const promises = Object.entries(formValues).map(([key, value]) => {
        const original = settings.find(s => s.settingKey === key);
        if (original && original.settingValue !== value) {
          return settingsApi.update(key, value);
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      toast.success('Settings saved successfully');
      fetchSettings(); // Refresh
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-[#1e3a8a] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  // Group settings by section
  const barangaySettings = settings.filter(s => settingLabels[s.settingKey]?.section === 'barangay');
  const notificationSettings = settings.filter(s => settingLabels[s.settingKey]?.section === 'notifications');
  const securitySettings = settings.filter(s => settingLabels[s.settingKey]?.section === 'security');
  // For any unknown settings, show them in barangay section
  const unknownSettings = settings.filter(s => !settingLabels[s.settingKey]);

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
          <div className="flex flex-col gap-4">
            {barangaySettings.map(s => (
              <div key={s.settingKey} className="form-group">
                <label className="form-label">{settingLabels[s.settingKey]?.label || s.settingKey}</label>
                <input type="text" className="form-input" value={formValues[s.settingKey] || ''}
                  onChange={e => handleChange(s.settingKey, e.target.value)} />
              </div>
            ))}
            {unknownSettings.map(s => (
              <div key={s.settingKey} className="form-group">
                <label className="form-label">{s.settingKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
                <input type="text" className="form-input" value={formValues[s.settingKey] || ''}
                  onChange={e => handleChange(s.settingKey, e.target.value)} />
                {s.description && <span className="form-hint">{s.description}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        {notificationSettings.length > 0 && (
          <div className="card mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><Bell size={18} className="text-teal-600" /></div>
              <div><h2 className="font-bold text-gray-900">Notifications</h2><p className="text-xs text-gray-500">Configure system notification behavior</p></div>
            </div>
            <div className="flex flex-col gap-4">
              {notificationSettings.map(s => (
                <div key={s.settingKey} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{settingLabels[s.settingKey]?.label || s.settingKey}</p>
                    {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formValues[s.settingKey] === 'true' || formValues[s.settingKey] === '1'}
                      onChange={e => handleChange(s.settingKey, e.target.checked ? 'true' : 'false')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#14b8a6] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security */}
        {securitySettings.length > 0 && (
          <div className="card mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Shield size={18} className="text-red-600" /></div>
              <div><h2 className="font-bold text-gray-900">Security</h2><p className="text-xs text-gray-500">Security and authentication settings</p></div>
            </div>
            <div className="flex flex-col gap-4">
              {securitySettings.map(s => (
                <div key={s.settingKey} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{settingLabels[s.settingKey]?.label || s.settingKey}</p>
                    {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formValues[s.settingKey] === 'true' || formValues[s.settingKey] === '1'}
                      onChange={e => handleChange(s.settingKey, e.target.checked ? 'true' : 'false')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#14b8a6] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* If no settings from DB, show default static form */}
        {settings.length === 0 && (
          <>
            <div className="card mb-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Building2 size={18} className="text-blue-600" /></div>
                <div><h2 className="font-bold text-gray-900">Barangay Information</h2><p className="text-xs text-gray-500">Basic barangay details</p></div>
              </div>
              <p className="text-sm text-gray-500">No settings found in the database. Settings will appear here once configured.</p>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button id="save-settings-btn" className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 size={17} className="animate-spin" /> Saving...</> : <><Save size={17} /> Save Settings</>}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
