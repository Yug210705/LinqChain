'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, History, Zap, RefreshCw, Inbox, RotateCcw } from 'lucide-react';
import { fetchDisruptions, resetDisruptions } from '@/services/api';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DisruptionListItem {
  simulation_id: string;
  disruption_type: string;
  affected_entity_id: string;
  severity: number;
  duration_days: number;
  status: string;
  created_at: string | null;
  resolved_at: string | null;
  summary: any;
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function severityBadge(severity: number) {
  if (severity >= 0.8) return { label: 'Critical', cls: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60' };
  if (severity >= 0.5) return { label: 'High', cls: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60' };
  return { label: 'Medium', cls: 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/60' };
}

function DisruptionCard({ d }: { d: DisruptionListItem }) {
  const sev = severityBadge(d.severity);
  const active = d.status === 'ACTIVE';
  const rev = d.summary?.revenue_at_risk ?? 0;
  const impact = d.summary?.overall_impact_score ?? 0;
  return (
    <Link
      href={`/disruptions/${d.simulation_id}`}
      className={cn(
        'block bg-white dark:bg-[#1c1c1e] border rounded-xl shadow-sm p-5 hover:shadow-md hover:border-blue-400 dark:hover:border-amber-600/60 transition-all group relative overflow-hidden',
        active ? 'border-slate-200 dark:border-neutral-800' : 'border-slate-200 dark:border-neutral-800 opacity-95'
      )}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start min-w-0">
          <span className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mr-3', active ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400')}>
            {active ? <AlertTriangle className="w-4.5 h-4.5" /> : <CheckCircle2 className="w-5 h-5" />}
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-[15px] truncate">{d.affected_entity_id}</h3>
            <p className="text-[12px] text-slate-500 dark:text-neutral-400 capitalize truncate">{d.disruption_type}</p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider', sev.cls)}>
            {sev.label}
          </span>
          <span className="mt-2 inline-flex items-center text-[10px] font-bold uppercase tracking-wider">
            <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', active ? 'bg-red-500 animate-pulse' : 'bg-slate-400')} />
            <span className={active ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-neutral-400'}>{d.status}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-lg px-2.5 py-2 text-center border border-slate-100 dark:border-neutral-800">
          <div className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(d.severity * 100)}%</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Severity</div>
        </div>
        <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-lg px-2.5 py-2 text-center border border-slate-100 dark:border-neutral-800">
          <div className="text-sm font-bold text-slate-900 dark:text-white">{d.duration_days}d</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Duration</div>
        </div>
        <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-lg px-2.5 py-2 text-center border border-slate-100 dark:border-neutral-800">
          <div className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(rev)}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">At risk</div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-[11px] gap-2">
        <span className="text-slate-400 dark:text-neutral-500 truncate" title={formatDate(d.created_at)}>{formatDate(d.created_at)}</span>
        <span className={cn('inline-flex items-center font-bold text-blue-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0')}>
          View analysis <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </div>
      {impact > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1"><span>Overall impact score</span><span className="text-slate-700 dark:text-neutral-200">{impact}</span></div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.min(impact, 100)}%`, background: impact >= 75 ? '#ef4444' : impact >= 50 ? '#f59e0b' : '#d97706' }} />
          </div>
        </div>
      )}
    </Link>
  );
}

export default function DisruptionsPage() {
  const [data, setData] = useState<{ active: DisruptionListItem[]; history: DisruptionListItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resetting, setResetting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchDisruptions());
    } catch (e: any) {
      setError(e?.message || 'Failed to load disruptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReset = async () => {
    if (resetting) return;
    const activeCount = data?.active.length ?? 0;
    const historyCount = data?.history.length ?? 0;
    const yes = window.confirm(
      `Reset all simulated disruptions?\n\nThis will permanently delete ${activeCount + historyCount} record(s) (${activeCount} active, ${historyCount} history) and restore the supply chain to a pristine state.`
    );
    if (!yes) return;
    setResetting(true);
    try {
      await resetDisruptions();
      useSimulationStore.getState().clearDisruption(); // revert live graph
      setData({ active: [], history: [] });
    } catch (e: any) {
      alert(e?.message || 'Failed to reset disruptions');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="w-full max-w-[1850px] mx-auto py-2 px-1 sm:px-2">
      <div className="flex flex-wrap justify-between items-end border-b border-slate-200 dark:border-neutral-800 pb-4 mb-8 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-red-500" /> Disruptions
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 mt-1">Active events and simulation history across the supply chain.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} disabled={resetting || (!data?.active.length && !data?.history.length)}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-700 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> {resetting ? 'Resetting…' : 'Reset all'}
          </button>
          <button onClick={load} className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-amber-400 border border-slate-200 dark:border-neutral-700 rounded-md transition-colors cursor-pointer">
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} /> Refresh
          </button>
          <Link href="/command-center" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors cursor-pointer">
            <Zap className="w-4 h-4 mr-2" /> Simulate Disruption
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 min-[1850px]:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-48 bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm animate-pulse" />
          ))}
        </div>
      ) : !data || (data.active.length === 0 && data.history.length === 0) ? (
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm py-20 text-center">
          <Inbox className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">No disruptions recorded</h2>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">Run a simulation from the Command Center — every run is saved to history.</p>
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="flex items-center mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Active ({data.active.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 min-[1850px]:grid-cols-5 gap-4">
              {data.active.map((d) => <DisruptionCard key={d.simulation_id} d={d} />)}
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <History className="w-4 h-4 text-slate-400 mr-2" />
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">History ({data.history.length})</h2>
            </div>
            {data.history.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-neutral-500">Resolved disruptions will appear here.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 min-[1850px]:grid-cols-5 gap-4">
                {data.history.map((d) => <DisruptionCard key={d.simulation_id} d={d} />)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
