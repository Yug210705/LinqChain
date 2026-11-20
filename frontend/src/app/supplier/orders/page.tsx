'use client';

import React, { useState } from 'react';
import { useSupplierStore, SupplierPO } from '@/stores/useSupplierStore';
import { formatCurrency, cn } from '@/lib/utils';
import {
  PackageCheck,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  Download,
  AlertCircle,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Boxes,
} from 'lucide-react';

export default function SupplierOrdersPage() {
  const { purchaseOrders, acknowledgePO, issueASN, rejectPO, supplierUser } = useSupplierStore();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [confirmModalPo, setConfirmModalPo] = useState<SupplierPO | null>(null);
  const [asnModalPo, setAsnModalPo] = useState<SupplierPO | null>(null);
  const [rejectModalPo, setRejectModalPo] = useState<SupplierPO | null>(null);

  const [carrier, setCarrier] = useState('FedEx Custom Critical Aerospace');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    const matchesSearch =
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.sap_po_number.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const newOrdersCount = purchaseOrders.filter((p) => p.status === 'NEW').length;
  const inTransitCount = purchaseOrders.filter((p) => p.status === 'IN_TRANSIT').length;
  const totalValue = purchaseOrders.reduce((sum, p) => sum + p.total_value, 0);

  const handleConfirmAction = (po: SupplierPO) => {
    acknowledgePO(po.id, confirmedDate || po.required_delivery_date);
    setConfirmModalPo(null);
    setConfirmedDate('');
    showToast(`Order ${po.id} successfully acknowledged with delivery target.`);
  };

  const handleAsnAction = (po: SupplierPO) => {
    if (!trackingNumber.trim()) return;
    issueASN(po.id, carrier, trackingNumber.trim());
    setAsnModalPo(null);
    setTrackingNumber('');
    showToast(`Advance Shipping Notice (ASN) dispatched for ${po.id}.`);
  };

  const handleRejectAction = (po: SupplierPO) => {
    if (!rejectReason.trim()) return;
    rejectPO(po.id, rejectReason.trim());
    setRejectModalPo(null);
    setRejectReason('');
    showToast(`Order ${po.id} rejected and buyer procurement notified.`);
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
            <span className="text-blue-600 dark:text-blue-400 font-bold">Purchase Orders Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Purchase Orders & ASN Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            Manage incoming purchase commitments, target delivery dates, and outbound logistics manifests
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            {filteredOrders.length} Orders Listed
          </span>
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
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Pipeline</span>
            <PackageCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {purchaseOrders.length} <span className="text-sm font-normal text-slate-400">Orders</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            {formatCurrency(totalValue)} committed
          </div>
        </div>

        <div className={cn(
          "bg-white dark:bg-[#18181b] border rounded-xl p-4 shadow-xs relative overflow-hidden group transition-all",
          newOrdersCount > 0 ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60" : "border-slate-200 dark:border-neutral-800 hover:border-blue-500/30"
        )}>
          <div className={cn("absolute left-0 top-0 bottom-0 w-1", newOrdersCount > 0 ? "bg-amber-500" : "bg-blue-500/80")} />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Awaiting Acceptance</span>
            <Clock className={cn("w-4 h-4", newOrdersCount > 0 ? "text-amber-500 animate-pulse" : "text-slate-400")} />
          </div>
          <div className={cn("text-2xl font-black font-mono tracking-tight", newOrdersCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white")}>
            {newOrdersCount}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            {newOrdersCount > 0 ? "Action required within 24h" : "Zero pending acceptance"}
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">In-Transit ASNs</span>
            <Truck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {inTransitCount}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Active carrier air waybills
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Avg Lead-Time</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            14.2 <span className="text-sm font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            Benchmark: 18.0 Days (3.8d faster)
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PO #, part number, component name, SAP ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'NEW', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold uppercase font-mono transition-colors cursor-pointer whitespace-nowrap',
                statusFilter === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700'
              )}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                <th className="py-2.5 px-3">Order Ref</th>
                <th className="py-2.5 px-3">Component / Material</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Unit Price</th>
                <th className="py-2.5 px-3">Total Value</th>
                <th className="py-2.5 px-3">Required By</th>
                <th className="py-2.5 px-3">Confirmed Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 dark:text-neutral-500 font-mono">
                    No purchase orders match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => (
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
                      {formatCurrency(po.unit_price)}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(po.total_value)}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-neutral-300">
                      {po.required_delivery_date}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {po.confirmed_delivery_date ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {po.confirmed_delivery_date}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unconfirmed</span>
                      )}
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
                      <div className="flex items-center justify-end gap-1.5">
                        {po.status === 'NEW' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setConfirmModalPo(po)}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
                            >
                              Acknowledge
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectModalPo(po)}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {po.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => setAsnModalPo(po)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Dispatch ASN</span>
                          </button>
                        )}

                        {po.status === 'IN_TRANSIT' && (
                          <div className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                            {po.tracking_number}
                          </div>
                        )}

                        {po.status === 'DELIVERED' && (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            POD Confirmed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CONFIRM PO */}
      {confirmModalPo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <span>Acknowledge Order Delivery</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
              Commit to fulfilling order <span className="font-mono font-bold text-slate-900 dark:text-white">{confirmModalPo.id}</span>.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Required Buyer Date
                </label>
                <input
                  type="text"
                  disabled
                  value={confirmModalPo.required_delivery_date}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-500 font-mono"
                />
              </div>

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
              Transmit EDI 856 shipping notice for <span className="font-mono font-bold text-slate-900 dark:text-white">{asnModalPo.id}</span>.
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
                  placeholder="e.g. FX-8891029412"
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

      {/* MODAL: REJECT PO */}
      {rejectModalPo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 mb-1.5 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              <span>Decline Purchase Order</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
              Provide formal operational justification for rejecting <span className="font-mono font-bold text-slate-900 dark:text-white">{rejectModalPo.id}</span>.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Reason for Non-Acceptance
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Ingot raw material stock shortfall; lead-time requires minimum 35 calendar days."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectModalPo(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim()}
                onClick={() => handleRejectAction(rejectModalPo)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition-colors cursor-pointer shadow-xs"
              >
                Confirm Decline Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
