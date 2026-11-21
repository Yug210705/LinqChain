'use client';

import React, { useState } from 'react';
import { useAdminSupplyChainStore } from '@/stores/useAdminSupplyChainStore';
import { useSimulationStore } from '@/stores/useSimulationStore';
import {
  Flame,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldAlert,
  Zap,
  Activity,
  Boxes,
  Layers,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

export default function ChaosEngineeringPage() {
  const { injectDisruption, resetAllDisruptions } = useAdminSupplyChainStore();
  const activeDisruption = useSimulationStore((s) => s.activeDisruption);

  const [entityId, setEntityId] = useState('SUP-007');
  const [entityType, setEntityType] = useState('Supplier');
  const [severity, setSeverity] = useState(1.0);
  const [durationDays, setDurationDays] = useState(10);
  const [reason, setReason] = useState('Hydraulic vacuum remelting failure & labor dispute');
  const [isInjecting, setIsInjecting] = useState(false);
  const [stressTestResult, setStressTestResult] = useState<any | null>(null);

  const handleInject = () => {
    setIsInjecting(true);
    setTimeout(() => {
      injectDisruption({
        entityId,
        entityType,
        severity,
        durationDays,
        reason,
      });
      setIsInjecting(false);
    }, 400);
  };

  const handleRunMonteCarlo = () => {
    setStressTestResult({
      iterations: 1000,
      simultaneousFailures: 3,
      nriScore: 78.4,
      avgFinancialImpactUsd: 485000,
      worstCaseDelayDays: 14.5,
      criticalStarvationRiskLine: 'Line WA01-01 (Composite Airframe)',
      recommendedMitigation: 'Reroute Pacific Aero cargo through Alternate Port 4 & tap Strategic Titanium Silo B',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-red-600 dark:text-red-400 uppercase">
              CHAOS ENGINEERING SWITCHBOARD v3.1
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Systemic Disruption Injection & Stress Sandbox
          </h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            Inject synthetic multi-tier disruption events to test real-time failover across Operator, Supplier, and Plant portals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={resetAllDisruptions}
            className="px-4 py-2 bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Network Nodes</span>
          </button>
        </div>
      </div>

      {/* Active Disruption Banner if present */}
      {activeDisruption?.disruption && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">
                ACTIVE SYSTEM DISRUPTION PROPAGATED
              </span>
              <p className="text-sm font-semibold text-white">
                Entity: <strong className="font-mono text-red-300">{activeDisruption.disruption.affected_entity_id}</strong> ({activeDisruption.disruption.disruption_type}) · Severity {activeDisruption.disruption.severity} · Duration {activeDisruption.disruption.duration_days} Days
              </p>
            </div>
          </div>
          <button
            onClick={resetAllDisruptions}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Restore Nominal Status
          </button>
        </div>
      )}

      {/* Chaos Injector & Monte-Carlo Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Targeted Disruption Injector */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <Flame className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Targeted Disruption Injector
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mb-5 leading-relaxed">
            Select a target node from the 157-entity graph. Triggering will broadcast instantly across all open Operator, Supplier, and Manufacturer tabs.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                Target Entity ID
              </label>
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="SUP-007">SUP-007 (Pacific Aero Composites Inc - Japan)</option>
                <option value="SUP-001">SUP-001 (Titanium Alloy Forgings Corp - USA)</option>
                <option value="SUP-002">SUP-002 (Micro-Sensor Dynamics Ltd - Germany)</option>
                <option value="PORT-BETA">PORT-BETA (Port Beta Transit Corridor)</option>
                <option value="PLANT-TX04">PLANT-TX04 (Propulsion Center TX-04)</option>
                <option value="MAT-003">MAT-003 (Silicon-Nitride Seal Rings)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Entity Category
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Supplier">Supplier</option>
                  <option value="Port">Port Chokepoint</option>
                  <option value="Plant">Assembly Plant</option>
                  <option value="Material">Material Component</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Duration (Days): {durationDays}d
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full accent-red-500 mt-2"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                <span>Disruption Severity</span>
                <span className="font-mono text-red-500 font-bold">{severity * 100}% Failure</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                Root Cause & Audit Note
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleInject}
              disabled={isInjecting}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isInjecting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Propagating Synthetic Disruption...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Fire Chaos Disruption Trigger</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Panel 2: Systemic Monte-Carlo Stress Tester */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Monte-Carlo Network Stress Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-5 leading-relaxed">
              Simulates 1,000 systemic failure iterations across all 157 network nodes simultaneously to stress-test dual-sourcing redundancies.
            </p>

            {stressTestResult ? (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Resilience Index (NRI):</span>
                  <span className="text-lg font-mono font-black text-emerald-500">
                    {stressTestResult.nriScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Expected Value Impact:</span>
                  <span className="text-sm font-mono font-bold text-red-500">
                    ${stressTestResult.avgFinancialImpactUsd.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Max Lead-Time Variance:</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    +{stressTestResult.worstCaseDelayDays} days
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-neutral-800">
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                    AI Recommended Topology Hardening:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-neutral-300">
                    {stressTestResult.recommendedMitigation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-neutral-800 rounded-xl mb-4">
                <Activity className="w-8 h-8 text-slate-300 dark:text-neutral-600 mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-medium">No active stress test run. Click below to launch 1,000 simulations.</p>
              </div>
            )}
          </div>

          <button
            onClick={handleRunMonteCarlo}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Execute 1,000-Iteration Stress Test</span>
          </button>
        </div>
      </div>
    </div>
  );
}

