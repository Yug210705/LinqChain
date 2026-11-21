'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchDashboardStats,
  fetchAuditLog,
  DashboardStats,
  AuditLogEntry,
} from '@/services/admin-api';
import {
  Users,
  Building2,
  AlertTriangle,
  FileCheck,
  Database,
  Activity,
  SlidersHorizontal,
  Shield,
  ArrowRight,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Globe,
  Radio,
  Flame,
  Layers,
  Brain,
  Send,
  Zap,
  Check,
  AlertCircle,
  Megaphone,
} from 'lucide-react';
import { useAdminSupplyChainStore } from '@/stores/useAdminSupplyChainStore';
import { broadcastCrossPortalEvent } from '@/lib/cross-portal-sync';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAudit, setRecentAudit] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cross-portal supply chain store
  const {
    suppliers,
    plantLines,
    chokepoints,
    pendingPOs,
    bapiQueue,
    flushBapiQueue,
    alerts,
    broadcastAlert,
    dismissAlert,
    federatePortalClearance,
    auditTrail,
  } = useAdminSupplyChainStore();

  // Alert modal state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTarget, setAlertTarget] = useState<'ALL' | 'OPERATOR' | 'SUPPLIER' | 'MANUFACTURER'>('ALL');
  const [alertSeverity, setAlertSeverity] = useState<'INFO' | 'WARNING' | 'CRITICAL_AOG'>('WARNING');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [statsData, auditData] = await Promise.allSettled([
        fetchDashboardStats(),
        fetchAuditLog({ limit: 10 }),
      ]);

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      } else {
        // Fallback default state
        setStats({
          total_users: 18,
          total_admins: 3,
          total_platform_users: 15,
          active_orgs: 4,
          active_disruptions: 2,
          pending_approvals: pendingPOs.length,
          system_health: 'healthy',
          db_connected: true,
          db_latency_ms: 12,
        });
      }

      if (auditData.status === 'fulfilled' && auditData.value?.items) {
        setRecentAudit(auditData.value.items);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pendingPOs.length]);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim()) return;

    broadcastAlert({
      target: alertTarget,
      severity: alertSeverity,
      title: alertTitle,
      message: alertMsg || 'Mandatory operational compliance directive from Executive Admin.',
      created_by: 'Chief Supply Chain Officer (Admin)',
    });

    broadcastCrossPortalEvent(
      'DISRUPTION_REPORTED',
      'ADMIN',
      {
        entityId: 'ADMIN-DIRECTIVE',
        severity: alertSeverity === 'CRITICAL_AOG' ? 1 : 0.5,
        type: 'ADMIN_BROADCAST',
        description: alertTitle,
      }
    );

    setAlertSuccess(true);
    setAlertTitle('');
    setAlertMsg('');
    setTimeout(() => {
      setAlertSuccess(false);
      setShowAlertModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Banner: Status + Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stats?.system_health === 'healthy' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${stats?.system_health === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
              />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-neutral-200">
              System Health:{' '}
              <span
                className={
                  stats?.system_health === 'healthy'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }
              >
                {stats?.system_health?.toUpperCase() || 'OPERATIONAL'}
              </span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:border-neutral-700 hidden sm:block" />

          {/* Database Connectivity */}
          <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-neutral-300">
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>Database:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected ({stats?.db_latency_ms || 12}ms)
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:border-neutral-700 hidden sm:block" />

          {/* Global Network Resilience Index */}
          <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-neutral-300">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Network Resilience:</span>
            <span className="font-bold text-slate-900 dark:text-neutral-100 font-mono">
              94.2%
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold">(157 nodes synced)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlertModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Broadcast Alert</span>
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Global Active Alerts Strip (if any) */}
      {alerts.filter((a) => a.active).length > 0 && (
        <div className="space-y-2">
          {alerts.filter((a) => a.active).map((al) => (
            <div
              key={al.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${al.severity === 'CRITICAL_AOG'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
                <div>
                  <span className="font-bold uppercase tracking-wider mr-2">
                    [{al.target} DIRECTIVE]
                  </span>
                  <span className="font-semibold">{al.title}:</span>
                  <span className="ml-1 opacity-90">{al.message}</span>
                </div>
              </div>
              <button
                onClick={() => dismissAlert(al.id)}
                className="px-2 py-0.5 rounded text-[10px] font-bold border border-current hover:opacity-80 transition-opacity shrink-0"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PORTAL FEDERATION CONTROLS (Operator, Supplier, Manufacturer) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              Cross-Portal Federation & Live Telemetry
            </h2>
            <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">
              Instant credentialed single-sign-on launch into all 3 operational dashboards with unified state.
            </p>
          </div>
          <Link
            href="/admin/portals"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Federation Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Operator Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  COGNITIVE OPERATOR
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100 mt-2">
                Command Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                Real-time topological disruption detection, AI scenario simulations, and automated recovery paths.
              </p>
              <div className="mt-3 py-2 px-3 rounded-lg bg-slate-50 dark:bg-neutral-900 text-xs font-mono flex justify-between">
                <span className="text-slate-500">Active Reroutes:</span>
                <span className="font-bold text-slate-900 dark:text-neutral-100">3 Optimized</span>
              </div>
            </div>
            <Link
              href="/command-center"
              onClick={() => federatePortalClearance('OPERATOR')}
              className="mt-4 w-full py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>Launch Operator Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Supplier Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  TIER-1 SUPPLIER
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100 mt-2">
                Supplier Operations Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                Purchase order tracking, dispatch acknowledgement, and maritime freight tracking.
              </p>
              <div className="mt-3 py-2 px-3 rounded-lg bg-slate-50 dark:bg-neutral-900 text-xs font-mono flex justify-between">
                <span className="text-slate-500">Tier Governance:</span>
                <span className="font-bold text-slate-900 dark:text-neutral-100">
                  {suppliers.filter((s) => s.status === 'ACTIVE').length} / {suppliers.length} Active
                </span>
              </div>
            </div>
            <Link
              href="/supplier"
              onClick={() => federatePortalClearance('SUPPLIER')}
              className="mt-4 w-full py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>Launch Supplier Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Manufacturer Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  ASSEMBLY PLANT
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100 mt-2">
                Plant Lines & Work Orders
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                Line starvation prevention, OEE target overrides, and component buffer monitoring.
              </p>
              <div className="mt-3 py-2 px-3 rounded-lg bg-slate-50 dark:bg-neutral-900 text-xs font-mono flex justify-between">
                <span className="text-slate-500">Assembly Lines:</span>
                <span className="font-bold text-slate-900 dark:text-neutral-100">
                  {plantLines.filter((l) => l.status === 'RUNNING').length} / {plantLines.length} Running
                </span>
              </div>
            </div>
            <Link
              href="/manufacturer"
              onClick={() => federatePortalClearance('MANUFACTURER')}
              className="mt-4 w-full py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>Launch Plant Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK COMMAND CENTER SHORTCUTS */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
          Supply Chain Admin Super-Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Link
            href="/admin/supply-chain"
            className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] hover:border-blue-500/40 hover:bg-slate-50/50 dark:hover:bg-neutral-800/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <Globe className="w-4 h-4 text-blue-500" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-neutral-100 mt-2">
              Supply Chain Tower
            </p>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Chokepoints, buffers & Scope 3 ESG
            </p>
          </Link>

          <Link
            href="/admin/portals"
            className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] hover:border-emerald-500/40 hover:bg-slate-50/50 dark:hover:bg-neutral-800/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-neutral-100 mt-2">
              Portal Governance
            </p>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Supplier freezes & Dual-custody POs
            </p>
          </Link>

          <Link
            href="/admin/chaos"
            className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] hover:border-rose-500/40 hover:bg-slate-50/50 dark:hover:bg-neutral-800/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <Flame className="w-4 h-4 text-rose-500" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-neutral-100 mt-2">
              Chaos Switchboard
            </p>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              1,000 Monte-Carlo disruptions
            </p>
          </Link>

          <Link
            href="/admin/sap-mesh"
            className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] hover:border-purple-500/40 hover:bg-slate-50/50 dark:hover:bg-neutral-800/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <Layers className="w-4 h-4 text-purple-500" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-neutral-100 mt-2">
              SAP Event Mesh
            </p>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Outbound BAPI RFC queue flush
            </p>
          </Link>

          <Link
            href="/admin/ai-governance"
            className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] hover:border-blue-500/40 hover:bg-slate-50/50 dark:hover:bg-neutral-800/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <Brain className="w-4 h-4 text-blue-500" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-neutral-100 mt-2">
              AI Guardrails
            </p>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Autonomous spending & delay limits
            </p>
          </Link>
        </div>
      </div>

      {/* Grid of Key Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/users"
          className="group bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-amber-500/50 p-5 rounded-xl shadow-xs transition-all relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                Total Users
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                {stats?.total_users ?? 18}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Users className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-3 font-medium">
            {stats?.total_admins ?? 3} Admins · {stats?.total_platform_users ?? 15} Platform
          </p>
        </Link>

        <Link
          href="/admin/organizations"
          className="group bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-amber-500/50 p-5 rounded-xl shadow-xs transition-all relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                Enterprise Tenants
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                {stats?.active_orgs ?? 4}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Building2 className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-3 font-medium">
            Active supply chain tenants
          </p>
        </Link>

        <Link
          href="/admin/chaos"
          className="group bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-amber-500/50 p-5 rounded-xl shadow-xs transition-all relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                Active Disruptions
              </p>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5">
                {stats?.active_disruptions ?? 2}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-3 font-medium">
            Port Beta & Supplier Gamma
          </p>
        </Link>

        <Link
          href="/admin/portals"
          className="group bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-amber-500/50 p-5 rounded-xl shadow-xs transition-all relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                Pending Approvals
              </p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5">
                {pendingPOs.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FileCheck className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-3 font-medium">
            High-value purchase orders
          </p>
        </Link>
      </div>

      {/* Unified Cross-Portal Traceability & Administrative Audit Trail */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
              Cross-Portal Unified Audit Trail
            </h3>
          </div>
          <Link
            href="/admin/audit"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1 transition-colors"
          >
            <span>Full System Log</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-neutral-800 text-xs">
          {auditTrail.slice(0, 6).map((evt) => (
            <div
              key={evt.id}
              className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.severity === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : evt.severity === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    }`}
                >
                  {evt.source_portal}
                </span>
                <span className="font-semibold text-slate-900 dark:text-neutral-100 font-mono">
                  {evt.event_type}
                </span>
                <span className="text-slate-600 dark:text-neutral-400">
                  {evt.details}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-neutral-500 shrink-0 font-mono">
                <span>{evt.actor}</span>
                <span>•</span>
                <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">
                  Broadcast Global Alert
                </h3>
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Target Destination
                </label>
                <select
                  value={alertTarget}
                  onChange={(e) => setAlertTarget(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-slate-800 dark:text-neutral-200"
                >
                  <option value="ALL">All Portals (Global Emergency Directive)</option>
                  <option value="OPERATOR">Operator Command Center Only</option>
                  <option value="SUPPLIER">Tier-1 & Tier-2 Suppliers Only</option>
                  <option value="MANUFACTURER">Plant Managers & Line Supervisors Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Severity Level
                </label>
                <select
                  value={alertSeverity}
                  onChange={(e) => setAlertSeverity(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-slate-800 dark:text-neutral-200"
                >
                  <option value="INFO">Informational Advisory</option>
                  <option value="WARNING">Operational Warning</option>
                  <option value="CRITICAL_AOG">CRITICAL: Aircraft on Ground (AOG) / Line Stop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Directive Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Typhoon Warning: Divert Shanghai Inbound Freight"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-slate-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Detailed Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Specific actions required by portal operators..."
                  value={alertMsg}
                  onChange={(e) => setAlertMsg(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-slate-800 dark:text-neutral-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast Immediately
                </button>
              </div>

              {alertSuccess && (
                <p className="text-xs text-emerald-500 font-semibold text-center">
                  Alert dispatched to all selected portal sessions!
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
