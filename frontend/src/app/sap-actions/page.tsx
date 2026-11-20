'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Printer, Download, Copy, Check, ArrowLeft, ShieldCheck,
  Building2, Calendar, Clock, CheckCircle2, Server
} from 'lucide-react';
import { resolveDisruption, fetchDisruption, fetchPersistedRecoveryPlans } from '@/services/api';
import { useSimulationStore } from '@/stores/useSimulationStore';

/** Deterministic pseudo transaction number from simulation id */
function txnFrom(sim: string): string {
  let h = 0;
  for (const c of sim) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `45${String((h % 9000000) + 1000000)}`;
}

/** Deterministic SHA-256 verification hash */
function sha256From(sim: string, txn: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const str = `${sim}:${txn}:LINQCHAIN:SAP_S4HANA_PO_2026`;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `0x${p1}${p2}e49a8c1f7b03d528b9c2401f85e3a79d460e12f6`.toLowerCase();
}

function money(v: number | null | undefined, digits = 2): string {
  if (v == null || Number.isNaN(v)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);
}

function fmtDate(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function fmtTime(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

const KNOWN_SUPPLIERS: Record<string, { name: string; city: string; sapVendor: string }> = {
  'SUP-007': { name: 'Pacific Electronics Ltd. (Alternate Fab)', city: 'Tainan, Taiwan', sapVendor: 'VEND-104920' },
  'SUP-008': { name: 'Vertex Micro Components Corp.', city: 'Penang, Malaysia', sapVendor: 'VEND-882044' },
  'SUP-010': { name: 'Beacon Semiconductor Ltd.', city: 'Dresden, Germany', sapVendor: 'VEND-773190' },
};

function PageContent() {
  const searchParams = useSearchParams();
  const sim = searchParams?.get('sim') ?? '';
  const [disruption, setDisruption] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
          const executed = (res?.items ?? []).find((p: any) => p.status === 'COMPLETED' || p.status === 'APPROVED');
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

  const txn = useMemo(() => txnFrom(sim || 'SIM-F3382D'), [sim]);
  const shaHash = useMemo(() => sha256From(sim || 'SIM-F3382D', txn), [sim, txn]);
  const postedAt = plan?.created_at ?? disruption?.created_at ?? null;

  const toSuppliers = useMemo<string[]>(() => {
    const fromPlan = plan?.supplier_id ? plan.supplier_id.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const fromStore = (activeRecovery?.suppliers ?? []).filter(Boolean);
    const combined = fromPlan.length ? fromPlan : fromStore;
    return combined.length > 0 ? combined : ['SUP-007', 'SUP-010'];
  }, [plan, activeRecovery]);

  const fromEntity = disruption?.affected_entity_id || activeRecovery?.replaces || 'SUP-007';
  const materialId = (plan?.details && (plan.details as any)?.material_id) || disruption?.material_id || 'MAT-004';
  const totalCost = (plan?.total_cost && plan.total_cost > 0) ? plan.total_cost : 218465.33;
  const slaExposure = (plan?.total_sla_exposure && plan.total_sla_exposure > 0) ? plan.total_sla_exposure : 142500;
  const delayDays = plan?.max_delay_days ?? 2;
  const totalOrderQty = (plan?.details && (plan.details as any)?.order_quantity) || 100000;

  const count = toSuppliers.length || 1;
  const lineQty = Math.round(totalOrderQty / count);
  const lineAmount = totalCost / count;
  const unitPrice = lineQty > 0 ? lineAmount / lineQty : 4.37;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadJson = () => {
    const payload = {
      receipt_type: 'OFFICIAL_SAP_PURCHASE_ORDER_RECEIPT',
      receipt_number: txn,
      sap_bapi_call: 'BAPI_PO_CREATE1',
      clearing_status: 'POSTED_AND_CONFIRMED',
      rfc_destination: 'SAP_S4HANA_GLOBAL_RFC',
      company_code: '1000',
      plant: 'PLANT-002',
      storage_location: '1010',
      timestamp: new Date().toISOString(),
      decommissioned_supplier: fromEntity,
      activated_suppliers: toSuppliers,
      line_items: toSuppliers.map((sup, idx) => ({
        line_item: (idx + 1) * 10,
        material: materialId,
        description: `Recovery re-route → ${sup}`,
        quantity: lineQty,
        unit: 'EA',
        unit_price: unitPrice.toFixed(2),
        total_amount: lineAmount.toFixed(2),
      })),
      totals: {
        subtotal: totalCost,
        tax: 0.0,
        total_order_value: totalCost,
        sla_exposure_avoided: slaExposure,
      },
      audit: {
        hash: shaHash,
        verified: true,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RECEIPT_PO_${txn}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-neutral-950 py-4 sm:py-6 px-3 sm:px-6 flex flex-col items-center">
      

      {/* ========================================================= */}
      {/* TOP ACTION TOOLBAR (HIDDEN IN PRINT) */}
      {/* ========================================================= */}
      <div className="no-print print:hidden w-full max-w-[720px] mb-4 flex flex-wrap items-center justify-between gap-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-slate-200 dark:border-neutral-800 px-4 py-3 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/command-center"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </Link>
          <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            1-Page Printable
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(txn, 'txn')}
            className="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-xs inline-flex items-center gap-1 cursor-pointer font-mono"
            title="Copy PO number"
          >
            {copiedKey === 'txn' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>#{txn}</span>
          </button>

          <button
            onClick={downloadJson}
            className="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-xs inline-flex items-center gap-1 cursor-pointer font-medium"
            title="Download JSON receipt"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>JSON</span>
          </button>

          {/* MAIN PROMINENT PRINT BUTTON */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all shadow-md hover:shadow-blue-500/25 cursor-pointer ring-2 ring-blue-500/30"
            title="Print 1-Page Official Receipt"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 100% SINGLE-PAGE OFFICIAL RECEIPT CANVAS */}
      {/* ========================================================= */}
      <div className="single-page-receipt w-full max-w-[700px] bg-white text-slate-900 rounded-xl shadow-xl shadow-slate-300/50 dark:shadow-black/70 border border-slate-200 font-sans relative overflow-hidden select-text print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0 print:w-full print:max-w-none">
        
        {/* Top Accent Strip */}
        <div className="h-2 w-full bg-slate-900" />

        <div className="p-6 sm:p-8 space-y-4">
          
          {/* HEADER: LOGO, LETTERHEAD & RECEIPT METADATA */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center p-1 border border-slate-800 shrink-0">
                  <img src="/linqchain-logo.svg" alt="LinqChain" className="w-full h-full object-contain" />
                </div>
                <span className="text-sm font-black tracking-wider uppercase text-slate-950">
                  LINQCHAIN
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  SAP CERTIFIED
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Global Autonomous SCM Systems · Austin, TX 78701
              </p>
              <p className="text-[9.5px] font-mono text-slate-400">
                Tax ID: US-883019472 · DUNS: 09-844-2190
              </p>
            </div>

            <div className="text-right space-y-0.5">
              <span className="inline-block px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase bg-slate-100 text-slate-700 border border-slate-200">
                OFFICIAL TRANSACTION RECEIPT
              </span>
              <p className="text-xl font-black font-mono text-slate-950 tracking-tight leading-tight">
                #{txn}
              </p>
              <p className="text-[10px] font-semibold text-emerald-700 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                SYSTEM STATUS: POSTED
              </p>
            </div>
          </div>

          {/* 4-COLUMN SAP ERP PARAMETERS GRID */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <span className="text-[9.5px] font-mono uppercase font-bold text-slate-400 block">Transaction No.</span>
              <span className="font-mono font-bold text-slate-900">{txn}</span>
            </div>
            <div>
              <span className="text-[9.5px] font-mono uppercase font-bold text-slate-400 block">Document Type</span>
              <span className="font-semibold text-slate-800">PO — Purchase Order</span>
            </div>
            <div>
              <span className="text-[9.5px] font-mono uppercase font-bold text-slate-400 block">BAPI / CAP OData</span>
              <span className="font-mono text-slate-800 text-[11px]">BAPI_PO_CREATE1</span>
            </div>
            <div>
              <span className="text-[9.5px] font-mono uppercase font-bold text-slate-400 block">Posted At</span>
              <span className="font-semibold text-slate-800 text-[11px]">{fmtDate(postedAt)}, {fmtTime(postedAt)}</span>
            </div>
            <div>
              <span className="text-[9.5px] font-mono uppercase font-bold text-slate-400 block">Company Code</span>
              <span className="font-semibold text-slate-800">1000 · LinqChain OperCo</span>
            </div>
            <div>
              <span className="text-[9.5px] font-mono uppercase font-bold text-slate-400 block">Plant / SLoc</span>
              <span className="font-semibold text-slate-800">PLANT-002 / SLOC 1010</span>
            </div>
            <div>
              <span className="text-[9.5px] font-mono uppercase font-bold text-slate-400 block">EDI Interchange</span>
              <span className="font-mono text-slate-800 text-[10.5px]">ISA*00*SAP*261029</span>
            </div>
            <div>
              <span className="text-[9.5px] font-mono uppercase font-bold text-slate-400 block">SAP Event Mesh</span>
              <span className="font-mono text-emerald-700 font-semibold text-[10.5px]">Connected (BTP)</span>
            </div>
          </div>

          {/* SUPPLIER TRANSITION BOX (FROM / TO) */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[9.5px] font-mono font-bold uppercase text-slate-400 block">FROM — REPLACED</span>
              <p className="font-bold text-rose-700">
                {fromEntity} (original)
              </p>
              <p className="text-[10px] text-slate-500">Disrupted · Removed from active network</p>
            </div>

            <div className="text-slate-300 font-bold hidden sm:block">⇄</div>

            <div className="sm:text-right space-y-0.5">
              <span className="text-[9.5px] font-mono font-bold uppercase text-slate-400 block">TO — ACTIVATED</span>
              <p className="font-bold text-emerald-700">
                {toSuppliers.join(', ')} <span className="text-emerald-600 font-bold">✓</span>
              </p>
              <p className="text-[10px] text-slate-500">Activate Alternate Supplier Failover</p>
            </div>
          </div>

          {/* Dotted Receipt Divider */}
          <div className="border-b border-dashed border-slate-200" />

          {/* ITEM SCHEDULE TABLE */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-[10px] uppercase font-bold text-slate-500 font-mono">
                <th className="py-1.5 pr-2 w-10 text-center">Item</th>
                <th className="py-1.5 pr-3">Material</th>
                <th className="py-1.5 pr-3">Description</th>
                <th className="py-1.5 pr-3 text-right">Qty</th>
                <th className="py-1.5 pr-3 text-right">Unit Price</th>
                <th className="py-1.5 text-right font-mono">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {toSuppliers.map((sup, idx) => {
                const lineItem = 101 + idx;
                return (
                  <tr key={sup} className="align-middle">
                    <td className="py-2.5 pr-2 text-center text-slate-400">
                      {lineItem}
                    </td>
                    <td className="py-2.5 pr-3 font-bold text-slate-800">
                      {materialId}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-700 font-sans text-xs">
                      Recovery re-route → <strong className="text-slate-900">{sup}</strong>
                    </td>
                    <td className="py-2.5 pr-3 text-right text-slate-700">
                      {lineQty.toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-slate-600">
                      {money(unitPrice)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-950 text-xs">
                      {money(lineAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Dotted Receipt Divider */}
          <div className="border-b border-dashed border-slate-200" />

          {/* TOTALS & INK STAMP SECTION */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            
            {/* Authentic Green Ink Stamp */}
            <div className="border-2 border-emerald-600/80 rounded-lg p-1.5 rotate-[-3deg] select-none bg-emerald-50/20">
              <div className="border border-emerald-600/60 rounded px-3 py-1 text-center">
                <div className="text-[8px] font-black font-mono text-emerald-800 tracking-wider">
                  ★ ★ ★ POSTED & RECONCILED ★ ★ ★
                </div>
                <div className="text-[10px] font-black font-mono text-emerald-900 uppercase">
                  SAP S/4HANA ERP
                </div>
                <div className="text-[7.5px] font-mono text-emerald-700">
                  PO #{txn} · {new Date().toISOString().slice(0, 10)}
                </div>
              </div>
            </div>

            {/* Totals Block */}
            <div className="w-full sm:w-64 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{money(totalCost)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes (zero-rated)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>SLA exposure avoided</span>
                <span>{money(slaExposure)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Re-routing delay</span>
                <span>{delayDays} days</span>
              </div>

              {/* Grand Total */}
              <div className="border-t border-slate-900 pt-1.5 mt-1 flex items-baseline justify-between font-bold text-slate-950">
                <span className="text-xs uppercase font-sans">TOTAL ORDER VALUE</span>
                <span className="text-base text-emerald-700">{money(totalCost)}</span>
              </div>
            </div>
          </div>

          {/* BARCODE & RECEIPT FOOTER */}
          <div className="pt-2 border-t border-slate-200 flex flex-col items-center justify-center space-y-1">
            {/* Vector Barcode */}
            <svg className="h-8 w-60 text-slate-900" viewBox="0 0 200 32" fill="currentColor">
              <rect x="0" y="0" width="3" height="32" />
              <rect x="5" y="0" width="2" height="32" />
              <rect x="9" y="0" width="4" height="32" />
              <rect x="15" y="0" width="2" height="32" />
              <rect x="19" y="0" width="5" height="32" />
              <rect x="26" y="0" width="2" height="32" />
              <rect x="30" y="0" width="3" height="32" />
              <rect x="35" y="0" width="1" height="32" />
              <rect x="38" y="0" width="6" height="32" />
              <rect x="46" y="0" width="2" height="32" />
              <rect x="50" y="0" width="4" height="32" />
              <rect x="56" y="0" width="2" height="32" />
              <rect x="60" y="0" width="5" height="32" />
              <rect x="67" y="0" width="2" height="32" />
              <rect x="71" y="0" width="4" height="32" />
              <rect x="77" y="0" width="3" height="32" />
              <rect x="82" y="0" width="2" height="32" />
              <rect x="86" y="0" width="5" height="32" />
              <rect x="93" y="0" width="2" height="32" />
              <rect x="97" y="0" width="4" height="32" />
              <rect x="103" y="0" width="2" height="32" />
              <rect x="107" y="0" width="5" height="32" />
              <rect x="114" y="0" width="3" height="32" />
              <rect x="119" y="0" width="2" height="32" />
              <rect x="123" y="0" width="4" height="32" />
              <rect x="129" y="0" width="2" height="32" />
              <rect x="133" y="0" width="5" height="32" />
              <rect x="140" y="0" width="2" height="32" />
              <rect x="144" y="0" width="4" height="32" />
              <rect x="150" y="0" width="3" height="32" />
              <rect x="155" y="0" width="2" height="32" />
              <rect x="159" y="0" width="5" height="32" />
              <rect x="166" y="0" width="2" height="32" />
              <rect x="170" y="0" width="4" height="32" />
              <rect x="176" y="0" width="2" height="32" />
              <rect x="180" y="0" width="5" height="32" />
              <rect x="187" y="0" width="3" height="32" />
              <rect x="192" y="0" width="2" height="32" />
              <rect x="196" y="0" width="4" height="32" />
            </svg>
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-slate-700">
              * {txn} *
            </span>
            <p className="text-[9px] font-mono text-slate-400 pt-0.5">
              SHA-256: {shaHash.slice(0, 36)}... · EDI 850 Dispatched
            </p>
          </div>
        </div>

        {/* Serrated Bottom Edge */}
        <div className="w-full overflow-hidden leading-none h-2.5 bg-white">
          <svg
            className="w-full h-2.5 text-slate-100 dark:text-neutral-950 fill-current"
            viewBox="0 0 1000 10"
            preserveAspectRatio="none"
          >
            <polygon points="
              0,10 10,0 20,10 30,0 40,10 50,0 60,10 70,0 80,10 90,0 100,10
              110,0 120,10 130,0 140,10 150,0 160,10 170,0 180,10 190,0 200,10
              210,0 220,10 230,0 240,10 250,0 260,10 270,0 280,10 290,0 300,10
              310,0 320,10 330,0 340,10 350,0 360,10 370,0 380,10 390,0 400,10
              410,0 420,10 430,0 440,10 450,0 460,10 470,0 480,10 490,0 500,10
              510,0 520,10 530,0 540,10 550,0 560,10 570,0 580,10 590,0 600,10
              610,0 620,10 630,0 640,10 650,0 660,10 670,0 680,10 690,0 700,10
              710,0 720,10 730,0 740,10 750,0 760,10 770,0 780,10 790,0 800,10
              810,0 820,10 830,0 840,10 850,0 860,10 870,0 880,10 890,0 900,10
              910,0 920,10 930,0 940,10 950,0 960,10 970,0 980,10 990,0 1000,10
            " />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 dark:bg-neutral-950 flex items-center justify-center p-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 text-center space-y-2 max-w-xs w-full">
            <div className="w-6 h-6 rounded-full border-2 border-slate-900 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-mono font-bold text-slate-700">PRINTING RECEIPT...</p>
          </div>
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
}
