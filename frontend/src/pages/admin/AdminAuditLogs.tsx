import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShieldCheck, Clock } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { auditLogsApi } from '../../services/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface AuditLog {
  id: number; userId: number; userName: string; action: string; module: string;
  recordId?: number; details: string; ipAddress?: string; createdAt: string;
}

const actionBadge: Record<string, string> = {
  CREATE: 'badge-success', UPDATE: 'badge-info', DELETE: 'badge-error',
  PUBLISH: 'badge-primary', UNPUBLISH: 'badge-warning', LOGIN: 'badge-gray',
  LOGOUT: 'badge-gray', ARCHIVE: 'badge-warning',
};

const moduleLabels: Record<string, string> = {
  beneficiaries: 'Beneficiaries', payout_programs: 'Payout Programs',
  payout_schedules: 'Payout Schedules', payout_transactions: 'Payout Transactions',
  resources: 'Resources', resource_distributions: 'Distributions',
  announcements: 'Announcements', events: 'Events', auth: 'Authentication',
  users: 'Users', settings: 'Settings',
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { limit: 100 };
      if (moduleFilter) params.module = moduleFilter;
      if (actionFilter) params.action = actionFilter;
      if (search) params.search = search;
      const res = await auditLogsApi.getAll(params);
      setLogs(res.data.data || res.data || []);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load audit logs'); }
    finally { setLoading(false); }
  }, [search, moduleFilter, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter(l => {
    const sMatch = !search || l.details?.toLowerCase().includes(search.toLowerCase()) || l.userName?.toLowerCase().includes(search.toLowerCase());
    return sMatch;
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 font-display">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Complete system activity trail — {filtered.length} records</p>
        </div>

        {/* Info Banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 mb-6">
          <ShieldCheck size={18} className="text-blue-500 flex-shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">Transparency & Accountability.</span> All major system actions are automatically recorded for audit purposes.
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="audit-search" type="search" placeholder="Search by user or details..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
            </div>
            <select id="audit-module-filter" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="form-input w-full sm:w-48">
              <option value="">All Modules</option>
              {Object.entries(moduleLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
            </select>
            <select id="audit-action-filter" value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="form-input w-full sm:w-36">
              <option value="">All Actions</option>
              <option value="CREATE">Create</option><option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option><option value="PUBLISH">Publish</option><option value="LOGIN">Login</option>
            </select>
          </div>
        </div>

        {/* Timeline View */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-[#1e3a8a] animate-spin" /></div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(log => (
              <div key={log.id} id={`audit-log-${log.id}`} className="card card-compact hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(log.userName || 'S').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{log.userName || 'System'}</span>
                      <span className={`badge ${actionBadge[log.action] ?? 'badge-gray'} text-xs`}>{log.action}</span>
                      <span className="chip text-xs">{moduleLabels[log.module] ?? log.module}</span>
                    </div>
                    <p className="text-sm text-gray-600">{log.details}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                      <Clock size={11} />
                      {format(parseISO(log.createdAt), 'MMM d, yyyy h:mm a')}
                      {log.recordId && <span className="ml-3">Record #{log.recordId}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="card"><div className="empty-state"><div className="empty-state-icon"><ShieldCheck size={28} /></div><p className="font-semibold text-gray-500">No audit logs found</p><p className="text-sm text-gray-400">Try adjusting your filters.</p></div></div>
        )}
      </div>
    </AdminLayout>
  );
}
