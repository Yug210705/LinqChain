'use client';

import React, { useState } from 'react';
import { useManufacturerStore, KanbanBin } from '@/stores/useManufacturerStore';
import {
  Component,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Radio,
  QrCode,
  Package,
  ArrowRight,
  X,
  Truck,
  Box,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Activity,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManufacturerKanbanPage() {
  const { kanbanBins, triggerKanbanReplenish, restockKanban } = useManufacturerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [lineFilter, setLineFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredBins = kanbanBins.filter((bin) => {
    const matchesSearch =
      bin.bin_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.station_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || bin.status === statusFilter;
    const matchesLine = lineFilter === 'ALL' || bin.line_code === lineFilter;
    return matchesSearch && matchesStatus && matchesLine;
  });

  const handleTrigger = (binId: string, binCode: string) => {
    triggerKanbanReplenish(binId);
    setActionNotice(`Electronic Kanban replenishment signal dispatched for ${binCode}. AGV tugger unit on route.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleRestock = (binId: string, binCode: string) => {
    restockKanban(binId);
    setActionNotice(`Kanban bin ${binCode} replenishment verified. Optical level sensors calibrated to 100%.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleTriggerAllStarved = () => {
    const starved = kanbanBins.filter((b) => b.status === 'CRITICAL_EMPTY');
    starved.forEach((b) => triggerKanbanReplenish(b.id));
    setActionNotice(`Broadcasted priority AGV material call for ${starved.length} starved staging ${starved.length === 1 ? 'bin' : 'bins'}.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const criticalCount = kanbanBins.filter((b) => b.status === 'CRITICAL_EMPTY').length;
  const inTransitCount = kanbanBins.filter((b) => b.status === 'REPLENISH_TRIGGERED').length;
  const fullCount = kanbanBins.filter((b) => b.status === 'FULL').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Enterprise Page Header matching Operator Command Center */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
            <span>Plant TX-04</span>
            <span>/</span>
            <span>Shop Floor Execution</span>
            <span>/</span>
            <span className="text-emerald-600 dark:text-emerald-400">Line-Side Kanban</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Line-Side Kanban & Staging Bins
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Two-bin lean replenishment system, point-of-use automated calls, and autonomous AGV delivery tracking
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {criticalCount > 0 && (
            <button
              onClick={handleTriggerAllStarved}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Dispatch All Starved ({criticalCount})</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 dark:bg-neutral-800 rounded-lg p-0.5 border border-slate-200 dark:border-neutral-700">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              )}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              )}
              title="Data Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
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

      {/* Enterprise KPI Strip (Matching Command Center design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Staged & Ready */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                Staged & Ready
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono mt-0.5">
                {fullCount} {fullCount === 1 ? 'Bin' : 'Bins'}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            100% station buffer satisfied
          </div>
        </div>

        {/* KPI 2: AGV En Route */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                AGV Replenish En Route
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono mt-0.5">
                {inTransitCount} {inTransitCount === 1 ? 'Bin' : 'Bins'}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Tugger cart in-flight delivery
          </div>
        </div>

        {/* KPI 3: Critical Empty */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                Critical Starvation
              </div>
              <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                {criticalCount} {criticalCount === 1 ? 'Bin' : 'Bins'}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            Requires immediate line dispatch
          </div>
        </div>

        {/* KPI 4: Turnaround Time */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                Avg AGV Cycle Time
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono mt-0.5">
                18.4 min
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
            Target SLA: &lt; 25.0 min
          </div>
        </div>
      </div>

      {/* Enterprise Filter & Search Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 mr-2 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by Bin ID, Station, Part Number, or Supplier..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Bin States</option>
            <option value="FULL">Staged & Ready</option>
            <option value="REPLENISH_TRIGGERED">AGV En Route</option>
            <option value="CRITICAL_EMPTY">Critical Empty</option>
          </select>

          {/* Line filter */}
          <select
            value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Assembly Lines</option>
            <option value="LINE-HP-TURBINE">Turbine Rotor Cell</option>
            <option value="LINE-AVIONICS-INT">Avionics Integration</option>
            <option value="LINE-NACELLE-WELD">Nacelle Weld Cell</option>
            <option value="LINE-ACTUATOR-CAL">Actuator Calibration</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL' || lineFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                lineFilter !== 'ALL' && setLineFilter('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white px-2 py-1 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main View: Card Grid or Data Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBins.map((bin) => {
            const fillPercent = Math.round((bin.current_level / bin.capacity) * 100);
            const isCritical = bin.status === 'CRITICAL_EMPTY';
            const isTriggered = bin.status === 'REPLENISH_TRIGGERED';

            return (
              <div
                key={bin.id}
                className={cn(
                  'bg-white dark:bg-[#1c1c1e] border rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group',
                  isCritical
                    ? 'border-rose-300 dark:border-rose-900/60'
                    : isTriggered
                    ? 'border-amber-300 dark:border-amber-900/60'
                    : 'border-slate-200 dark:border-neutral-800'
                )}
              >
                {/* Left accent border strip */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1',
                    isCritical ? 'bg-rose-500' : isTriggered ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                />

                <div className="ml-1">
                  {/* Top line with code and status badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white">
                      <QrCode className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bin.bin_code}</span>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs font-mono',
                        isCritical
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : isTriggered
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      )}
                    >
                      {isCritical ? 'Critical Starvation' : isTriggered ? 'AGV En Route' : 'Staged & Ready'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                    {bin.line_code} • {bin.station_code}
                  </div>

                  {/* Part Title and Part Number */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-2 line-clamp-1 leading-snug">
                    {bin.part_name}
                  </h3>
                  <div className="text-xs font-mono text-slate-500 dark:text-neutral-400 mt-0.5">
                    PN: <span className="text-slate-700 dark:text-neutral-300 font-semibold">{bin.part_number}</span>
                  </div>

                  {/* Clean 4px capacity progress runway */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80">
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-500 dark:text-neutral-400 text-[11px]">Buffer Capacity</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {bin.current_level} / {bin.capacity} <span className="text-[11px] text-slate-400 font-normal">({fillPercent}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          isCritical ? 'bg-rose-500' : isTriggered ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${Math.min(fillPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-3 flex items-center justify-between">
                    <span>Vendor: <strong className="text-slate-700 dark:text-neutral-300 font-medium">{bin.supplier_vendor}</strong></span>
                    <span className="font-mono text-[10px] text-slate-400">RFID: 120Hz OK</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between gap-2 ml-1">
                  {bin.status !== 'REPLENISH_TRIGGERED' && bin.status !== 'FULL' && (
                    <button
                      onClick={() => handleTrigger(bin.id, bin.bin_code)}
                      className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Call Automated AGV Tugger</span>
                    </button>
                  )}

                  {bin.status === 'REPLENISH_TRIGGERED' && (
                    <button
                      onClick={() => handleRestock(bin.id, bin.bin_code)}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Bin Drop / Restock</span>
                    </button>
                  )}

                  {bin.status === 'FULL' && (
                    <div className="w-full py-1.5 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                      Line-Side Buffer Staged
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Bin Code / RFID</th>
                  <th className="px-4 py-3">Line & Station</th>
                  <th className="px-4 py-3">Component / Part #</th>
                  <th className="px-4 py-3">Capacity Buffer</th>
                  <th className="px-4 py-3">Supplier Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {filteredBins.map((bin) => {
                  const fillPercent = Math.round((bin.current_level / bin.capacity) * 100);
                  const isCritical = bin.status === 'CRITICAL_EMPTY';
                  const isTriggered = bin.status === 'REPLENISH_TRIGGERED';

                  return (
                    <tr key={bin.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{bin.bin_code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-neutral-300 font-mono whitespace-nowrap">
                        <div>{bin.line_code}</div>
                        <div className="text-[10px] text-slate-400">{bin.station_code}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{bin.part_name}</div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">{bin.part_number}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                isCritical ? 'bg-rose-500' : isTriggered ? 'bg-amber-500' : 'bg-emerald-500'
                              )}
                              style={{ width: `${Math.min(fillPercent, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                            {bin.current_level}/{bin.capacity} ({fillPercent}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-neutral-300 whitespace-nowrap">
                        {bin.supplier_vendor}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs font-mono',
                            isCritical
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : isTriggered
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          )}
                        >
                          {isCritical ? 'Critical Starvation' : isTriggered ? 'AGV En Route' : 'Staged & Ready'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {bin.status === 'CRITICAL_EMPTY' && (
                          <button
                            onClick={() => handleTrigger(bin.id, bin.bin_code)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded transition-colors cursor-pointer"
                          >
                            Call AGV
                          </button>
                        )}
                        {bin.status === 'REPLENISH_TRIGGERED' && (
                          <button
                            onClick={() => handleRestock(bin.id, bin.bin_code)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded transition-colors cursor-pointer"
                          >
                            Confirm Restock
                          </button>
                        )}
                        {bin.status === 'FULL' && (
                          <span className="text-slate-400 dark:text-neutral-500 text-xs font-mono">
                            Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
