'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminSupplyChainStore } from '@/stores/useAdminSupplyChainStore';
import {
  Boxes,
  Globe2,
  Anchor,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Leaf,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass,
  Ship,
  Sparkles,
  Download,
} from 'lucide-react';

export default function SupplyChainTowerPage() {
  const { chokepoints, setChokepointStatus, suppliers, plantLines } = useAdminSupplyChainStore();
  const [selectedChokepoint, setSelectedChokepoint] = useState<string | null>(null);

  const activeDisruptionsCount = suppliers.filter((s) => s.status !== 'ACTIVE').length;
  const criticalChokepoints = chokepoints.filter((c) => c.status === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              GLOBAL VISIBILITY TOWER v2.4
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Supply Chain Control Tower & Maritime Chokepoints
          </h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            Real-time multi-tier topology oversight, maritime chokepoints, and cross-portal buffer allocations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/command-center"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Launch Operator Digital Twin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181b] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Network Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">98.4%</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+0.8% resilience vs last sprint</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Chokepoints</span>
            <Anchor className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {criticalChokepoints} of {chokepoints.length}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Port Beta Corridor elevated
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Suppliers</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
            {suppliers.filter((s) => s.status === 'ACTIVE').length} / {suppliers.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-neutral-400">
            {activeDisruptionsCount} restricted / frozen
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">ESG Scope 3 Intensity</span>
            <Leaf className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">142 g/ton-km</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Within ISO-14064 threshold
          </div>
        </div>
      </div>

      {/* Strategic Maritime & Port Chokepoints Section */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ship className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Strategic Maritime Transit Chokepoints & Ports
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Governed choke-point bottlenecks affecting international cargo routing and lead-time calculations.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-5">
          {chokepoints.map((chk) => {
            const isCritical = chk.status === 'CRITICAL';
            const isElevated = chk.status === 'ELEVATED';

            return (
              <div
                key={chk.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-900/50'
                    : isElevated
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50'
                    : 'bg-slate-50 dark:bg-neutral-900/50 border-slate-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                      isCritical
                        ? 'bg-red-500 text-white'
                        : isElevated
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300'
                    }`}
                  >
                    {chk.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                    {chk.location}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                  {chk.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-neutral-400 mb-3.5">
                  <div className="flex justify-between">
                    <span>Congestion Score:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{chk.congestion_score}/100</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Vessel Queue:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{chk.vessel_queue_count} ships</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Delay:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">+{chk.avg_delay_days} days</strong>
                  </div>
                </div>

                {/* Admin Quick Action */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setChokepointStatus(chk.id, isCritical ? 'NOMINAL' : 'CRITICAL', isCritical ? 0.8 : 4.5)}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isCritical
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isCritical ? 'Clear Bottleneck' : 'Flag Congestion'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Tier Buffer Allocation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Stockpile Manager */}
        <div className="bg-white dark:bg-[#18181b] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Strategic Safety Stock Buffers
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { material: 'Ti-6Al-4V Titanium Ingots', bufferDays: 28, currentStock: '18,400 KG', status: 'HEALTHY' },
              { material: 'Inconel 718 Vacuum Melted Rods', bufferDays: 9, currentStock: '2,100 KG', status: 'WARNING' },
              { material: 'Pre-preg Carbon Composite Tape', bufferDays: 35, currentStock: '9,400 SQM', status: 'HEALTHY' },
              { material: 'Silicon-Nitride Seal Rings', bufferDays: 4, currentStock: '850 PCS', status: 'CRITICAL' },
            ].map((m) => (
              <div
                key={m.material}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{m.material}</h4>
                  <span className="text-xs text-slate-500 dark:text-neutral-400">
                    Stock on hand: {m.currentStock} · Buffer: {m.bufferDays} days
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                    m.status === 'HEALTHY'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                      : m.status === 'WARNING'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Carbon & ESG Monitor */}
        <div className="bg-white dark:bg-[#18181b] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Global Transport Decarbonization Index
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed mb-4">
              LinqChain automatically monitors Scope 3 emissions across active freight legs. Reroutes favored by autonomous AI factor in maritime vs air cargo carbon intensities.
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-neutral-400">Ocean Freight Optimization:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">84% green corridor compliance</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-neutral-400">Carbon Offset Ratio:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">76% of target</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '76%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-500">
            <span>Audit Standard: GHG Protocol Scope 3</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-neutral-300">Audited 1h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

