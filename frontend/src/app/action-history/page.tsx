'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity, AlertTriangle, CheckCircle2, Zap, ChevronDown, ChevronRight,
  RefreshCw, Inbox
} from 'lucide-react';
import { fetchAuditRuns, fetchDisruptions, AuditRun } from '@/services/api';

/* ---------- helpers ---------- */

function timeAgo(iso?: string | null): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatFull(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatMoney(v?: number | null): string {
  if (v == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

/* ---------- event model ---------- */

type AuditEvent =
  | { kind: 'pipeline'; ts: string; run: AuditRun }
  | { kind: 'simulated'; ts: string; disruption: any }
  | { kind: 'resolved'; ts: string; disruption: any };

function buildEvents(runs: AuditRun[], disruptions: { active: any[]; history: any[] }): AuditEvent[] {
  const events: AuditEvent[] = [];

  for (const run of runs) {
    if (!run.timestamp) continue;
    events.push({ kind: 'pipeline', ts: run.timestamp, run });
  }

  const all = [...(disruptions.active ?? []), ...(disruptions.history ?? [])];
  for (const d of all) {
    if (d.created_at) events.push({ kind: 'simulated', ts: d.created_at, disruption: d });
    if (d.resolved_at) events.push({ kind: 'resolved', ts: d.resolved_at, disruption: d });
  }

  return events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
}

type Filter = 'all' | 'disruptions' | 'pipelines';

/* ---------- page ---------- */

export default function ActionHistoryPage() {
  const [runs, setRuns] = useState<AuditRun[]>([]);
  const [disruptions, setDisruptions] = useState<{ active: any[]; history: any[] }>({ active: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [r, d] = await Promise.all([fetchAuditRuns(), fetchDisruptions()]);
      setRuns(r);
      setDisruptions({ active: d.active ?? [], history: d.history ?? [] });
      setError(null);
      setLastSync(new Date().toISOString());
    } catch (e: any) {
      setError(e?.message || 'Failed to load action history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
    const id = setInterval(() => load(false), 30000);
    return () => clearInterval(id);
  }, [load]);

  const events = useMemo(() => buildEvents(runs, disruptions), [runs, disruptions]);
  const filtered = useMemo(
    () => events.filter((e) =>
      filter === 'all' ? true : filter === 'pipelines' ? e.kind === 'pipeline' : e.kind !== 'pipeline'
    ),
    [events, filter]
  );

  const stats = useMemo(() => {
    const pipelines = runs.length;
    const simulated = disruptions.active.length + disruptions.history.length;
    const resolved = disruptions.history.length;
    return [
      { label: 'Total Actions', value: events.length, icon: Activity, color: 'text-slate-400 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
      { label: 'Pipeline Runs', value: pipelines, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
      { label: 'Disruptions Simulated', value: simulated, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40' },
      { label: 'Disruptions Resolved', value: resolved, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    ];
  }, [events.length, runs.length, disruptions]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All Activity' },
    { key: 'disruptions', label: 'Disruptions' },
    { key: 'pipelines', label: 'Recovery Pipelines' },
  ];

  return (
    <div className="flex flex-col font-sans h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-[13px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
            <Link href="/command-center" className="hover:text-slate-900 dark:hover:text-white transition-colors">Command Center</Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <Link href="/sap-actions" className="hover:text-slate-900 dark:hover:text-white transition-colors">SAP Actions</Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-900 dark:text-slate-100">Action History</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Action History</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            Audit trail of disruption simulations, recovery pipelines, and system actions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {lastSync && (
            <span className="flex items-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Synced {timeAgo(lastSync)}
            </span>
          )}
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[13px] font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="shrink-0 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center shadow-sm mt-6">
          <AlertTriangle className="w-5 h-5 mr-3 shrink-0" />
          <div>
            <p className="text-sm font-medium">Unable to load action history</p>
            <p className="text-sm opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 shrink-0">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 flex items-center">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3 ${s.bg}`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{s.value}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex items-center space-x-2 mt-6 shrink-0">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors border ${
              filter === f.key
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
        {filtered.length > 0 && (
          <span className="ml-auto text-[11.5px] font-medium text-slate-400 dark:text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'action' : 'actions'}
          </span>
        )}
      </div>

      {/* TIMELINE */}
      <div className="flex-1 overflow-y-auto mt-5 pr-1 custom-scrollbar">
        {loading && !runs.length && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <Inbox className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">No actions recorded yet</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 max-w-[320px]">
              Run a disruption simulation or a recovery pipeline — they'll appear here automatically.
            </p>
            <Link
              href="/sap-actions"
              className="mt-4 flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-[13px] font-medium transition-colors shadow-sm"
            >
              <Activity className="w-4 h-4 mr-2" /> Go to SAP Actions
            </Link>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="space-y-2.5">
            {filtered.map((ev, i) => (
              <TimelineRow
                key={ev.kind === 'pipeline' ? ev.run.run_id : `${ev.kind}-${ev.disruption.simulation_id}-${ev.ts}`}
                event={ev}
                isLast={i === filtered.length - 1}
                expanded={expanded}
                onToggle={setExpanded}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- row ---------- */

function TimelineRow({
  event, isLast, expanded, onToggle,
}: {
  event: AuditEvent;
  isLast: boolean;
  expanded: string | null;
  onToggle: (id: string | null) => void;
}) {
  if (event.kind === 'pipeline') {
    const run = event.run;
    const rec = run.recommended_plan ?? {};
    const isOpen = expanded === run.run_id;
    const badges = [
      { label: 'Deterministic', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
      ...(run.guardrail_stripped ? [{ label: 'Guardrails Stripped', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' }] : []),
      ...(run.agentic_retries && run.agentic_retries > 0 ? [{ label: `${run.agentic_retries} Retr${run.agentic_retries > 1 ? 'ies' : 'y'}`, color: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400' }] : []),
    ];

    return (
      <div className="flex relative">
        {!isLast && <div className="absolute top-9 left-[15px] w-px h-full bg-slate-100 dark:bg-slate-800" />}
        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center shrink-0 z-10 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-purple-500" />
        </div>
        <div className="ml-3 flex-1 min-w-0 pb-2.5">
          <div className={`bg-white dark:bg-[#111827] border ${isOpen ? 'border-purple-300/70 dark:border-purple-700/60' : 'border-slate-200 dark:border-slate-800'} rounded-xl shadow-sm overflow-hidden`}>
            <button onClick={() => onToggle(isOpen ? null : run.run_id)} className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
              <div className="flex items-center min-w-0">
                {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />}
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Recovery pipeline · {rec.strategy || 'Recovery strategy'} — MAT-{run.material_id}
                  </p>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {run.run_id} · {formatFull(run.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex items-center ml-3 shrink-0 space-x-2">
                {badges.map((b) => (
                  <span key={b.label} className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-[10.5px] font-bold ${b.color}`}>{b.label}</span>
                ))}
                <span className="text-[11px] text-slate-400 font-medium">{timeAgo(run.timestamp)}</span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <KV label="Material" value={`MAT-${run.material_id}`} />
                  <KV label="Supplier" value={rec.supplier_id || '—'} />
                  <KV label="Recovery cost" value={formatMoney(rec.total_cost)} />
                  <KV label="Max delay" value={rec.max_delay_days != null ? `${rec.max_delay_days} days` : '—'} />
                </div>

                {run.llm_explanation && (
                  <div className="mt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Pipeline Explanation</p>
                    <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg p-3">
                      {run.llm_explanation}
                    </p>
                  </div>
                )}

                {run.sap_action_result && (
                  <div className="mt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">SAP Action Result</p>
                    <pre className="text-[11.5px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg p-3 overflow-x-auto max-h-48 custom-scrollbar">
                      {JSON.stringify(run.sap_action_result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // disruption events (simulated / resolved)
  const d = event.disruption;
  const isResolved = event.kind === 'resolved';
  const Icon = isResolved ? CheckCircle2 : AlertTriangle;
  const color = isResolved ? 'text-emerald-500' : 'text-red-500';
  const iconBg = isResolved
    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50'
    : 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50';
  const title = isResolved
    ? `Disruption resolved · ${d.affected_entity_id || d.simulation_id}`
    : `Disruption simulated · ${d.affected_entity_id || d.simulation_id} (${d.disruption_type || 'Event'})`;

  return (
    <div className="flex relative">
      {!isLast && <div className="absolute top-9 left-[15px] w-px h-full bg-slate-100 dark:bg-slate-800" />}
      <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0 z-10 shadow-sm`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="ml-3 flex-1 min-w-0 pb-2.5">
        <div className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm px-4 py-3 flex items-center justify-between ${isResolved ? 'opacity-95' : ''}`}>
          <div className="min-w-0">
            <Link
              href={`/disruptions/${d.simulation_id}`}
              className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
            >
              {title}
            </Link>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
              {d.severity ? `Severity: ${d.severity}` : ''}{d.severity && d.duration_days ? ' · ' : ''}
              {d.duration_days ? `Impact window: ${d.duration_days} days` : ''}
              {' · '}{formatFull(event.ts)}
            </p>
          </div>
          <div className="flex items-center ml-3 shrink-0 space-x-3">
            <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
              isResolved
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
            }`}>
              {isResolved ? 'RESOLVED' : d.status || 'ACTIVE'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">{timeAgo(event.ts)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2">
      <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{value}</p>
    </div>
  );
}