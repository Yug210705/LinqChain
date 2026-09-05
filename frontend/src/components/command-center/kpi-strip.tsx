'use client';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { AlertTriangle, Users, Factory, ClipboardList, IndianRupee, BarChart3 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { fetchDisruptions } from '@/services/api';
import { useEffect, useState } from 'react';

export function KPIStrip() {
  const { activeDisruption, clearLiveDisruption } = useSimulationStore();
  const [serverActive, setServerActive] = useState<any | null>(null);

  /* Overview is BACKEND-truthful: fetch the ACTIVE disruption list and let KPIs
     use the live disruption (store OR server snapshot). This guarantees counts
     like "Affected Suppliers" never show 0 while a disruption is active, and
     they reset automatically once it's resolved. */
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const list = await fetchDisruptions();
        if (cancelled) return;
        const active = list?.active ?? [];
        setServerActive(active.length ? active[0] : null);
        if (activeDisruption && !active.some((a: any) => a.simulation_id === activeDisruption.simulation_id)) {
          clearLiveDisruption(); // resolved on backend — drop live data, keep recovery view
        }
      } catch { /* backend unreachable — keep live state */ }
    };
    sync();
    const t = setInterval(sync, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, [activeDisruption, clearLiveDisruption]);

  const live = activeDisruption || serverActive;
  const summary = live?.summary || {};
  const isDisrupted = !!live;

  // Robust counts: prefer summary numbers, derive from the affected arrays if
  // the summary is missing, and a supplier entity always counts its source.
  const countOf = (key: string, arr?: any[]): number => {
    const s = summary[key];
    if (typeof s === 'number' && s > 0) return s;
    return arr?.length ?? 0;
  };

  const kpis = [
    { 
      label: 'Active Disruptions', 
      value: isDisrupted ? '1' : '0',
      subtext: isDisrupted ? 'Live event' : 'All clear', 
      icon: AlertTriangle, iconColor: 'text-red-500', iconBg: 'bg-red-50 dark:bg-red-950/50',
      badge: isDisrupted ? 'Critical' : null, badgeColor: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
    },
    { 
      label: 'Affected Suppliers', 
      value: countOf('affected_suppliers', live?.affected_suppliers).toString(),
      subtext: isDisrupted ? 'within supply tiers' : '-', 
      icon: Users, iconColor: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      badge: isDisrupted ? 'High' : null, badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
    },
    { 
      label: 'Affected Plants', 
      value: countOf('affected_plants', live?.affected_plants).toString(),
      subtext: isDisrupted ? 'across regions' : '-', 
      icon: Factory, iconColor: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      badge: isDisrupted ? 'High' : null, badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
    },
    { 
      label: 'Orders at Risk', 
      value: countOf('affected_orders', live?.affected_orders).toString(),
      subtext: isDisrupted && summary?.revenue_at_risk ? `${formatCurrency(summary.revenue_at_risk)} exposure` : '-', 
      icon: ClipboardList, iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      badge: isDisrupted ? 'Critical' : null, badgeColor: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
    },
    { 
      label: 'Revenue at Risk', 
      value: isDisrupted && summary?.revenue_at_risk ? formatCurrency(summary.revenue_at_risk) : formatCurrency(0), 
      subtext: isDisrupted ? `${summary?.overall_impact_score ?? '—'} impact score` : '-', 
      icon: IndianRupee, iconColor: 'text-amber-500 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      badge: isDisrupted ? 'Critical' : null, badgeColor: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
    },
    { 
      label: 'Production Impact', 
      value: isDisrupted && summary?.overall_impact_score ? `${summary.overall_impact_score}%` : '0%',
      subtext: isDisrupted ? 'Severity Score' : '-', 
      icon: BarChart3, iconColor: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      badge: isDisrupted ? 'High' : null, badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
    },
  ];

  return (
    <div className="flex overflow-x-auto pb-4 gap-4 custom-scrollbar">
      {kpis.map((kpi, i) => (
        <div key={i} className="flex-1 min-w-[220px] shrink-0 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex items-center space-x-3 mb-4 relative z-10">
            <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110 duration-300 shrink-0", kpi.iconBg)}>
              <kpi.icon className={cn("w-5 h-5", kpi.iconColor)} />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap leading-none mb-1">{kpi.label}</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight whitespace-nowrap leading-none">{kpi.value}</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60 relative z-10">
            <span className={cn("text-[11px] font-medium truncate mr-2", 
              kpi.subtext.includes('↑') ? "text-red-500 font-bold" : "text-slate-500 dark:text-slate-400"
            )} title={kpi.subtext}>
              {kpi.subtext}
            </span>
            {kpi.badge && (
              <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm shrink-0", kpi.badgeColor)}>
                {kpi.badge}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
