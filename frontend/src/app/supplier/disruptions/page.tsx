'use client';

import React, { useState } from 'react';
import { useSupplierStore, SupplierDisruptionReport } from '@/stores/useSupplierStore';
import { cn } from '@/lib/utils';
import {
  AlertOctagon,
  Radio,
  Send,
  CheckCircle2,
  Clock,
  Flame,
  Wrench,
  Truck,
  ShieldAlert,
  ArrowRight,
  Check,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export default function SupplierDisruptionsPage() {
  const { disruptions, purchaseOrders, reportDisruption, resolveDisruption, supplierUser } = useSupplierStore();

  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState<SupplierDisruptionReport['incident_type']>('EQUIPMENT_FAILURE');
  const [severity, setSeverity] = useState<SupplierDisruptionReport['severity']>('MEDIUM');
  const [delayDays, setDelayDays] = useState<number>(4);
  const [affectedPo, setAffectedPo] = useState<string>(purchaseOrders[0]?.id || '');
  const [description, setDescription] = useState('');
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please specify incident title and operational description.');
      return;
    }

    reportDisruption({
      title: title.trim(),
      incident_type: incidentType,
      severity: severity,
      estimated_delay_days: delayDays,
      affected_pos: affectedPo ? [affectedPo] : [],
      description: description.trim(),
      mitigation_plan: mitigationPlan.trim() || 'Internal expedite and shift overtime initiated.',
    });

    setTitle('');
    setDescription('');
    setMitigationPlan('');
    showToast('Early warning disruption alert broadcasted directly to Buyer War Room.');
  };

  const handleResolve = (id: string, incidentTitle: string) => {
    resolveDisruption(id);
    showToast(`Disruption "${incidentTitle}" marked as RESOLVED.`);
  };

  const activeCount = disruptions.filter((d) => d.status === 'ACTIVE').length;
  const resolvingCount = disruptions.filter((d) => d.status === 'RESOLVING').length;
  const resolvedCount = disruptions.filter((d) => d.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
            <span>{supplierUser?.company_name || 'Titanium Alloy Forgings Corp'}</span>
            <span>/</span>
            <span>Vendor Operations</span>
            <span>/</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">Early Warning Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Disruption Early Warning Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Direct telemetry broadcast for upstream furnace failures, metal shortages, and autonomous OEM AI mitigation
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Telemetry Link: Buyer War Room Active</span>
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 4-Card KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cn(
          "bg-white dark:bg-[#18181b] border rounded-xl p-4 shadow-xs relative overflow-hidden group transition-all",
          activeCount > 0 ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60" : "border-slate-200 dark:border-neutral-800"
        )}>
          <div className={cn("absolute left-0 top-0 bottom-0 w-1", activeCount > 0 ? "bg-rose-500" : "bg-blue-500/80")} />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Active Alerts</span>
            <AlertOctagon className={cn("w-4 h-4", activeCount > 0 ? "text-rose-500 animate-pulse" : "text-slate-400")} />
          </div>
          <div className={cn("text-2xl font-black font-mono tracking-tight", activeCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white")}>
            {activeCount}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            {activeCount > 0 ? "Live upstream operational notices" : "Zero active bottlenecks"}
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Under Mitigation</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
            {resolvingCount}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            Active corrective work orders
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Resolved Incidents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            {resolvedCount}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            Normal throughput restored
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">AI Blast Radius</span>
            <Zap className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            0 <span className="text-sm font-normal text-slate-400">Stalls</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            OEM line starvation prevented
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Self-Report Incident (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Broadcast New Early Warning
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
              EDI 864 BROADCAST
            </span>
          </div>

          <form onSubmit={handleCreateReport} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1">
                Incident Title
              </label>
              <input
                type="text"
                placeholder="e.g. Rolling Mill #3 Motor Bearing Failure"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1">
                  Incident Type
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="EQUIPMENT_FAILURE">Equipment Breakdown</option>
                  <option value="MATERIAL_SHORTAGE">Raw Material Stockout</option>
                  <option value="LOGISTICS_DELAY">Logistics Port Delay</option>
                  <option value="FORCE_MAJEURE">Weather / Force Majeure</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1">
                  Severity Rating
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="LOW">Low (1-2 days shift)</option>
                  <option value="MEDIUM">Medium (3-5 days shift)</option>
                  <option value="HIGH">High (6-12 days shift)</option>
                  <option value="CRITICAL">Critical (&gt;12 days stall)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1">
                  Estimated Delay (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={delayDays}
                  onChange={(e) => setDelayDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1">
                  Affected PO
                </label>
                <select
                  value={affectedPo}
                  onChange={(e) => setAffectedPo(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="">General Facility Scope</option>
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.id} ({po.item_name.slice(0, 18)}...)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1">
                Root Cause & Equipment Description
              </label>
              <textarea
                rows={3}
                placeholder="Explain the mechanical or supply breakdown..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1">
                Mitigation & Expedited Actions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Activated backup foundry unit, secondary ingot shipment in route."
                value={mitigationPlan}
                onChange={(e) => setMitigationPlan(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Disruption to Buyer</span>
            </button>
          </form>
        </div>

        {/* Right Column: Active & Historical Reports (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Vendor Incident Registry
              </h2>
              <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">
                {disruptions.length} LOGGED ALERTS
              </span>
            </div>

            <div className="space-y-3">
              {disruptions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-neutral-500 font-mono text-xs">
                  No active disruptions logged. Plant operations nominal.
                </div>
              ) : (
                disruptions.map((d) => (
                  <div
                    key={d.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all relative overflow-hidden',
                      d.status === 'ACTIVE'
                        ? 'border-rose-500/30 bg-rose-500/5'
                        : d.status === 'RESOLVING'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 opacity-80'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute left-0 top-0 bottom-0 w-1',
                        d.status === 'ACTIVE'
                          ? 'bg-rose-500'
                          : d.status === 'RESOLVING'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      )}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {d.title}
                          </span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border',
                              d.severity === 'CRITICAL'
                                ? 'bg-rose-600 text-white border-rose-700'
                                : d.severity === 'HIGH'
                                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            )}
                          >
                            {d.severity}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {d.id} · Type: {d.incident_type.replace('_', ' ')} · Reported: {new Date(d.reported_at).toLocaleDateString()}
                        </div>
                      </div>

                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 border',
                          d.status === 'ACTIVE'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                            : d.status === 'RESOLVING'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        )}
                      >
                        {d.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-neutral-300 mt-2 leading-relaxed">
                      {d.description}
                    </p>

                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800/60 border border-slate-200/60 dark:border-neutral-800 text-xs">
                      <span className="font-bold text-slate-700 dark:text-neutral-200">Mitigation: </span>
                      <span className="text-slate-500 dark:text-neutral-400">{d.mitigation_plan}</span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-200/60 dark:border-neutral-800/80">
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Production Impact: <span className="font-mono font-bold text-slate-800 dark:text-neutral-200">+{d.estimated_delay_days} Days Lead-time</span>
                      </div>

                      {d.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => handleResolve(d.id, d.title)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
