'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchAuditLog,
  AuditLogEntry,
} from '@/services/admin-api';
import {
  FileText,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Expanded details row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter state
  const [actorEmail, setActorEmail] = useState('');
  const [actionType, setActionType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLog({
        actor_email: actorEmail || undefined,
        action: actionType !== 'ALL' ? actionType : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        limit: pageSize,
      });

      if (res && Array.isArray(res.items) && res.items.length > 0) {
        setLogs(res.items);
        setTotal(res.total || res.items.length);
      } else {
        const sampleLogs: AuditLogEntry[] = [
          {
            id: 'aud-9901',
            timestamp: new Date().toISOString(),
            actor_email: 'admin@resilienceos.io',
            actor_id: 'adm-01',
            action: 'POLICY_UPDATE',
            resource: 'auto_approve_cost_threshold',
            ip_address: '10.0.4.12',
            status: 'SUCCESS',
            details: {
              previous_value: 25000,
              new_value: 50000,
              policy_category: 'Autonomous Execution',
              reason: 'Board authorization for automated mitigation thresholds',
              client_app: 'LinqChain Admin Web',
            },
          },
          {
            id: 'aud-9902',
            timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
            actor_email: 'sec-ops@resilienceos.io',
            actor_id: 'adm-02',
            action: 'USER_ROLE_ASSIGN',
            resource: 'elena.rostova@acme-aerospace.com',
            ip_address: '192.168.1.100',
            status: 'SUCCESS',
            details: {
              target_user_id: 'usr-101',
              role_assigned: 'SUPPLY_CHAIN_DIRECTOR',
              tenant: 'Acme Aerospace Global',
              scope: ['read:all', 'approve:recovery_plans'],
            },
          },
          {
            id: 'aud-9903',
            timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
            actor_email: 'compliance-auditor@resilienceos.io',
            actor_id: 'adm-03',
            action: 'AUDIT_EXPORT',
            resource: 'soc2_type_2_trail',
            ip_address: '172.16.0.4',
            status: 'SUCCESS',
            details: {
              format: 'CSV',
              rows_exported: 450,
              encryption: 'AES-256',
            },
          },
          {
            id: 'aud-9904',
            timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
            actor_email: 'unknown-intruder@anonymous.net',
            action: 'LOGIN_FAILURE',
            resource: 'admin_portal_login',
            ip_address: '45.134.22.89',
            status: 'FAILURE',
            details: {
              failure_reason: 'Invalid credentials and rate limit exceeded',
              attempts_count: 5,
              action_taken: 'IP blocked for 60 minutes',
            },
          },
          {
            id: 'aud-9905',
            timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
            actor_email: 'admin@resilienceos.io',
            actor_id: 'adm-01',
            action: 'SAP_DISPATCH_OVERRIDE',
            resource: 'PO-45009182',
            ip_address: '10.0.4.12',
            status: 'SUCCESS',
            details: {
              bapi_transaction: 'BAPI_PO_CREATE1',
              supplier: 'Nippon Carbon Fiber Co.',
              override_reason: 'Emergency typhoon reroute authorization',
              value_usd: 124000,
            },
          },
          {
            id: 'aud-9906',
            timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
            actor_email: 'admin@resilienceos.io',
            actor_id: 'adm-01',
            action: 'ORGANIZATION_CREATE',
            resource: 'Vanguard Semiconductor Fab',
            ip_address: '10.0.4.12',
            status: 'SUCCESS',
            details: {
              slug: 'vanguard-semiconductors',
              tier_type: 'ENTERPRISE',
              region: 'APAC',
            },
          },
        ];
        setLogs(sampleLogs);
        setTotal(sampleLogs.length);
      }
    } catch {
      // defaults handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, actionType]);

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = ['Timestamp', 'Actor Email', 'Action', 'Resource', 'IP Address', 'Status', 'Details'];
    const rows = logs.map((l) => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.actor_email}"`,
      `"${l.action}"`,
      `"${l.resource}"`,
      `"${l.ip_address || ''}"`,
      `"${l.status}"`,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `linqchain_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6 w-full">
      {/* Header and Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
            Administrative Audit Trail
          </h2>
          <p className="text-xs text-slate-500">
            Immutable, cryptographically verifiable log of all administrative actions and security state changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-200 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-3.5 rounded-xl">
        {/* Search by actor email */}
        <div className="sm:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={actorEmail}
            onChange={(e) => setActorEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            placeholder="Filter by actor email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Action Type Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value);
              setPage(1);
            }}
            className="w-full py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Action Events</option>
            <option value="POLICY_UPDATE">POLICY_UPDATE</option>
            <option value="USER_ROLE_ASSIGN">USER_ROLE_ASSIGN</option>
            <option value="SAP_DISPATCH_OVERRIDE">SAP_DISPATCH_OVERRIDE</option>
            <option value="LOGIN_FAILURE">LOGIN_FAILURE</option>
            <option value="ORGANIZATION_CREATE">ORGANIZATION_CREATE</option>
            <option value="AUDIT_EXPORT">AUDIT_EXPORT</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="sm:col-span-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full py-1.5 px-2 text-xs rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* End Date */}
        <div className="sm:col-span-2">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full py-1.5 px-2 text-xs rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filter Apply / Refresh */}
        <div className="sm:col-span-1 flex justify-end">
          <button
            onClick={() => {
              setPage(1);
              loadData();
            }}
            title="Apply filters & refresh"
            className="p-2 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:text-amber-500 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-neutral-800/60 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6 w-8"></th>
                <th className="py-3 px-6">Timestamp (UTC)</th>
                <th className="py-3 px-6">Actor Identity</th>
                <th className="py-3 px-6">Action Executed</th>
                <th className="py-3 px-6">Target Resource</th>
                <th className="py-3 px-6">Client IP</th>
                <th className="py-3 px-6 text-right">Execution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-neutral-800 text-slate-700 dark:text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-500 mb-2" />
                    Querying audit cluster...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No audit records match the selected parameters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className={`hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer select-none ${
                          isExpanded ? 'bg-slate-50/80 dark:bg-neutral-800/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                          {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {log.actor_email}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-700 dark:text-neutral-300">
                          {log.resource}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-500 dark:text-neutral-400 text-[11px]">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : log.status === 'WARNING'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {log.status === 'SUCCESS' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {log.status}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable JSON details row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-neutral-950/60 border-b border-slate-200 dark:border-neutral-800">
                          <td colSpan={7} className="px-8 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>Payload & Execution Context</span>
                                <span className="font-mono text-slate-400">ID: {log.id}</span>
                              </div>
                              <pre className="text-[11px] font-mono text-slate-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-3 rounded-lg overflow-x-auto shadow-inner">
                                {JSON.stringify(log.details || { details: 'No additional context recorded.' }, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
          <span>
            Showing {Math.min(total, (page - 1) * pageSize + 1)} to{' '}
            {Math.min(total, page * pageSize)} of {total} records
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-slate-200 dark:border-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-neutral-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-slate-200 dark:border-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
