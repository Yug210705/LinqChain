'use client';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Share2, Sparkles, ChevronRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchDisruption } from '@/services/api';
import { ImpactOverviewTab } from '@/components/disruptions/tabs/impact-overview-tab';
import { InventoryTab } from '@/components/disruptions/tabs/inventory-tab';
import { ProductionTab } from '@/components/disruptions/tabs/production-tab';
import { DependencyGraphTab } from '@/components/disruptions/tabs/dependency-graph-tab';
import { AffectedEntitiesTab } from '@/components/disruptions/tabs/affected-entities-tab';
import { OrdersTab } from '@/components/disruptions/tabs/orders-tab';
import { FinancialImpactTab } from '@/components/disruptions/tabs/financial-impact-tab';
import { ExplanationsTab } from '@/components/disruptions/tabs/explanations-tab';

const TABS = [
  'Impact Overview', 'Dependency Graph', 'Affected Entities',
  'Inventory', 'Production', 'Orders', 'Financial Impact', 'Explanations'
];

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export default function ImpactAnalysisPage() {
  const params = useParams();
  const id = params?.id as string;
  const { activeDisruption, setActiveDisruption, clearLiveDisruption } = useSimulationStore();
  const [activeTab, setActiveTab] = useState('Impact Overview');
  const [fetched, setFetched] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load the disruption snapshot by id so ANY disruption (active or history)
  // can be opened directly, even after a reload / without the live store.
  // NOTE: only ACTIVE disruptions drive the live store — viewing a resolved one
  // must not bleed its old data into the command center / graph.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await fetchDisruption(id);
        if (cancelled) return;
        setFetched(d);
        if (d.status === 'ACTIVE' || !d.status) {
          setActiveDisruption(d);
        } else {
          clearLiveDisruption(); // viewing a resolved run — keep any recovery view
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Disruption not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, setActiveDisruption, clearLiveDisruption]);

  const data = fetched || activeDisruption || null;
  const status = data?.status ?? '';
  const isActive = status === 'ACTIVE' || status === '';

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.simulation_id || id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-[#0A0F1C]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading disruption {id}…</p>
        </div>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-[#0A0F1C] px-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Disruption not found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error || `No record exists for "${id}".`}</p>
          <Link href="/disruptions" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors">
            Back to Disruptions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A0F1C] overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="max-w-[1800px] mx-auto w-full">
        {/* Header Area */}
        <div className="px-6 pt-4 shrink-0">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <div className="flex items-center text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-3 tracking-wide uppercase">
                <Link href="/disruptions" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer">
                  Disruptions
                </Link>
                <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-400 dark:text-slate-600" />
                <span className="text-slate-900 dark:text-white">{data?.disruption?.affected_entity_id || id}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                Disruption Impact Analysis
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button onClick={handleShare} className="flex items-center px-4 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[13px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                <Share2 className="w-4 h-4 mr-2 text-slate-500" /> {copied ? 'Copied!' : 'Share'}
              </button>
              <button onClick={handleExport} className="flex items-center px-4 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[13px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                <Download className="w-4 h-4 mr-2 text-slate-500" /> Export
              </button>
              {isActive && (
                <Link
                  href={`/recovery/${data?.simulation_id || id}`}
                  className="flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-bold transition-all shadow-sm shadow-blue-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Create Recovery Plan
                </Link>
              )}
            </div>
          </div>

          {/* Top Summary Box */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex items-stretch overflow-hidden mb-2">
            <div className="flex items-center p-5 flex-1">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mr-5 border border-red-100 dark:border-red-900/30 shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-[18px] font-extrabold text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                    {data?.disruption?.affected_entity_id}
                  </h2>
                  <span className="font-semibold text-slate-500 dark:text-slate-400 capitalize text-[14px]">
                    {data?.disruption?.disruption_type}
                  </span>
                </div>
                <div className="flex items-center mt-2 space-x-3 text-[13px]">
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm border',
                    !data?.disruption || (data.disruption.severity ?? 0) >= 0.8
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
                      : (data.disruption.severity ?? 0) >= 0.5
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50'
                  )}>
                    {(data?.disruption?.severity ?? 1) >= 0.8 ? 'Critical' : (data.disruption.severity ?? 0) >= 0.5 ? 'High' : 'Medium'}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    {Math.round((data?.disruption?.severity ?? 1) * 100)}% capacity loss
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {data?.disruption?.duration_days} Days duration
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 px-8 py-5 space-x-12 shrink-0">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Started</div>
                <div className="text-[13px] font-bold text-slate-900 dark:text-white">{formatDate(data?.created_at)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Simulation ID</div>
                <div className="text-[13px] font-bold text-slate-900 dark:text-white">{data?.simulation_id || id}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</div>
                <div className="flex items-center text-[13px] font-bold text-slate-900 dark:text-white">
                  {isActive ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      Active
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
                      Resolved
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mt-6 border-b border-slate-200 dark:border-slate-800 px-2">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-3 text-[13px] font-bold transition-all border-b-2 relative",
                  activeTab === tab
                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area — only the active tab is mounted (avoids 0-size
            chart warnings and wasted renders on hidden tabs) */}
        <div className="px-6 py-6 pb-12">
          {activeTab === 'Impact Overview' && (
            <ImpactOverviewTab disruptionData={data} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'Dependency Graph' && (
            <div className="h-full">
              <DependencyGraphTab disruptionData={data} />
            </div>
          )}
          {activeTab === 'Affected Entities' && <AffectedEntitiesTab disruptionData={data} />}
          {activeTab === 'Inventory' && (
            <InventoryTab disruptionData={data} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'Production' && <ProductionTab disruptionData={data} />}
          {activeTab === 'Orders' && <OrdersTab disruptionData={data} />}
          {activeTab === 'Financial Impact' && <FinancialImpactTab disruptionData={data} />}
          {activeTab === 'Explanations' && <ExplanationsTab disruptionData={data} />}
        </div>
      </div>
    </div>
  );
}