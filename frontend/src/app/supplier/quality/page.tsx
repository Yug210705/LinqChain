'use client';

import React, { useState } from 'react';
import { useSupplierStore, SupplierQualityCert } from '@/stores/useSupplierStore';
import { cn } from '@/lib/utils';
import {
  FileBadge,
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Award,
  Upload,
  Calendar,
  FileText,
  Search,
  Shield,
  Clock,
} from 'lucide-react';

export default function SupplierQualityPage() {
  const { certificates, uploadCertificate, supplierUser } = useSupplierStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [certName, setCertName] = useState('');
  const [partNumber, setPartNumber] = useState('AF-TI-9021');
  const [batchNumber, setBatchNumber] = useState('');
  const [issuer, setIssuer] = useState('National Metrology Labs');
  const [expiryDate, setExpiryDate] = useState('2027-10-30');
  const [standard, setStandard] = useState<SupplierQualityCert['compliance_standard']>('AS9100D');
  const [defectPpm, setDefectPpm] = useState<number>(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredCerts = certificates.filter(
    (c) =>
      c.cert_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.compliance_standard.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !batchNumber.trim()) {
      showToast('Please specify certificate name and batch lot number.');
      return;
    }

    uploadCertificate({
      cert_name: certName.trim(),
      part_number: partNumber.trim(),
      batch_number: batchNumber.trim(),
      issuer: issuer.trim(),
      issue_date: new Date().toISOString().slice(0, 10),
      expiry_date: expiryDate,
      compliance_standard: standard,
      defect_ppm: defectPpm,
    });

    setModalOpen(false);
    setCertName('');
    setBatchNumber('');
    showToast('Quality Certificate & CoA validated and recorded.');
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
            <span className="text-blue-600 dark:text-blue-400 font-bold">Quality & Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quality Assurance & CoA Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            AS9100 Rev D audit validation, NADCAP metallurgy certifications, and lot-level Certificates of Analysis
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Certificate / CoA</span>
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

      {/* 4-Card KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">AS9100 Rev D</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
            99.2%
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans">AUDIT SCORE</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            PRI Registrar certified through 2027
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">ITAR Compliance</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            M42801
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            DDTC Mil-Spec Defense Authorized
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Defect PPM</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            14 <span className="text-sm font-normal text-slate-400">PPM</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Six-Sigma Class A Benchmark
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Archived CoAs</span>
            <FileBadge className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {certificates.length} <span className="text-sm font-normal text-slate-400">Valid</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            100% active batch coverage
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search certificate name, batch lot, standard, issuer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
          {filteredCerts.length} Certificates
        </span>
      </div>

      {/* Certificates Table */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                <th className="py-2.5 px-3">Certificate / Test Spec</th>
                <th className="py-2.5 px-3">Part Code</th>
                <th className="py-2.5 px-3">Batch / Melt Lot</th>
                <th className="py-2.5 px-3">Accredited Testing Lab</th>
                <th className="py-2.5 px-3">Standard</th>
                <th className="py-2.5 px-3">Expiration Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
              {filteredCerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-neutral-500 font-mono">
                    No quality records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{cert.cert_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Ref ID: {cert.id}</div>
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-neutral-300">
                      {cert.part_number}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-neutral-200">
                      {cert.batch_number}
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-neutral-400">
                      {cert.issuer}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
                        {cert.compliance_standard}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-neutral-400">
                      {cert.expiry_date}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border',
                          cert.status === 'VALID'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse'
                        )}
                      >
                        {cert.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Certificate Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              <span>Record Certificate / CoA Lot</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
              Upload compliance record for OEM incoming inspection clearance.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                  Certificate Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metallurgical Test Report: Tensile Yield"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                    Batch / Melt Lot
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LOT-4412-B"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                    Standard
                  </label>
                  <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="AS9100D">AS9100 Rev D</option>
                    <option value="NADCAP">NADCAP</option>
                    <option value="ITAR">ITAR</option>
                    <option value="ISO9001">ISO 9001</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                    Testing Lab
                  </label>
                  <input
                    type="text"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
                >
                  Confirm & Archive CoA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
