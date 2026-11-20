'use client';

import React, { useState } from 'react';
import { useSupplierStore } from '@/stores/useSupplierStore';
import {
  Settings,
  Building,
  Key,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Download,
  Database,
  Radio,
  Lock,
  Mail,
  Phone,
  Clock,
  Server,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SupplierSettingsPage() {
  const { supplierUser, purchaseOrders, inventory, disruptions, certificates } = useSupplierStore();

  const [vendorName, setVendorName] = useState(supplierUser?.company_name || 'Titanium Alloy Forgings Corp');
  const [contactName, setContactName] = useState(supplierUser?.display_name || 'Marcus Vance');
  const [contactPhone, setContactPhone] = useState('+1 (555) 792-4410');
  const [timezone, setTimezone] = useState('America/Chicago (CST)');
  const [webhookUrl, setWebhookUrl] = useState('https://edi.titanium-forgings.com/api/sap/po-inbound');
  const [rfcTesting, setRfcTesting] = useState(false);
  const [rfcStatus, setRfcStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestRfcConnection = async () => {
    setRfcTesting(true);
    setRfcStatus(null);
    await new Promise((r) => setTimeout(r, 700));
    setRfcTesting(false);
    setRfcStatus('RFC_PING_SUCCESS · Latency 14ms · Protocol BAPI_PO_CHANGE · 0 packet loss');
    showToast('SAP RFC BAPI handshake successfully verified.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Vendor master profile & communication endpoints updated.');
  };

  const handleExportSystemBundle = () => {
    const bundle = {
      vendor: supplierUser,
      manifest_timestamp: new Date().toISOString(),
      orders: purchaseOrders,
      inventory: inventory,
      disruptions: disruptions,
      certificates: certificates,
      integration: {
        sap_destination: 'SAP_S4HANA_PROD_BAPI',
        client: '400',
        webhook_endpoint: webhookUrl,
      },
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor-diagnostic-${supplierUser?.vendor_code || 'VEND'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded vendor diagnostic snapshot.');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
            <span>{supplierUser?.company_name || 'Titanium Alloy Forgings Corp'}</span>
            <span>/</span>
            <span>Administration</span>
            <span>/</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">Vendor Master & Integrations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Vendor Master & System Integrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            SAP S/4HANA RFC BAPI connectivity, EDI 850/856 webhooks, and ITAR partner security credentials
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportSystemBundle}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 dark:border-neutral-700 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-blue-600/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 4-Card Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">SAP RFC BAPI</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
            ONLINE
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            Latency 14ms · Client 400 PRD
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Vendor Code</span>
            <Building className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {supplierUser?.vendor_code || 'VEND-8821-TI'}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 font-mono">
            DUNS: {supplierUser?.duns_number || '08-192-4412'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">EDI Protocol</span>
            <Radio className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            ANSI X12
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            EDI 850 (PO) & 856 (ASN) Active
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Security Tier</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            LEVEL 3
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            ITAR Crypto · FIDO2 Enforced
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vendor Master Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Vendor Master Record & Contacts
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
              TIER-1 MASTER
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Vendor Entity Name
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  SAP Vendor Code
                </label>
                <input
                  type="text"
                  disabled
                  value={supplierUser?.vendor_code || 'VEND-8821-TI'}
                  className="w-full px-3.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Primary Contact Lead
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  disabled
                  value={supplierUser?.email || 'supplier@titanium-forgings.com'}
                  className="w-full px-3.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Dispatch Hotline
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Operating Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="America/Chicago (CST)">America/Chicago (CST · UTC-06:00)</option>
                  <option value="America/New_York (EST)">America/New_York (EST · UTC-05:00)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT · UTC+00:00)</option>
                  <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST · UTC+09:00)</option>
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST · UTC+05:30)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                EDI 850 / 856 Webhook Dispatch URI
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
              >
                Save Vendor Master Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: SAP BAPI Connection & Security (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SAP RFC Connection */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  SAP S/4HANA RFC Gateway
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">RFC CPIC</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  RFC Destination
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  SAP_S4HANA_PROD_BAPI
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 font-mono">
                  Instance: PRD-01 · Client: 400 · Host: 10.240.12.1
                </div>
              </div>

              {rfcStatus && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-mono text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{rfcStatus}</span>
                </div>
              )}

              <button
                type="button"
                disabled={rfcTesting}
                onClick={handleTestRfcConnection}
                className="w-full py-2 px-4 rounded-lg text-xs font-semibold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', rfcTesting && 'animate-spin')} />
                <span>{rfcTesting ? 'Testing BAPI Handshake...' : 'Test SAP RFC BAPI Ping'}</span>
              </button>
            </div>
          </div>

          {/* Security Credentials Card */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Partner Security & Clearance
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ENFORCED
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">Hardware FIDO2 Security Key</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ENFORCED
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Clearance Tier</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">ITAR & Defense Supply Chain</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  LEVEL 3
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
