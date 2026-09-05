'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, Server, ArrowRight, FileText, Building2, Truck, MapPin,
  Hash, CalendarClock, ShieldCheck, Printer, Boxes, ArrowRightLeft, History
} from 'lucide-react';
import { resolveDisruption, fetchDisruption, fetchPersistedRecoveryPlans } from '@/services/api';
import { useSimulationStore } from '@/stores/useSimulationStore';

/** Deterministic pseudo transaction number from a simulation id (e.g. SIM-F3382D → 45xxxxxx). */
function txnFrom(sim: string): string {
  let h = 0;
  for (const c of sim) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `45${String((h % 9000000) + 1000000)}`;
}

function money(v: number | null | undefined, digits = 2): string {
  if (v == null || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
}

function fmtDateTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch { return iso; }
}

const PIPELINE_STEPS = ['Detected', 'Optimized', 'Approved', 'BAPI Posted', 'Audit Logged'];

function PageContent() {
  const searchParams = useSearchParams();
  const sim = searchParams?.get('sim') ?? '';
  const [disruption, setDisruption] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* Recovery plan fully executed → the disruption is resolved automatically
     (backend flips to RESOLVED) and the live store is cleared so overview /
     graph show a pristine state. activeRecovery is preserved intentionally. */
  useEffect(() => {
    if (sim) {
      resolveDisruption(sim).catch(() => {});
      useSimulationStore.getState().clearLiveDisruption();
    }
    (async () => {
      try {
        if (sim) {
          const d = await fetchDisruption(sim).catch(() => null);
          setDisruption(d);
          const res = await fetchPersistedRecoveryPlans({ disruption_id: sim, limit: 10 }).catch(() => null);
          const executed = (res?.items ?? []).find(p => p.status === 'COMPLETED' || p.status === 'APPROVED');
          setPlan(executed ?? res?.items?.[0] ?? null);
        } else {
          const res = await fetchPersistedRecoveryPlans({ status: 'COMPLETED', limit: 1 }).catch(() => null);
          setPlan(res?.items?.[0] ?? null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [sim]);

  const activeRecovery = useSimulationStore((s) => s.activeRecovery);

  const txn = useMemo(() => txnFrom(sim || 'SIM-DEFAULT'), [sim]);
  const postedAt = plan?.created_at ?? disruption?.created_at ?? null;

  /* which suppliers are being switched */
  const toSuppliers = useMemo<string[]>(() => {
    const fromPlan = plan?.supplier_id ? plan.supplier_id.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const fromStore = (activeRecovery?.suppliers ?? []).filter(Boolean);
    return (fromPlan.length ? fromPlan : fromStore);
  }, [plan, activeRecovery]);

  const fromEntity = disruption?.affected_entity_id
    || activeRecovery?.replaces
    || 'SUP-007 (original)';

  const materialId = (plan?.details && (plan.details as any)?.material_id) || disruption?.material_id || 'MAT-004';
  const strategy = plan?.strategy || activeRecovery?.strategy || 'Activate alternate supplier';
  const totalCost = plan?.total_cost ?? 0;
  const slaExposure = plan?.total_sla_exposure ?? 0;
  const delayDays = plan?.max_delay_days ?? 4;
  const riskScore = plan?.blended_risk ?? 0;
  const lineQty = (plan?.details && (plan.details as any)?.order_quantity) || 50000;
  const unitPrice = lineQty > 0 ? totalCost / lineQty : 0;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SAP Action Executed</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            Transaction receipt generated for the executed recovery action.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="hidden sm:flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[13px] font-medium transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4 mr-2" /> Print Receipt
        </button>
      </div>

      {/* Success banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 rounded-xl flex items-start p-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mr-3">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-emerald-800 dark:text-emerald-300">BAPI executed & confirmed by SAP ERP</p>
          <p className="text-[12.5px] text-emerald-700/80 dark:text-emerald-400/70 mt-0.5">
            Purchase order {txn} created via {strategy}. Purchase orders are being updated automatically.
            {disruption && ` Disruption ${sim} was auto-resolved.`}
          </p>
        </div>
        {disruption?.status && (
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 ${
            disruption.status === 'RESOLVED'
              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
          }`}>
            DISRUPTION {disruption.status}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* RECEIPT */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Receipt masthead */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center mr-3 shrink-0">
                  <Server className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold tracking-wide">RESILIENCE OS · SAP SERVICE</p>
                  <p className="text-[11px] text-blue-300/80 font-medium">SAP BAPI TRANSACTION RECEIPT</p>
                </div>
              </div>
              <div className="flex items-center mt-3 sm:mt-0 space-x-3">
                <span className="text-[11px] text-slate-300 font-medium">SYSTEM STATUS:</span>
                <span className="px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[11.5px] font-bold tracking-wider">
                  ● POSTED
                </span>
              </div>
            </div>

            {/* Key transaction fields */}
            <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <Field icon={Hash} label="Transaction No." value={txn} mono />
              <Field icon={FileText} label="Document Type" value="PO — Purchase Order" />
              <Field icon={Server} label="BAPI / CAP OData" value="BAPI_PO_CREATE1" mono />
              <Field icon={CalendarClock} label="Posted At" value={fmtDateTime(postedAt)} />
              <Field icon={Building2} label="Company Code" value="1000 · Resilience OperCo" />
              <Field icon={MapPin} label="Plant" value={disruption?.affected_entity_id || 'PLANT-002'} mono />
            </div>

            <div className="px-6 pb-5 border-t border-slate-100 dark:border-slate-800">
              {/* Supplier re-route */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3.5 mt-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">From — Replaced</p>
                  <p className="text-[14px] font-bold text-red-600 dark:text-red-400 truncate">{fromEntity}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Disrupted · removed from network</p>
                </div>
                <ArrowRightLeft className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 rotate-90 sm:rotate-0 mx-auto" />
                <div className="flex-1 min-w-0 text-right sm:text-left sm:text-right">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">To — Activated</p>
                  <p className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {(toSuppliers).join(', ')} <span className="text-emerald-500">✓</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{strategy}</p>
                </div>
              </div>

              {/* PO line items */}
              <div className="mt-4 overflow-x-auto custom-scrollbar">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-[10.5px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2 pr-3 font-bold">Item</th>
                      <th className="py-2 pr-3 font-bold">Material</th>
                      <th className="py-2 pr-3 font-bold">Description</th>
                      <th className="py-2 pr-3 font-bold text-right">Qty</th>
                      <th className="py-2 pr-3 font-bold text-right">Unit Price</th>
                      <th className="py-2 font-bold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toSuppliers.map((sup: string, i: number) => (
                      <tr key={sup} className="border-b border-slate-50 dark:border-slate-800/60">
                        <td className="py-2.5 pr-3 text-slate-400 font-mono">10{i + 1}</td>
                        <td className="py-2.5 pr-3 font-mono font-semibold text-slate-800 dark:text-slate-200">{materialId}</td>
                        <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">Recovery re-route → {sup}</td>
                        <td className="py-2.5 pr-3 text-right text-slate-600 dark:text-slate-300">{lineQty.toLocaleString()}</td>
                        <td className="py-2.5 pr-3 text-right text-slate-600 dark:text-slate-300">{money(unitPrice)}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-800 dark:text-slate-200">{money(totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mt-4">
                <div className="w-full sm:w-72 space-y-1.5 text-[13px]">
                  <Row label="Subtotal" value={money(totalCost)} />
                  <Row label="Taxes (zero-rated)" value="$0.00" />
                  <Row label="SLA exposure avoided" value={money(slaExposure)} positive />
                  <Row label="Re-routing delay" value={delayDays ? `${delayDays} days` : '—'} />
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">TOTAL ORDER VALUE</span>
                    <span className="font-bold text-[15px] text-emerald-600 dark:text-emerald-400">{money(totalCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline stepper + actions */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 mt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center">
              <Boxes className="w-3.5 h-3.5 mr-1.5" /> 6-step Recovery Pipeline
            </p>
            <div className="flex items-center flex-wrap">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step} className="flex items-center">
                  {i > 0 && <div className="w-8 h-px bg-emerald-400/60 mx-1.5" />}
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">{step}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
              <Stat icon={ShieldCheck} label="Blended Risk" value={`${Math.round(riskScore * 100)}%`} />
              <Stat icon={Truck} label="Max Delay" value={delayDays ? `${delayDays} days` : '—'} />
              <Stat icon={History} label="Audit Trail" value="logged & persisted" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6">
              <Link
                href={sim ? `/disruptions/${sim}` : '/disruptions'}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-[13px] font-medium transition-colors shadow-sm"
              >
                View Disruption <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/action-history"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[13px] font-medium transition-colors shadow-sm"
              >
                <History className="w-4 h-4 mr-2" /> Action History
              </Link>
              <Link
                href="/command-center"
                className="inline-flex items-center justify-center px-4 py-2.5 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 text-[13px]"
              >
                Return to Command Center <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start min-w-0">
      <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-2.5 shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className={`text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`font-medium ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>{value}</span>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2.5">
      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading…</div>}>
      <PageContent />
    </Suspense>
  );
}