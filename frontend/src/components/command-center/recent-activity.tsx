'use client';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { AlertTriangle, CheckCircle, Info, User, PackageOpen, Play, Truck, Radio, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { subscribeToCrossPortalEvents, CrossPortalEvent } from '@/lib/cross-portal-sync';

interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  time: string;
  icon: any;
  color: string;
  bg: string;
  isLive?: boolean;
}

export function RecentActivity() {
  const { activeDisruption } = useSimulationStore();
  const [liveEvents, setLiveEvents] = useState<ActivityItem[]>([]);
  
  const simulationActivities: ActivityItem[] = [
    { id: 'sim-1', title: 'Simulation completed for SUP-007 disruption', time: '2 min ago', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'sim-2', title: 'Recovery plan generated', subtitle: 'Plan A recommended', time: '8 min ago', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'sim-3', title: 'Risk assessment updated', subtitle: 'Risk score: 82 (High)', time: '15 min ago', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'sim-4', title: 'Approval requested', subtitle: 'Change supplier for MAT-004', time: '25 min ago', icon: User, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'sim-5', title: 'SAP action queued', subtitle: 'PO update for MAT-004', time: '32 min ago', icon: PackageOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  useEffect(() => {
    const unsubscribe = subscribeToCrossPortalEvents((evt: CrossPortalEvent) => {
      let item: ActivityItem | null = null;
      const timeStr = 'Just now';

      if (evt.type === 'ASN_DISPATCHED') {
        item = {
          id: evt.id,
          title: `Supplier ASN In-Transit: ${evt.payload?.sap_po_number || ''}`,
          subtitle: `${evt.payload?.quantity}x ${evt.payload?.part_number} via ${evt.payload?.carrier || 'Carrier'}`,
          time: timeStr,
          icon: Truck,
          color: 'text-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          isLive: true,
        };
      } else if (evt.type === 'PO_ACKNOWLEDGED') {
        item = {
          id: evt.id,
          title: `PO Acknowledged: ${evt.payload?.sap_po_number || ''}`,
          subtitle: `Supplier confirmed ETA ${evt.payload?.confirmedDate}`,
          time: timeStr,
          icon: CheckCircle,
          color: 'text-cyan-500',
          bg: 'bg-cyan-50 dark:bg-cyan-950/30',
          isLive: true,
        };
      } else if (evt.type === 'DISRUPTION_REPORTED') {
        item = {
          id: evt.id,
          title: `Supplier Alert: ${evt.payload?.title || 'Disruption'}`,
          subtitle: `Severity: ${evt.payload?.severity} — Plan: ${evt.payload?.mitigation_plan || 'Underway'}`,
          time: timeStr,
          icon: AlertTriangle,
          color: 'text-rose-500',
          bg: 'bg-rose-50 dark:bg-rose-950/30',
          isLive: true,
        };
      } else if (evt.type === 'KANBAN_REPLENISH_TRIGGERED') {
        item = {
          id: evt.id,
          title: `Shopfloor Replenish: Bin ${evt.payload?.bin_code}`,
          subtitle: `Part ${evt.payload?.part_number} dispatched to ${evt.payload?.supplier_vendor}`,
          time: timeStr,
          icon: Radio,
          color: 'text-indigo-500',
          bg: 'bg-indigo-50 dark:bg-indigo-950/30',
          isLive: true,
        };
      } else if (evt.type === 'USER_AUTH_UPDATED') {
        item = {
          id: evt.id,
          title: `Admin Security: User Access Updated`,
          subtitle: `${evt.payload?.email} authorized for ${evt.payload?.portal || 'portal'}`,
          time: timeStr,
          icon: ShieldCheck,
          color: 'text-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          isLive: true,
        };
      }

      if (item) {
        setLiveEvents((prev) => [item!, ...prev.slice(0, 9)]);
      }
    });

    return unsubscribe;
  }, []);

  const combinedActivities = [
    ...liveEvents,
    ...(activeDisruption ? simulationActivities : []),
  ];

  return (
    <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          {liveEvents.length > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE MESH
            </span>
          )}
        </div>
        <Link href="/recovery-plans" className="text-blue-600 dark:text-amber-400 text-xs font-bold hover:underline">View all</Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {combinedActivities.length > 0 ? (
          combinedActivities.map((a, i) => (
            <div key={a.id || i} className="flex relative">
              {i !== combinedActivities.length - 1 && <div className="absolute top-8 left-3.5 w-px h-full bg-slate-100 dark:bg-neutral-800"></div>}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${a.bg} dark:bg-neutral-800 shadow-sm border border-white dark:border-neutral-700`}>
                <a.icon className={`w-3.5 h-3.5 ${a.color}`} />
              </div>
              <div className="ml-3 flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-neutral-200 truncate" title={a.title}>{a.title}</p>
                  {a.isLive && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      LIVE
                    </span>
                  )}
                </div>
                {a.subtitle && <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 truncate" title={a.subtitle}>{a.subtitle}</p>}
              </div>
              <div className="text-[10px] font-medium text-slate-400 shrink-0 ml-2 pt-1">{a.time}</div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-neutral-800 flex items-center justify-center mb-3 border border-slate-100 dark:border-neutral-700">
              <Info className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">No recent activity.</p>
            <p className="text-[11px] text-slate-400 mt-1">Cross-portal events and simulations will stream here live.</p>
          </div>
        )}
      </div>
    </div>
  );
}
