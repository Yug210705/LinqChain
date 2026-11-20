'use client';

import React, { useState } from 'react';
import { useManufacturerStore, ProductionLine } from '@/stores/useManufacturerStore';
import {
  Cpu,
  Activity,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Wrench,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Radio,
  Sliders,
  ChevronRight,
  RefreshCw,
  X,
  Layers,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManufacturerLinesPage() {
  const { lines, setLineStatus, telemetry } = useManufacturerStore();
  const [selectedLine, setSelectedLine] = useState<ProductionLine>(lines[0]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleStateChange = (status: ProductionLine['status'], reason?: string | null) => {
    setLineStatus(selectedLine.id, status, reason);
    setSelectedLine((prev) => ({
      ...prev,
      status,
      active_alarm: reason !== undefined ? reason : prev.active_alarm,
    }));
    setActionNotice(`Cell ${selectedLine.line_code} transitioned to ${status}. SCADA cycle broadcasted.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Enterprise Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
            <span>Plant TX-04</span>
            <span>/</span>
            <span>Shop Floor Execution</span>
            <span>/</span>
            <span className="text-emerald-600 dark:text-emerald-400">Production Lines & OEE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Production Lines & OEE Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Station sensor telemetry, Overall Equipment Effectiveness (OEE), and automated workstation overrides
          </p>
        </div>

        {/* Live Loop Beacon */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SCADA Loop: {telemetry.plc_cycle_time_ms}ms</span>
          <span className="text-slate-300 dark:text-neutral-700">|</span>
          <span>{telemetry.cleanroom_iso_class}</span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="p-1 hover:bg-emerald-500/20 rounded-md text-emerald-400 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Assembly Cell Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {lines.map((line) => {
          const isSelected = selectedLine.id === line.id;
          const isRunning = line.status === 'RUNNING';
          const isStarved = line.status === 'STARVED';
          const isBlocked = line.status === 'BLOCKED';

          return (
            <button
              key={line.id}
              onClick={() => setSelectedLine(line)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer shadow-xs',
                isSelected
                  ? 'bg-white dark:bg-[#1c1c1e] border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
                  : 'bg-white dark:bg-[#18181b] border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
              )}
            >
              {/* Left Accent Bar */}
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
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : isStarved
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                    )}
                  >
                    {line.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {line.name}
                </h4>
                <div className="flex items-baseline justify-between mt-3 font-mono">
                  <span className="text-[11px] text-slate-400 dark:text-neutral-500">OEE Yield:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{line.oee_percentage}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Cell Detailed Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Cell Telemetry Gauges & Workstation Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-neutral-400">
                    {selectedLine.line_code}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs font-mono',
                      selectedLine.status === 'RUNNING'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    )}
                  >
                    {selectedLine.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedLine.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Cell Lead: <strong className="text-slate-700 dark:text-neutral-300">{selectedLine.cell_lead}</strong> • Active WO: <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{selectedLine.current_work_order_id}</span>
                </p>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStateChange('RUNNING', null)}
                  disabled={selectedLine.status === 'RUNNING'}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Resume Cell</span>
                </button>
                <button
                  onClick={() => handleStateChange('MAINTENANCE', 'Preventive Maintenance Scheduled')}
                  disabled={selectedLine.status === 'MAINTENANCE'}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Maintenance Hold</span>
                </button>
              </div>
            </div>

            {/* Active Station Alarm */}
            {selectedLine.active_alarm && (
              <div className="my-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold uppercase font-mono block text-[11px]">Station Alarm:</span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-neutral-300">{selectedLine.active_alarm}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStateChange(selectedLine.status, null)}
                  className="px-2.5 py-1 bg-white dark:bg-neutral-900 hover:bg-slate-100 text-slate-700 dark:text-neutral-200 rounded text-xs font-semibold border border-slate-200 dark:border-neutral-700 cursor-pointer"
                >
                  Ack
                </button>
              </div>
            )}

            {/* Tri-Factor Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-neutral-400 uppercase">Availability</div>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedLine.availability_percentage}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${selectedLine.availability_percentage}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono mt-1 block">Scheduled vs Uptime</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-neutral-400 uppercase">Performance Rate</div>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedLine.performance_percentage}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(selectedLine.performance_percentage, 100)}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono mt-1 block">{selectedLine.current_rate_per_hr} / {selectedLine.target_rate_per_hr} units/hr</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-neutral-400 uppercase">Quality Yield</div>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedLine.quality_yield_percentage}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedLine.quality_yield_percentage}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono mt-1 block">First-Pass Defect Free</span>
              </div>
            </div>

            {/* Sequential Cell Workstations */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-neutral-800">
              <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500 dark:text-neutral-400 mb-3">
                Sequential Cell Workstations (PLC Nodes)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  { station: 'ST-01', name: 'Raw Infeed Blank Load', status: 'ONLINE', cycle: '42s' },
                  { station: 'ST-02', name: '5-Axis CNC Precision Mill', status: selectedLine.status === 'STARVED' ? 'STARVED' : 'ONLINE', cycle: '118s' },
                  { station: 'ST-03', name: 'Eddy Current / NDT Probe', status: 'ONLINE', cycle: '34s' },
                  { station: 'ST-04', name: 'Robotic Deburr & Wash', status: selectedLine.status === 'BLOCKED' ? 'BLOCKED' : 'ONLINE', cycle: '55s' },
                ].map((st) => (
                  <div
                    key={st.station}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-500 dark:text-neutral-400 font-bold">{st.station}</span>
                      <span
                        className={cn(
                          'text-[9px] font-bold px-1.5 py-0.2 rounded font-mono',
                          st.status === 'ONLINE'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : st.status === 'STARVED'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        )}
                      >
                        {st.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-neutral-200 mt-1 truncate">{st.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">Cycle: {st.cycle}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Financial Impact & Downtime Economics */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 dark:text-neutral-400 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-rose-500" />
              <span>Cell Economics & Downtime Loss</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">Hourly Idle Rate</span>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  ${selectedLine.idle_cost_per_hr.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400">/hr</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Direct labor absorption, cleanroom HVAC, and tooling depreciation.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">Shift Downtime Accrued</span>
                <div className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {selectedLine.downtime_minutes} min
                </div>
                <div className="text-xs font-mono text-rose-500 mt-1">
                  Estimated financial loss: ${((selectedLine.idle_cost_per_hr * selectedLine.downtime_minutes) / 60).toFixed(0)}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">Planned Takt Time Target</span>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {(60 / selectedLine.target_rate_per_hr).toFixed(1)} min / unit
                </div>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Target: {selectedLine.target_rate_per_hr} units per hour
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
