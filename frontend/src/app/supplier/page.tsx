'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSupplierStore, SupplierPO } from '@/stores/useSupplierStore';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Truck,
  PackageCheck,
  Boxes,
  AlertTriangle,
  FileCheck2,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  Download,
  Building,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Send,
  Zap,
  Radio,
  FileBadge,
} from 'lucide-react';

export default function SupplierDashboardPage() {
  const {
    supplierUser,
    purchaseOrders,
    inventory,
    disruptions,
    certificates,
    acknowledgePO,
    issueASN,
  } = useSupplierStore();

  const [confirmModalPo, setConfirmModalPo] = useState<SupplierPO | null>(null);
  const [asnModalPo, setAsnModalPo] = useState<SupplierPO | null>(null);
  const [carrier, setCarrier] = useState('FedEx Custom Critical Aerospace');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingPOs = purchaseOrders.filter((po) => po.status === 'NEW');
  const inTransitPOs = purchaseOrders.filter((po) => po.status === 'IN_TRANSIT');
  const totalValue = purchaseOrders.reduce((sum, po) => sum + po.total_value, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmAction = (po: SupplierPO) => {
    acknowledgePO(po.id, confirmedDate || po.required_delivery_date);
    setConfirmModalPo(null);
    setConfirmedDate('');
    showToast(`Acknowledged ${po.id} with delivery commitment to Enterprise Aerospace.`);
  };

  const handleAsnAction = (po: SupplierPO) => {
    if (!trackingNumber.trim()) return;
    issueASN(po.id, carrier, trackingNumber.trim());
    setAsnModalPo(null);
    setTrackingNumber('');
    showToast(`Advance Shipping Notice (ASN) dispatched for ${po.id}. Carrier: ${carrier}.`);
  };

  const handleExportVendorManifest = () => {
    const manifest = {
      vendor: supplierUser,
      generated_at: new Date().toISOString(),
      active_purchase_orders: purchaseOrders,
      inventory_buffers: inventory,
      active_disruptions: disruptions,
      quality_certificates: certificates,
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor-manifest-${supplierUser?.vendor_code || 'VEND'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Vendor diagnostics and delivery manifest exported.');
  };

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
            <span className="text-blue-600 dark:text-blue-400 font-bold">Cockpit & Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Supplier Operations Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Real-time SAP S/4HANA order pipeline, ASN dispatch tracking, and airworthiness inventory buffers
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/supplier/disruptions"
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Self-Report Disruption</span>
          </Link>

          <button
            onClick={handleExportVendorManifest}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 dark:border-neutral-700 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Manifest</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-blue-600/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Vendor Master Information Strip */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 dark:bg-blue-950/50 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-sm shrink-0">
            <Truck className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {supplierUser?.company_name || 'Titanium Alloy Forgings Corp'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                {supplierUser?.vendor_code || 'VEND-8821-TI'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                TIER-1 PARTNER
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 flex items-center gap-3">
              <span>DUNS: {supplierUser?.duns_number || '08-192-4412'}</span>
              <span>•</span>
              <span>Buyer: Enterprise Aerospace Corp</span>
              <span>•</span>
              <span className="font-mono text-slate-400 dark:text-neutral-500">SAP RFC BAPI: CONNECTED (14ms)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase block">Active Pipeline</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalValue)}</span>
          </div>
        </div>
      </div>

      {/* 6-Card KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Active Orders */}
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Active POs</span>
            <PackageCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {purchaseOrders.length}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            {formatCurrency(totalValue)} pipeline
          </div>
        </div>

        {/* Pending Acceptance */}
        <div className={cn(
          "bg-white dark:bg-[#18181b] border rounded-xl p-4 shadow-xs relative overflow-hidden group transition-all",
          pendingPOs.length > 0 ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60" : "border-slate-200 dark:border-neutral-800 hover:border-blue-500/30"
        )}>
          <div className={cn("absolute left-0 top-0 bottom-0 w-1", pendingPOs.length > 0 ? "bg-amber-500" : "bg-blue-500/80")} />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Pending Acceptance</span>
            <Clock className={cn("w-4 h-4", pendingPOs.length > 0 ? "text-amber-500 animate-pulse" : "text-slate-400")} />
          </div>
          <div className={cn("text-2xl font-black font-mono tracking-tight", pendingPOs.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white")}>
            {pendingPOs.length}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            {pendingPOs.length > 0 ? "Action required within 24h" : "All orders acknowledged"}
          </div>
        </div>

        {/* Shipments In Transit */}
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">In Transit (ASNs)</span>
            <Truck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {inTransitPOs.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Active EDI 856 Dispatches
          </div>
        </div>

        {/* OTIF Delivery Score */}
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">OTIF Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            98.4%
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            Target: ≥ 98.0% (Exceeding)
          </div>
        </div>

        {/* Quality Defect PPM */}
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Defect PPM</span>
            <FileCheck2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            14 <span className="text-sm font-normal text-slate-400">PPM</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            Six-Sigma Class A Rating
          </div>
        </div>

        {/* Safety Buffer Reserve */}
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Buffer Runway</span>
            <Boxes className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            28 <span className="text-sm font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Optimal Stock Runway
          </div>
        </div>
      </div>

      {/* Inbound Purchase Orders Ledger */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <PackageCheck className="w-4 h-4 text-blue-500" />
              <span>Inbound Purchase Orders & Dispatch Status</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Live SAP RFC orders from Enterprise Aerospace S/4HANA ERP instance
            </p>
          </div>

          <Link
            href="/supplier/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Full Orders Ledger ({purchaseOrders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                <th className="py-2.5 px-3">PO Number</th>
                <th className="py-2.5 px-3">Component / Part #</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Required Date</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
              {purchaseOrders.map((po) => {
                return (
                  <tr key={po.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      <div>{po.id}</div>
                      <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-normal">
                        SAP #{po.sap_po_number}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 dark:text-neutral-200">{po.item_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{po.part_number}</div>
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {po.quantity} {po.unit}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-neutral-300">
                      {po.required_delivery_date}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(po.total_value)}
                    </td>

                    <td className="py-3 px-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1 border',
                        po.status === 'NEW'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 animate-pulse'
                          : po.status === 'CONFIRMED'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25'
                          : po.status === 'IN_TRANSIT'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                          : po.status === 'DELIVERED'
                          ? 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-neutral-700'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25'
                      )}>
                        {po.status === 'IN_TRANSIT' && <Truck className="w-3 h-3" />}
                        {po.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {po.status === 'NEW' && (
                        <button
                          type="button"
                          onClick={() => setConfirmModalPo(po)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Acknowledge</span>
                        </button>
                      )}

                      {po.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => setAsnModalPo(po)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch ASN</span>
                        </button>
                      )}

                      {po.status === 'IN_TRANSIT' && (
                        <span className="text-[11px] font-mono text-slate-400 dark:text-neutral-500">
                          {po.carrier || 'Carrier en route'}
                        </span>
                      )}

                      {po.status === 'DELIVERED' && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Complete
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

      {/* Material Buffers & Quality Compliance Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Material Buffers */}
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Raw Material Stock & Buffers
              </h2>
            </div>
            <Link
              href="/supplier/inventory"
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Manage Stock
            </Link>
          </div>

          <div className="space-y-3">
            {inventory.map((item) => {
              const fillPct = Math.min(100, Math.round((item.stock_on_hand / item.max_capacity) * 100));
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/70 dark:border-neutral-800/80"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {item.material_name}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded border",
                        item.status === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : item.status === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse'
                      )}
                    >
                      {item.safety_buffer_days} Days Buffer
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 font-mono mb-1.5">
                    <span>
                      {item.stock_on_hand.toLocaleString()} {item.unit} available
                    </span>
                    <span>Min: {item.min_threshold.toLocaleString()} {item.unit}</span>
                  </div>

                  {/* 4px Subtle Runway */}
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
              );
            })}
          </div>
        </div>

        {/* Right: Quality Audit & Disruption Alerts */}
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Quality Audit & AS9100 Certifications
              </h2>
            </div>
            <Link
              href="/supplier/quality"
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Audits Register
            </Link>
          </div>

          <div className="space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/70 dark:border-neutral-800/80 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {cert.cert_name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Issuer: {cert.issuer} · Batch: {cert.batch_number}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 mt-0.5">
                    Expires: {cert.expiry_date}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0 border",
                    cert.status === 'VALID'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse'
                  )}
                >
                  {cert.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>

          {/* Active Disruption Notice */}
          {disruptions.length > 0 && (
            <div className="mt-4 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">{disruptions[0].title}</div>
                <div className="text-[11px] mt-0.5 opacity-90">
                  Est. delay: {disruptions[0].estimated_delay_days} days · Status: {disruptions[0].status}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ACKNOWLEDGE PO */}
      {confirmModalPo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <span>Acknowledge Purchase Order</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
              Confirm acceptance of <span className="font-mono font-bold text-slate-900 dark:text-white">{confirmModalPo.id}</span> for {confirmModalPo.quantity} {confirmModalPo.unit} of {confirmModalPo.item_name}.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Confirmed Target Delivery Date
                </label>
                <input
                  type="date"
                  defaultValue={confirmModalPo.required_delivery_date}
                  onChange={(e) => setConfirmedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModalPo(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAction(confirmModalPo)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
              >
                Commit & Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH ASN */}
      {asnModalPo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-500" />
              <span>Issue Advance Shipping Notice (ASN)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
              Dispatch EDI 856 shipping notice for <span className="font-mono font-bold text-slate-900 dark:text-white">{asnModalPo.id}</span>.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Logistics Carrier
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="FedEx Custom Critical Aerospace">FedEx Custom Critical Aerospace</option>
                  <option value="DHL Global Forwarding Aerospace">DHL Global Forwarding Aerospace</option>
                  <option value="UPS Supply Chain Solutions">UPS Supply Chain Solutions</option>
                  <option value="Dedicated Air Cargo Charter">Dedicated Air Cargo Charter</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Air Waybill / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. FX-99210941"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAsnModalPo(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!trackingNumber.trim()}
                onClick={() => handleAsnAction(asnModalPo)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-colors cursor-pointer shadow-xs"
              >
                Transmit ASN to Buyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
