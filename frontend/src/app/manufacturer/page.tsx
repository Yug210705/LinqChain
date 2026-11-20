'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useManufacturerStore, ProductionLine, WorkOrder } from '@/stores/useManufacturerStore';
import {
  Cpu,
  Layers,
  Component,
  FileCheck2,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowRight,
  Zap,
  Clock,
  ChevronRight,
  ShieldAlert,
  Flame,
  AlertCircle,
  X,
  Factory,
  Sliders,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManufacturerDashboard() {
  const { lines, workOrders, kanbanBins, ncrs, telemetry, setLineStatus, expediteShortage } = useManufacturerStore();

  const [selectedLineForOverride, setSelectedLineForOverride] = useState<ProductionLine | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<ProductionLine['status']>('RUNNING');
  const [expediteSuccessMessage, setExpediteSuccessMessage] = useState<string | null>(null);

  // Derived metrics
  const runningLines = lines.filter((l) => l.status === 'RUNNING');
  const starvedLines = lines.filter((l) => l.status === 'STARVED');
  const blockedLines = lines.filter((l) => l.status === 'BLOCKED');

  const avgOee = (lines.reduce((acc, l) => acc + l.oee_percentage, 0) / (lines.length || 1)).toFixed(1);
  const totalIdleCost = lines
    .filter((l) => l.status !== 'RUNNING')
    .reduce((acc, l) => acc + l.idle_cost_per_hr, 0);

  const criticalShortages = workOrders.flatMap((wo) =>
    wo.bom_shortages.filter((b) => b.status === 'SHORTAGE').map((b) => ({ ...b, woNumber: wo.wo_number, woId: wo.id }))
  );

  const handleApplyOverride = () => {
    if (!selectedLineForOverride) return;
    setLineStatus(
      selectedLineForOverride.id,
      overrideStatus,
      overrideStatus === 'RUNNING' ? null : `Manual Override: Shift Lead Dispatch`
    );
    setSelectedLineForOverride(null);
  };

  const handleQuickExpedite = (woId: string, partNumber: string, partName: string) => {
    expediteShortage(woId, partNumber);
    setExpediteSuccessMessage(`Supplier priority replenishment triggered for ${partName} (${partNumber}). Starvation resolved.`);
    setTimeout(() => {
      setExpediteSuccessMessage(null);
    }, 6000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
            <span>Plant TX-04</span>
            <span>/</span>
            <span>Overview</span>
            <span>/</span>
            <span className="text-emerald-600 dark:text-emerald-400">Operations Cockpit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Plant Operations Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Real-time MES telemetry, line-side starvation indices, and Overall Equipment Effectiveness (OEE)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/manufacturer/lines"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Cell Telemetry Workbench</span>
          </Link>
        </div>
      </div>

      {/* Expedite Banner Toast */}
      {expediteSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{expediteSuccessMessage}</span>
          </div>
          <button
            onClick={() => setExpediteSuccessMessage(null)}
            className="p-1 hover:bg-emerald-500/20 rounded-md text-emerald-400 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Enterprise KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Fleet OEE */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                Plant OEE Efficiency
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono mt-0.5">
                {avgOee}%
              </div>
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2.4% vs Shift 1 benchmark</span>
          </div>
        </div>

        {/* KPI 2: Line Availability */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                Active Cells Uptime
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono mt-0.5">
                {runningLines.length} / {lines.length}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {starvedLines.length} Starved • {blockedLines.length} Blocked
          </div>
        </div>

        {/* KPI 3: Downtime Idle Cost */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                Current Idle Cost Rate
              </div>
              <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                ${totalIdleCost.toLocaleString()}<span className="text-xs font-normal text-slate-400">/hr</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
            Accumulated loss: ${(totalIdleCost * 1.8).toFixed(0)}
          </div>
        </div>

        {/* KPI 4: First-Pass Yield */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                First-Pass Yield (FPY)
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono mt-0.5">
                98.4%
              </div>
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            AS9100 Rev D audit compliant
          </div>
        </div>
      </div>

      {/* Critical Shortage Alert Banner */}
      {criticalShortages.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  CRITICAL WORKSTATION STARVATION
                </span>
                <span className="text-xs font-mono text-amber-300 font-semibold">
                  Affected WO: {criticalShortages[0].woNumber}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1">
                Line 2 (Avionics) is starved of <strong className="text-white">{criticalShortages[0].part_name}</strong> (PN: {criticalShortages[0].part_number}). Required: {criticalShortages[0].required} | Available: {criticalShortages[0].available}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleQuickExpedite(criticalShortages[0].woId, criticalShortages[0].part_number, criticalShortages[0].part_name)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Broadcast Supplier Expedite</span>
            </button>
            <Link
              href="/manufacturer/work-orders"
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors"
            >
              Inspect BOM
            </Link>
          </div>
        </div>
      )}

      {/* Production Lines Section */}
      <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-neutral-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Assembly Lines & Workstations Real-Time Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Live SCADA telemetry loop across 4 automated cells
            </p>
          </div>
          <Link
            href="/manufacturer/lines"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Telemetry Drilldown</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lines.map((line) => {
            const isRunning = line.status === 'RUNNING';
            const isStarved = line.status === 'STARVED';
            const isBlocked = line.status === 'BLOCKED';

            return (
              <div
                key={line.id}
                className={cn(
                  'p-4 rounded-xl border transition-all relative overflow-hidden bg-white dark:bg-[#18181b]',
                  isRunning
                    ? 'border-slate-200 dark:border-neutral-800 hover:border-emerald-500/40'
                    : isStarved
                    ? 'border-amber-300 dark:border-amber-900/60'
                    : 'border-rose-300 dark:border-rose-900/60'
                )}
              >
                {/* Left accent strip */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1',
                    isRunning ? 'bg-emerald-500' : isStarved ? 'bg-amber-500' : 'bg-rose-500'
                  )}
                />

                <div className="ml-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-neutral-400">
                      {line.line_code}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs font-mono',
                        isRunning
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : isStarved
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      )}
                    >
                      {line.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {line.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                    Cell Lead: <strong className="text-slate-700 dark:text-neutral-300">{line.cell_lead}</strong> • WO: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{line.current_work_order_id}</span>
                  </div>

                  {line.active_alarm && (
                    <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate font-mono">{line.active_alarm}</span>
                    </div>
                  )}

                  {/* OEE breakdown */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase block">OEE</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{line.oee_percentage}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase block">Rate</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{line.current_rate_per_hr}/{line.target_rate_per_hr} uph</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase block">Yield</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{line.quality_yield_percentage}%</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">Idle Rate: ${line.idle_cost_per_hr.toLocaleString()}/hr</span>
                    <button
                      onClick={() => {
                        setSelectedLineForOverride(line);
                        setOverrideStatus(line.status);
                      }}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Supervisory Override
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Row: Active Work Orders + Kanban Staging Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Work Orders in Flight */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-neutral-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Active Work Orders</h3>
              <Link href="/manufacturer/work-orders" className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">
                View All {workOrders.length} Orders
              </Link>
            </div>

            <div className="space-y-3">
              {workOrders.slice(0, 3).map((wo) => {
                const progress = Math.round((wo.completed_quantity / wo.target_quantity) * 100);
                const hasShortage = wo.bom_shortages.some((b) => b.status === 'SHORTAGE');

                return (
                  <div
                    key={wo.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{wo.wo_number}</span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded font-mono',
                          wo.priority === 'CRITICAL_AOG'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                            : wo.priority === 'EXPEDITE'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'
                        )}
                      >
                        {wo.priority}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200 mt-1 truncate">
                      {wo.product_name}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 mt-2">
                      <span>{wo.completed_quantity} / {wo.target_quantity} Units</span>
                      <span className="font-mono font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', hasShortage ? 'bg-amber-500' : 'bg-emerald-500')}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-neutral-800 text-center">
            <Link
              href="/manufacturer/work-orders"
              className="text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5"
            >
              <span>Manage Bill of Materials & Line Schedules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Kanban Staging Snapshot */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-neutral-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Line-Side Kanban Staging</h3>
              <Link href="/manufacturer/kanban" className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">
                View Kanban Board
              </Link>
            </div>

            <div className="space-y-3">
              {kanbanBins.slice(0, 3).map((bin) => {
                const fillPercent = Math.round((bin.current_level / bin.capacity) * 100);
                const isCritical = bin.status === 'CRITICAL_EMPTY';
                const isTriggered = bin.status === 'REPLENISH_TRIGGERED';

                return (
                  <div
                    key={bin.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{bin.bin_code}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({bin.station_code})</span>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-neutral-300 font-medium truncate mt-0.5">
                        {bin.part_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Level: {bin.current_level} / {bin.capacity} • {bin.supplier_vendor}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded font-mono block mb-1',
                          isCritical
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                            : isTriggered
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        )}
                      >
                        {isCritical ? 'Critical' : isTriggered ? 'En Route' : 'Ready'}
                      </span>
                      <div className="w-20 bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', isCritical ? 'bg-rose-500' : isTriggered ? 'bg-amber-500' : 'bg-emerald-500')}
                          style={{ width: `${Math.min(fillPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-neutral-800 text-center">
            <Link
              href="/manufacturer/kanban"
              className="text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5"
            >
              <span>Inspect All {kanbanBins.length} Kanban Point-of-Use Bins</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Manual Override Modal */}
      {selectedLineForOverride && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] border border-neutral-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Supervisory Override: {selectedLineForOverride.line_code}</span>
              </h3>
              <button
                onClick={() => setSelectedLineForOverride(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Supervisory override takes precedence over PLC station sensors. Changing status will adjust line availability and telemetry broadcasting.
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-300 uppercase mb-2">
                  Select Desired Cell State:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['RUNNING', 'STARVED', 'BLOCKED', 'MAINTENANCE'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOverrideStatus(st)}
                      className={cn(
                        'py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all text-left cursor-pointer',
                        overrideStatus === st
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLineForOverride(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyOverride}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Commit Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
