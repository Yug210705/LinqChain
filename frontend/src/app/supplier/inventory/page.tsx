'use client';

import React, { useState } from 'react';
import { useSupplierStore, SupplierInventoryItem } from '@/stores/useSupplierStore';
import { cn } from '@/lib/utils';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  History,
  TrendingDown,
  RefreshCw,
  Search,
  LayoutGrid,
  Table as TableIcon,
  ShieldAlert,
} from 'lucide-react';

export default function SupplierInventoryPage() {
  const { inventory, updateInventoryStock, supplierUser } = useSupplierStore();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [adjustItem, setAdjustItem] = useState<SupplierInventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(500);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch =
      item.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.warehouse_location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplyAdjustment = (delta: number) => {
    if (!adjustItem) return;
    updateInventoryStock(adjustItem.id, delta);
    setAdjustItem(null);
    showToast(
      `${delta > 0 ? 'Restocked' : 'Issued'} ${Math.abs(delta)} ${adjustItem.unit} for ${adjustItem.material_name}.`
    );
  };

  const healthyCount = inventory.filter((i) => i.status === 'HEALTHY').length;
  const warningCount = inventory.filter((i) => i.status === 'WARNING').length;
  const criticalCount = inventory.filter((i) => i.status === 'CRITICAL').length;

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
            <span className="text-blue-600 dark:text-blue-400 font-bold">Material Buffers & Stock</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Material Stock & Safety Buffers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Certified raw aerospace alloys, melt lot traceability, and minimum production safety runway
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-neutral-800 rounded-lg p-0.5 border border-slate-200 dark:border-neutral-700">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:white'
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:white'
              )}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-blue-600/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 4-Card KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Managed Lots</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {inventory.length} <span className="text-sm font-normal text-slate-400">Materials</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            100% AS9100D heat-lot traceability
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Healthy Runway</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            {healthyCount} <span className="text-sm font-normal text-slate-400">Lots</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            ≥ 20 days safety buffer verified
          </div>
        </div>

        <div className={cn(
          "bg-white dark:bg-[#18181b] border rounded-xl p-4 shadow-xs relative overflow-hidden group transition-all",
          warningCount > 0 ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60" : "border-slate-200 dark:border-neutral-800 hover:border-blue-500/30"
        )}>
          <div className={cn("absolute left-0 top-0 bottom-0 w-1", warningCount > 0 ? "bg-amber-500" : "bg-blue-500/80")} />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Warning Buffer</span>
            <AlertTriangle className={cn("w-4 h-4", warningCount > 0 ? "text-amber-500 animate-pulse" : "text-slate-400")} />
          </div>
          <div className={cn("text-2xl font-black font-mono tracking-tight", warningCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white")}>
            {warningCount}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            {warningCount > 0 ? "Approaching replenishment threshold" : "Zero lots at risk"}
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Depot Locations</span>
            <Warehouse className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            4 <span className="text-sm font-normal text-slate-400">Bays</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            Climate-controlled vacuum storage
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material, part code, warehouse bay..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'RAW_METALS', 'AVIONICS', 'COMPOSITES', 'FASTENERS'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold uppercase font-mono transition-colors cursor-pointer whitespace-nowrap',
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700'
              )}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Table Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredInventory.map((item) => {
            const fillPct = Math.min(100, Math.round((item.stock_on_hand / item.max_capacity) * 100));
            return (
              <div
                key={item.id}
                className={cn(
                  'bg-white dark:bg-[#18181b] border rounded-xl p-4 shadow-xs flex flex-col justify-between transition-all relative overflow-hidden group',
                  item.status === 'CRITICAL'
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : item.status === 'WARNING'
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-slate-200 dark:border-neutral-800 hover:border-blue-500/30'
                )}
              >
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1',
                    item.status === 'CRITICAL'
                      ? 'bg-rose-500'
                      : item.status === 'WARNING'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  )}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight truncate">
                      {item.material_name}
                    </div>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 border',
                        item.status === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : item.status === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse'
                      )}
                    >
                      {item.safety_buffer_days}d Runway
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 mb-3">
                    Part #{item.part_number} · {item.category.replace('_', ' ')}
                  </div>

                  {/* Stock Level Card */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/60 dark:border-neutral-800/60 mb-3">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                        {item.stock_on_hand.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        / {item.max_capacity.toLocaleString()} {item.unit}
                      </span>
                    </div>

                    {/* 4px subtle runway */}
                    <div className="w-full h-1 bg-slate-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          item.status === 'HEALTHY'
                            ? 'bg-emerald-500'
                            : item.status === 'WARNING'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        )}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-neutral-400 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Threshold:</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-neutral-300">
                        {item.min_threshold.toLocaleString()} {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Location:</span>
                      <span className="font-semibold text-slate-700 dark:text-neutral-300">
                        {item.warehouse_location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Melt:</span>
                      <span className="font-mono text-slate-400">{item.last_replenished}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustItem(item);
                      setAdjustDelta(500);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-md text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Restock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustItem(item);
                      setAdjustDelta(-250);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-md text-xs font-semibold bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Issue</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                  <th className="py-2.5 px-3">Material Name</th>
                  <th className="py-2.5 px-3">Part #</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Stock on Hand</th>
                  <th className="py-2.5 px-3">Safety Runway</th>
                  <th className="py-2.5 px-3">Depot Location</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {item.material_name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 dark:text-neutral-400">
                      {item.part_number}
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {item.stock_on_hand.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {item.safety_buffer_days} Days
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-neutral-300">
                      {item.warehouse_location}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border',
                          item.status === 'HEALTHY'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : item.status === 'WARNING'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse'
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustItem(item);
                            setAdjustDelta(500);
                          }}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
                        >
                          Restock
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustItem(item);
                            setAdjustDelta(-250);
                          }}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                        >
                          Issue
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-500" />
              <span>Adjust Inventory Lot</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
              Enter quantity delta for <span className="font-bold text-slate-900 dark:text-white">{adjustItem.material_name}</span>.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Stock Delta ({adjustItem.unit})
                </label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 block">
                  Positive values add inventory; negative values record outbound issues.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApplyAdjustment(adjustDelta)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
              >
                Apply Stock Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
