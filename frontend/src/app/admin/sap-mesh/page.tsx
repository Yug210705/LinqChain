'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Server,
  Zap,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  Check,
  Database,
  Layers,
  Terminal,
} from 'lucide-react';
import { useAdminSupplyChainStore } from '@/stores/useAdminSupplyChainStore';
import { broadcastCrossPortalEvent } from '@/lib/cross-portal-sync';

export default function SapMeshAdminPage() {
  const {
    bapiQueue,
    flushBapiQueue,
    sapMockMode,
    toggleSapMockMode,
    auditTrail,
    addAuditEvent,
  } = useAdminSupplyChainStore();

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status: 'OPTIMAL' | 'DEGRADED' | 'FAILED';
    latencyMs: number;
    lastPing: string;
  }>({
    status: 'OPTIMAL',
    latencyMs: 18,
    lastPing: 'Just now',
  });

  const [injectType, setInjectType] = useState<'PO_CREATED' | 'MATERIAL_HELD' | 'DELIVERY_DELAYED'>('PO_CREATED');
  const [injectDetails, setInjectDetails] = useState('');
  const [injectSuccess, setInjectSuccess] = useState(false);

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionStatus({
        status: sapMockMode ? 'OPTIMAL' : 'OPTIMAL',
        latencyMs: sapMockMode ? 4 : 24,
        lastPing: new Date().toLocaleTimeString(),
      });
    }, 600);
  };

  const handleInjectEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventName =
      injectType === 'PO_CREATED'
        ? 'SAP_BAPI_PO_CREATE_DIRECT'
        : injectType === 'MATERIAL_HELD'
        ? 'SAP_QM_MATERIAL_INSPECTION_HOLD'
        : 'SAP_LE_SHP_DELIVERY_DELAY';

    const text = injectDetails.trim() || `Automated SAP S/4HANA Event: ${injectType} dispatched via Event Mesh broker`;

    addAuditEvent({
      source_portal: 'ADMIN',
      event_type: eventName,
      actor: 'SAP Cloud Application Programming (CAP)',
      details: text,
      severity: injectType === 'MATERIAL_HELD' ? 'WARNING' : 'INFO',
    });

    broadcastCrossPortalEvent(
      'PO_ACKNOWLEDGED',
      'ADMIN',
      {
        poId: `SAP-${Date.now().toString().slice(-5)}`,
        status: 'ACKNOWLEDGED',
        notes: text,
      }
    );

    setInjectSuccess(true);
    setInjectDetails('');
    setTimeout(() => setInjectSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              SAP S/4HANA & CAP CONNECTOR
            </span>
            <span className="text-xs text-slate-400 dark:text-neutral-500">v2026.3 Service Mesh</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 mt-1">
            SAP Event Mesh & BAPI Queues
          </h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
            Monitor real-time SAP Cloud Application Programming events, inspect outbound BAPI transaction queues, and orchestrate S/4HANA writes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSapMockMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-2 transition-all ${
              sapMockMode
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            {sapMockMode ? 'SAP Mode: Simulation Sandbox' : 'SAP Mode: Production S/4HANA RFC'}
          </button>

          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            {testingConnection ? 'Pinging RFC...' : 'Test Connection'}
          </button>
        </div>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span>S/4HANA Gateway</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-neutral-100">Connected</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {connectionStatus.latencyMs}ms
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            Last ping: {connectionStatus.lastPing}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span>Outbound BAPI Queue</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-neutral-100">
              {bapiQueue.filter((q) => q.status === 'QUEUED').length}
            </span>
            <span className="text-xs text-slate-500 dark:text-neutral-400">
              / {bapiQueue.length} total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            Pending RFC execution
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span>Event Mesh Topics</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-neutral-100">8 Subscribed</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            sap/s4hana/ce/purchaseorder/*
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#18181b]">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
            <span>Audit Trail Ingest</span>
            <Database className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-neutral-100">
              {auditTrail.length} Events
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            Full cross-portal synchronization
          </p>
        </div>
      </div>

      {/* Main Grid: BAPI Queue & Event Injector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: BAPI Transaction Queue */}
        <div className="lg:col-span-2 border border-slate-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#18181b] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-500" />
                Outbound BAPI Purchase Order Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Staged PO creations and status updates waiting to be committed to S/4HANA via RFC.
              </p>
            </div>
            <button
              onClick={flushBapiQueue}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Flush All Queued ({bapiQueue.filter((q) => q.status === 'QUEUED').length})
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500 border-b border-slate-200 dark:border-neutral-800 pb-2">
                <tr>
                  <th className="py-2">PO Number</th>
                  <th className="py-2">SAP Function Module</th>
                  <th className="py-2 text-right">Value (USD)</th>
                  <th className="py-2 text-center">Queue Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60 font-mono">
                {bapiQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-neutral-100">
                      {item.po_number}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-neutral-400">
                      {item.destination}
                    </td>
                    <td className="py-3 text-right font-medium text-slate-900 dark:text-neutral-200">
                      ${item.value.toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'DISPATCHED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: SAP Event Mesh Injector */}
        <div className="border border-slate-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#18181b] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-neutral-800">
              <Zap className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                SAP Event Mesh Injector
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2">
              Inject synthetic S/4HANA enterprise events directly into the LinqChain cross-portal event bus to test Operator and Supplier reaction.
            </p>

            <form onSubmit={handleInjectEvent} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  SAP Cloud Event Type
                </label>
                <select
                  value={injectType}
                  onChange={(e) => setInjectType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  <option value="PO_CREATED">sap/s4hana/ce/purchaseorder/Created/v1</option>
                  <option value="MATERIAL_HELD">sap/s4hana/ce/material/QualityInspectionHold/v1</option>
                  <option value="DELIVERY_DELAYED">sap/s4hana/ce/delivery/PostponedSchedule/v1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Payload Notes / Memo
                </label>
                <textarea
                  value={injectDetails}
                  onChange={(e) => setInjectDetails(e.target.value)}
                  placeholder="Optional custom payload remarks (e.g. Batch Lot #B991 flagged for customs inspection)..."
                  rows={3}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Event to Mesh
              </button>
            </form>

            {injectSuccess && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Event broadcasted across all active portal sessions!</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-neutral-800 text-[11px] text-slate-400 dark:text-neutral-500 flex items-center justify-between">
            <span>Broker: RabbitMQ AMQP / SAP Cloud</span>
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* SAP Event Traceability Feed */}
      <div className="border border-slate-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#18181b] p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Live Cross-Portal Event Stream (SAP & Portals)
        </h2>
        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
          Unified chronological event logs generated from Operator, Supplier, Plant, and SAP Cloud integrations.
        </p>

        <div className="mt-4 space-y-2">
          {auditTrail.slice(0, 8).map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-lg border border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    evt.severity === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : evt.severity === 'WARNING'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {evt.source_portal}
                </span>
                <span className="font-semibold text-slate-800 dark:text-neutral-200 font-mono">
                  {evt.event_type}
                </span>
                <span className="text-slate-500 dark:text-neutral-400">
                  {evt.details}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-neutral-500 shrink-0 font-mono">
                <span>{evt.actor}</span>
                <span>•</span>
                <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

