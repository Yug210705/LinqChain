'use client';

import React, { useState } from 'react';
import { useManufacturerStore, WorkOrder } from '@/stores/useManufacturerStore';
import {
  Layers,
  Search,
  Filter,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Box,
  Truck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManufacturerWorkOrdersPage() {
  const { workOrders, dispatchWorkOrder, pauseWorkOrder, completeWorkOrder, expediteShortage } = useManufacturerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [expandedWoId, setExpandedWoId] = useState<string | null>(workOrders[1]?.id || null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.wo_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || wo.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAction = (type: 'dispatch' | 'pause' | 'complete', woId: string, woNum: string) => {
    if (type === 'dispatch') dispatchWorkOrder(woId);
    if (type === 'pause') pauseWorkOrder(woId);
    if (type === 'complete') completeWorkOrder(woId);

    setActionNotice(`Work Order ${woNum} transitioned to ${type.toUpperCase()}. MES floor queue updated.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleExpedite = (woId: string, partNumber: string, partName: string) => {
    expediteShortage(woId, partNumber);
    setActionNotice(`Priority replenishment triggered for ${partName} (${partNumber}). Starvation cleared.`);
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
            <span className="text-emerald-600 dark:text-emerald-400">Work Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Work Orders & BOM Shortages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Production line allocations, real-time bill-of-materials shortage tracking, and supplier expedite dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300">
            Active Orders: <strong className="text-emerald-600 dark:text-emerald-400">{workOrders.length}</strong>
          </span>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by WO #, Product Name, or SKU..."
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
            <option value="ALL">All Order States</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="PAUSED">Paused</option>
            <option value="QC_HOLD">QC Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL_AOG">Critical AOG</option>
            <option value="EXPEDITE">Expedite</option>
            <option value="ROUTINE">Routine</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white px-2 py-1 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((wo) => {
          const isExpanded = expandedWoId === wo.id;
          const progress = Math.round((wo.completed_quantity / wo.target_quantity) * 100);
          const hasShortage = wo.bom_shortages.some((b) => b.status === 'SHORTAGE');

          return (
            <div
              key={wo.id}
              className={cn(
                'bg-white dark:bg-[#1c1c1e] border rounded-xl transition-all overflow-hidden shadow-xs',
                hasShortage
                  ? 'border-amber-300 dark:border-amber-900/60'
                  : 'border-slate-200 dark:border-neutral-800'
              )}
            >
              {/* Order Card Header */}
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                        {wo.wo_number}
                      </span>
                      <span className="text-xs font-mono text-slate-400">[{wo.sku}]</span>
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs font-mono',
                          wo.priority === 'CRITICAL_AOG'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : wo.priority === 'EXPEDITE'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700'
                        )}
                      >
                        {wo.priority}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded font-mono',
                          wo.status === 'IN_PRODUCTION'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : wo.status === 'PAUSED'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                            : wo.status === 'QC_HOLD'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400'
                        )}
                      >
                        {wo.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {wo.product_name}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-neutral-400 mt-1.5 font-mono">
                      <span>Cell: <strong className="text-slate-700 dark:text-neutral-300">{wo.line_id.toUpperCase()}</strong></span>
                      <span>Target: <strong className="text-slate-700 dark:text-neutral-300">{wo.target_quantity} Units</strong></span>
                      <span>Completed: <strong className="text-emerald-600 dark:text-emerald-400">{wo.completed_quantity}</strong></span>
                      {wo.scrapped_quantity > 0 && (
                        <span>Scrap: <strong className="text-rose-500">{wo.scrapped_quantity}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls: Progress Runway & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-36">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-500 dark:text-neutral-400 text-[11px]">Runway</span>
                      <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-300', hasShortage ? 'bg-amber-500' : 'bg-emerald-500')}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {wo.status === 'PAUSED' && (
                      <button
                        onClick={() => handleAction('dispatch', wo.id, wo.wo_number)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>
                    )}
                    {wo.status === 'IN_PRODUCTION' && (
                      <button
                        onClick={() => handleAction('pause', wo.id, wo.wo_number)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Hold</span>
                      </button>
                    )}
                    {wo.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleAction('complete', wo.id, wo.wo_number)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedWoId(isExpanded ? null : wo.id)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-300 cursor-pointer"
                      title={isExpanded ? 'Collapse BOM' : 'Expand Bill of Materials'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Bill-of-Materials Section */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/60 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                      <Box className="w-4 h-4 text-emerald-500" />
                      <span>Required Components (Bill of Materials)</span>
                    </h4>
                    {hasShortage && (
                      <span className="text-xs font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Material Starvation Detected
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {wo.bom_shortages.map((item) => {
                      const isShortage = item.status === 'SHORTAGE';
                      const isLow = item.status === 'LOW';

                      return (
                        <div
                          key={item.part_number}
                          className={cn(
                            'p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white dark:bg-[#18181b]',
                            isShortage
                              ? 'border-amber-300 dark:border-amber-900/60'
                              : 'border-slate-200 dark:border-neutral-800'
                          )}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">{item.part_number}</span>
                              <span
                                className={cn(
                                  'text-[9px] font-mono font-bold px-1.5 py-0.2 rounded',
                                  isShortage
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                                    : isLow
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                )}
                              >
                                {item.status}
                              </span>
                            </div>
                            <div className="font-semibold text-slate-800 dark:text-neutral-200 mt-0.5">
                              {item.part_name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                              Supplier: <span className="text-slate-700 dark:text-neutral-300 font-medium">{item.supplier_name}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right font-mono">
                              <span className="text-[10px] text-slate-400 uppercase block">Required / Available</span>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {item.available} / {item.required}
                              </span>
                            </div>

                            {isShortage && (
                              <button
                                onClick={() => handleExpedite(wo.id, item.part_number, item.part_name)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span>Expedite Part</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
