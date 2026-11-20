'use client';

import React, { useState } from 'react';
import { useManufacturerStore, QualityNCR } from '@/stores/useManufacturerStore';
import {
  FileCheck2,
  AlertOctagon,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  X,
  FileText,
  BadgeAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManufacturerQualityPage() {
  const { ncrs, createNCR, resolveNCR } = useManufacturerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New NCR Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [partNumber, setPartNumber] = useState('');
  const [partName, setPartName] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [severity, setSeverity] = useState<QualityNCR['severity']>('MAJOR');
  const [defectCode, setDefectCode] = useState('DEF-TOL-OUT-OF-SPEC');
  const [description, setDescription] = useState('');

  // Disposition Modal
  const [selectedNcrForDisposition, setSelectedNcrForDisposition] = useState<QualityNCR | null>(null);
  const [dispositionChoice, setDispositionChoice] = useState<QualityNCR['disposition']>('REWORK');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredNcrs = ncrs.filter((ncr) => {
    const matchesSearch =
      ncr.ncr_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ncr.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ncr.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ncr.defect_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || ncr.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || ncr.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleCreateNCR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partNumber || !partName || !description) return;

    createNCR({
      part_number: partNumber,
      part_name: partName,
      lot_number: lotNumber || `LOT-${Date.now().toString().slice(-6)}`,
      severity,
      disposition: 'UNDER_REVIEW',
      defect_code: defectCode,
      description,
      reported_by: 'Inspector Sarah Jenkins (Badge #1109)',
    });

    setIsReportModalOpen(false);
    setPartNumber('');
    setPartName('');
    setLotNumber('');
    setDescription('');
    setActionNotice('Non-Conformance Report recorded. Material quarantined under Station 04 secure custody.');
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleApplyDisposition = () => {
    if (!selectedNcrForDisposition) return;
    resolveNCR(selectedNcrForDisposition.id, dispositionChoice);
    setActionNotice(`MRB determination committed for ${selectedNcrForDisposition.ncr_number} (${dispositionChoice}). Airworthiness log signed.`);
    setSelectedNcrForDisposition(null);
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Enterprise Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
            <span>Plant TX-04</span>
            <span>/</span>
            <span>Quality & Airworthiness</span>
            <span>/</span>
            <span className="text-emerald-600 dark:text-emerald-400">Non-Conformance Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quality Assurance & NCR Quarantine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            AS9100 Rev D audit compliance, Material Review Board (MRB) sign-offs, and scrap quarantine custody
          </p>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>File Quarantine NCR</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="p-1 hover:bg-emerald-500/20 rounded-md text-emerald-400 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quality Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                First-Pass Yield (FPY)
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono mt-0.5">
                98.4%
              </div>
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            AS9100 Rev D audit compliant
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                Active Quarantine Lots
              </div>
              <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                {ncrs.filter((n) => n.status !== 'DISPOSED').length} Lots
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
            Station 04 Secure Holding Area
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-neutral-400 truncate">
                Scrap Defect Rate
              </div>
              <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                0.38%
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
            Threshold: &lt; 1.20% allowable
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by NCR #, Part Name, Defect Code..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL_AIRWORTHINESS">Critical Airworthiness</option>
            <option value="MAJOR">Major</option>
            <option value="MINOR">Minor</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="DISPOSED">Disposed</option>
          </select>

          {(searchQuery || severityFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white px-2 py-1 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* NCR Cards Grid */}
      <div className="space-y-3">
        {filteredNcrs.map((ncr) => {
          const isCritical = ncr.severity === 'CRITICAL_AIRWORTHINESS';
          const isMajor = ncr.severity === 'MAJOR';

          return (
            <div
              key={ncr.id}
              className={cn(
                'bg-white dark:bg-[#1c1c1e] border rounded-xl p-5 shadow-xs transition-all relative overflow-hidden',
                isCritical
                  ? 'border-rose-300 dark:border-rose-900/60'
                  : 'border-slate-200 dark:border-neutral-800'
              )}
            >
              {/* Left accent strip */}
              <div
                className={cn(
                  'absolute left-0 top-0 bottom-0 w-1',
                  isCritical ? 'bg-rose-500' : isMajor ? 'bg-amber-500' : 'bg-cyan-500'
                )}
              />

              <div className="ml-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{ncr.ncr_number}</span>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs font-mono',
                        isCritical
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : isMajor
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
                      )}
                    >
                      {ncr.severity}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 font-semibold">
                      {ncr.disposition}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                      {ncr.status}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedNcrForDisposition(ncr);
                      setDispositionChoice(ncr.disposition);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    MRB Disposition Sign-off
                  </button>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ncr.part_name} <span className="text-xs font-mono text-slate-400 font-normal">({ncr.part_number})</span>
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-neutral-400 mt-1">
                    <span>Lot: <strong className="text-slate-700 dark:text-neutral-300">{ncr.lot_number}</strong></span>
                    <span>Defect Code: <strong className="text-amber-600 dark:text-amber-400">{ncr.defect_code}</strong></span>
                    <span>Reported: {new Date(ncr.reported_at).toLocaleDateString()}</span>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 dark:text-neutral-300 leading-relaxed font-sans">
                    {ncr.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-neutral-500">
                    <span>Auditor: {ncr.reported_by}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">ITAR Regulated</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New NCR Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] border border-neutral-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                <span>File Non-Conformance Report (NCR)</span>
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNCR} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-neutral-300 uppercase mb-1">Part Number</label>
                  <input
                    type="text"
                    required
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    placeholder="e.g. BLK-GE9X-S2-77"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-neutral-300 uppercase mb-1">Lot Number</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="e.g. LOT-2026-NOV-102"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-neutral-300 uppercase mb-1">Component Description</label>
                <input
                  type="text"
                  required
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="e.g. Stage 2 Turbine Blisk Disk"
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-neutral-300 uppercase mb-1">Severity Tier</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="CRITICAL_AIRWORTHINESS">Critical Airworthiness</option>
                    <option value="MAJOR">Major</option>
                    <option value="MINOR">Minor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-neutral-300 uppercase mb-1">Defect Taxonomy</label>
                  <select
                    value={defectCode}
                    onChange={(e) => setDefectCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
                  >
                    <option value="DEF-SURF-MICROCRACK">DEF-SURF-MICROCRACK</option>
                    <option value="DEF-HYD-PRESSURE-FAIL">DEF-HYD-PRESSURE-FAIL</option>
                    <option value="DEF-TOL-RIVET-HOLE">DEF-TOL-RIVET-HOLE</option>
                    <option value="DEF-WELD-POROSITY">DEF-WELD-POROSITY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-neutral-300 uppercase mb-1">Technical Findings Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="NDT probe inspection report, proof test failure points, coordinate measurement deviations..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Quarantine Lot & File NCR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MRB Disposition Modal */}
      {selectedNcrForDisposition && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] border border-neutral-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>MRB Disposition Sign-off</span>
              </h3>
              <button onClick={() => setSelectedNcrForDisposition(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Material Review Board determination for <strong>{selectedNcrForDisposition.ncr_number}</strong> ({selectedNcrForDisposition.part_name}).
              </p>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-neutral-300 uppercase mb-2">
                  Select MRB Determination:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['REWORK', 'SCRAP', 'USE_AS_IS', 'UNDER_REVIEW'] as const).map((disp) => (
                    <button
                      key={disp}
                      type="button"
                      onClick={() => setDispositionChoice(disp)}
                      className={cn(
                        'py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all text-left cursor-pointer',
                        dispositionChoice === disp
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      )}
                    >
                      {disp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedNcrForDisposition(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyDisposition}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Commit MRB Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
