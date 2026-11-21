'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminSupplyChainStore } from '@/stores/useAdminSupplyChainStore';
import {
  Boxes,
  Building2,
  Factory,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Power,
  Sliders,
  DollarSign,
  Lock,
  Unlock,
} from 'lucide-react';

export default function PortalGovernancePage() {
  const router = useRouter();
  const {
    suppliers,
    freezeSupplier,
    unfreezeSupplier,
    updateSupplierTier,
    plantLines,
    overrideLineStatus,
    pendingPOs,
    approvePO,
    holdPO,
    rejectPO,
    federatePortalClearance,
  } = useAdminSupplyChainStore();

  const [activeTab, setActiveTab] = useState<'federation' | 'suppliers' | 'plants' | 'po-approval'>('federation');
  const [freezeModalSupplier, setFreezeModalSupplier] = useState<string | null>(null);
  const [freezeReason, setFreezeReason] = useState('Quality non-conformance flag from Line WA01-01');

  const handleLaunchPortal = (portal: 'OPERATOR' | 'SUPPLIER' | 'MANUFACTURER') => {
    federatePortalClearance(portal);
    const destination =
      portal === 'OPERATOR'
        ? '/command-center'
        : portal === 'SUPPLIER'
        ? '/supplier'
        : '/manufacturer';
    router.push(destination);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
              CROSS-PORTAL FEDERATION TOWER
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Portal Controls & Enterprise Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            Control supplier tiers, assembly line tolerances, high-value PO signoffs, and launch portals with federated clearance.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl shrink-0">
          {[
            { id: 'federation', label: 'Portal Federation' },
            { id: 'suppliers', label: `Suppliers (${suppliers.length})` },
            { id: 'plants', label: `Plant Lines (${plantLines.length})` },
            { id: 'po-approval', label: `PO Approvals (${pendingPOs.filter((p) => p.status === 'PENDING_ADMIN_APPROVAL').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#18181b] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PORTAL FEDERATION & LAUNCHER                                       */}
      {/* ========================================================================= */}
      {activeTab === 'federation' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Operator Command Center Tile */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Boxes className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                  ACTIVE
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                Operator Command Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed mb-4">
                Global supply chain digital twin, real-time disruption simulation sandbox, AI recovery planning, and SAP CAP execution engine.
              </p>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-neutral-400 mb-6">
                <div className="flex justify-between">
                  <span>Target Route:</span>
                  <strong className="font-mono text-slate-900 dark:text-white">/command-center</strong>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Role:</span>
                  <strong className="font-mono text-indigo-600 dark:text-indigo-400">LEAD_OPERATOR</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchPortal('OPERATOR')}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Federate & Launch Operator Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Supplier Portal Tile */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                  ONLINE
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                Supplier Enterprise Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed mb-4">
                Tier-1 / Tier-2 supplier purchase order acknowledgments, warehouse inventory tracking, ASN dispatching, and early disruption reporting.
              </p>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-neutral-400 mb-6">
                <div className="flex justify-between">
                  <span>Target Route:</span>
                  <strong className="font-mono text-slate-900 dark:text-white">/supplier</strong>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Role:</span>
                  <strong className="font-mono text-blue-600 dark:text-blue-400">TIER_1_SUPPLIER</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchPortal('SUPPLIER')}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Federate & Launch Supplier Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Manufacturer Plant Portal Tile */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Factory className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                  OPERATIONAL
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                Manufacturer Assembly Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed mb-4">
                Real-time assembly line OEE monitoring, SCADA downtime triggers, Kanban bin replenishment signals, and work order dispatch.
              </p>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-neutral-400 mb-6">
                <div className="flex justify-between">
                  <span>Target Route:</span>
                  <strong className="font-mono text-slate-900 dark:text-white">/manufacturer</strong>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Role:</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400">PLANT_DIRECTOR</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchPortal('MANUFACTURER')}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Federate & Launch Plant Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUPPLIER GOVERNANCE & SLA CONTROLS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'suppliers' && (
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-neutral-800">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Supplier Tier Governance & Status Overrides
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Set tier classifications, freeze non-compliant vendors, and adjust lead-time SLA variance.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Vendor / ID</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">OTIF SLA</th>
                  <th className="px-4 py-3">Buffer</th>
                  <th className="px-5 py-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{sup.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {sup.id} · {sup.vendor_code} · {sup.country}
                      </div>
                      {sup.freeze_reason && (
                        <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                          Reason: {sup.freeze_reason}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={sup.tier}
                        onChange={(e) => updateSupplierTier(sup.id, e.target.value as any)}
                        className="bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-xs font-semibold cursor-pointer"
                      >
                        <option value="TIER_1">Tier 1</option>
                        <option value="TIER_2">Tier 2</option>
                        <option value="TIER_3">Tier 3</option>
                      </select>
                    </td>

                    <td className="px-4 py-4 text-slate-600 dark:text-neutral-300 font-mono">
                      {sup.category}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                          sup.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : sup.status === 'RESTRICTED'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                        }`}
                      >
                        {sup.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-mono">
                      <span className={sup.current_otif < sup.otif_sla_percent ? 'text-red-500 font-bold' : 'text-slate-900 dark:text-white'}>
                        {sup.current_otif}%
                      </span>
                      <span className="text-slate-400 text-[10px]"> (Target: {sup.otif_sla_percent}%)</span>
                    </td>

                    <td className="px-4 py-4 font-mono text-slate-700 dark:text-neutral-300">
                      +{sup.lead_time_buffer_days}d buffer
                    </td>

                    <td className="px-5 py-4 text-right">
                      {sup.status === 'FROZEN' ? (
                        <button
                          onClick={() => unfreezeSupplier(sup.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unfreeze</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setFreezeModalSupplier(sup.id);
                            freezeSupplier(sup.id, freezeReason);
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Emergency Freeze</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLANT LINE ORCHESTRATOR                                            */}
      {/* ========================================================================= */}
      {activeTab === 'plants' && (
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-neutral-800">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Assembly Plant & Production Line Orchestrator
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Live status override for robotic manufacturing cells, starvation tolerances, and OEE targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5">
            {plantLines.map((line) => {
              const isRunning = line.status === 'RUNNING';
              const isStarved = line.status === 'STARVED';

              return (
                <div
                  key={line.id}
                  className={`p-5 rounded-2xl border ${
                    isRunning
                      ? 'bg-slate-50 dark:bg-neutral-900/60 border-slate-200 dark:border-neutral-800'
                      : isStarved
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50'
                      : 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-slate-400">{line.plant_code}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        isRunning
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                          : isStarved
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                      }`}
                    >
                      {line.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{line.name}</h3>
                  <div className="text-xs text-slate-500 mb-4">{line.plant_name}</div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-neutral-400 mb-5">
                    <div className="flex justify-between">
                      <span>Current OEE:</span>
                      <strong className="font-mono text-slate-900 dark:text-white">{line.current_oee}% (Target: {line.oee_target}%)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Throughput Rate:</span>
                      <strong className="font-mono text-slate-900 dark:text-white">{line.current_rate_per_hr} units/hr</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Idle Downtime Cost:</span>
                      <strong className="font-mono text-red-600 dark:text-red-400">${line.idle_cost_per_hr.toLocaleString()}/hr</strong>
                    </div>
                  </div>

                  {line.override_notes && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-950/40 p-2.5 rounded-xl mb-4">
                      {line.override_notes}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => overrideLineStatus(line.id, isRunning ? 'STARVED' : 'RUNNING', isRunning ? 'Admin scheduled downtime test' : undefined)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isRunning
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isRunning ? 'Simulate Line Starve' : 'Restore Line Running'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HIGH-VALUE PURCHASE ORDER APPROVALS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'po-approval' && (
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-neutral-800">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Dual-Custody High-Value PO Approval Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Orders exceeding $100,000 require Administrator dual-signoff prior to SAP CAP outbound BAPI dispatch.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">PO Number</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Line Item</th>
                  <th className="px-4 py-3">Total Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Dual Signoff Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
                {pendingPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {po.po_number}
                    </td>

                    <td className="px-4 py-4 text-slate-700 dark:text-neutral-300">
                      <div>{po.supplier_name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{po.supplier_id}</span>
                    </td>

                    <td className="px-4 py-4 text-slate-600 dark:text-neutral-300">
                      {po.item_name} ({po.quantity.toLocaleString()} units)
                    </td>

                    <td className="px-4 py-4 font-mono font-black text-slate-900 dark:text-white">
                      ${po.total_value.toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                          po.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : po.status === 'PENDING_ADMIN_APPROVAL'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {po.status === 'PENDING_ADMIN_APPROVAL' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approvePO(po.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Approve PO
                          </button>
                          <button
                            onClick={() => holdPO(po.id, 'Under audit review')}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-neutral-700 hover:bg-slate-300 text-slate-700 dark:text-neutral-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Hold
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

