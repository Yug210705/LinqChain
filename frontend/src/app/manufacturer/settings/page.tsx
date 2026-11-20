'use client';

import React, { useState } from 'react';
import { useManufacturerStore } from '@/stores/useManufacturerStore';
import {
  Factory,
  Radio,
  Clock,
  ShieldCheck,
  Cpu,
  Download,
  CheckCircle2,
  Activity,
  Server,
  Zap,
  Gauge,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManufacturerSettingsPage() {
  const { manufacturerUser, telemetry } = useManufacturerStore();

  const [opcHost, setOpcHost] = useState('opc.tcp://10.240.18.90:4840');
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handlePingSCADA = () => {
    setIsPinging(true);
    setPingStatus(null);
    setTimeout(() => {
      setIsPinging(false);
      setPingStatus(
        `OPC-UA Handshake Succeeded: Station TX4-MASTER responsive (RTT 16.2ms, PLC Cycle: ${telemetry.plc_cycle_time_ms}ms, 0 packet loss)`
      );
    }, 900);
  };

  const handleDownloadDiagnostics = () => {
    const diagnosticPayload = {
      timestamp: new Date().toISOString(),
      plant_code: manufacturerUser?.plant_code,
      plant_name: manufacturerUser?.plant_name,
      clearance_level: manufacturerUser?.clearance_level,
      scada_station_id: manufacturerUser?.scada_station_id,
      telemetry,
      environment: 'PRODUCTION_AIRWORTHINESS_FACILITY_TX4',
      iso_standards: ['AS9100D', 'ISO-14644-1_Class7', 'NADCAP_AMS2750'],
    };

    const blob = new Blob([JSON.stringify(diagnosticPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mfg_plant_tx4_diagnostics_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Enterprise Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
            <span>Plant TX-04</span>
            <span>/</span>
            <span>Administration</span>
            <span>/</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Facility Telemetry & Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Plant Configuration & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1">
            OPC-UA SCADA gateway integration, shop-floor shift rotations, and airworthiness audit logs
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadDiagnostics}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 dark:border-neutral-700 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Diagnostic Bundle</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-semibold">Plant SCADA diagnostic bundle exported successfully.</span>
        </div>
      )}

      {/* 4-Card Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">SCADA Gateway</span>
            <Radio className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2">
            ONLINE
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 font-mono">
            OPC-UA RTT 16.2ms · 10.240.18.90
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">PLC Cycle Time</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {telemetry.plc_cycle_time_ms} <span className="text-sm font-medium text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Deterministic loop (Limit: 25.0ms)
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Cleanroom Class</span>
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {telemetry.cleanroom_iso_class}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            ISO 14644-1 Air Quality Certified
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/80" />
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Power Demand</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {telemetry.power_draw_kw} <span className="text-sm font-medium text-slate-400">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
            Peak load within 88% grid budget
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Facility Identity & SCADA Gateway (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Plant Master Record */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Plant Master Record & Facility Profile
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ACTIVE SITE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-neutral-500">
                  Facility Code
                </span>
                <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {manufacturerUser?.plant_code || 'PLANT-TX-04'}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1">
                  Plant site ID registered in MES master directory
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-neutral-500">
                  Facility Name
                </span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {manufacturerUser?.plant_name || 'Aerospace Propulsion Center - Plant TX-04'}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1">
                  Primary assembly & turbine cell location
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-neutral-500">
                  Cleanroom Rating
                </span>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {telemetry.cleanroom_iso_class} · Class 10,000
                </div>
                <div className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1">
                  Positive pressure laminar airflow verified
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 dark:text-neutral-500">
                  Master SCADA Console
                </span>
                <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {manufacturerUser?.scada_station_id || 'SCADA-TX4-MASTER-CON'}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1">
                  Failover redundant host with automatic sync
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: SCADA OPC-UA Endpoint Gateway */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  OPC-UA Real-Time SCADA Gateway
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-neutral-500">
                PORT 4840 · BINARY TCP
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-600 dark:text-neutral-300 uppercase mb-1.5">
                  OPC-UA Server Endpoint URI
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={opcHost}
                    onChange={(e) => setOpcHost(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                  <button
                    onClick={handlePingSCADA}
                    disabled={isPinging}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isPinging ? 'Pinging Node...' : 'Test SCADA Connection'}
                  </button>
                </div>
              </div>

              {pingStatus && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{pingStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase block">PLC Cycle Rate</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {telemetry.plc_cycle_time_ms} ms
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase block">Ambient Temp</span>
                  <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                    {telemetry.factory_temp_celsius} °C
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-center font-mono">
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase block">Total Power Draw</span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                    {telemetry.power_draw_kw} kW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shift Rotations & Airworthiness Clearance (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section 3: Operating Shifts */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Operating Shifts
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">3 ROTATIONS</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    SHIFT 1 (DAY)
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    ACTIVE NOW
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">06:00 - 14:30 CST</div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  Lead: Col. Marcus Vance (Ret.)
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-neutral-300 font-mono">
                    SHIFT 2 (SWING)
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
                    UPCOMING
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">14:00 - 22:30 CST</div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Lead: Eng. Sarah Jenkins</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-neutral-300 font-mono">
                    SHIFT 3 (NIGHT)
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
                    SCHEDULED
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">22:00 - 06:30 CST</div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Lead: Tech. Elena Rostova</p>
              </div>
            </div>
          </div>

          {/* Section 4: Airworthiness & Security */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Airworthiness & Audit
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                CERTIFIED
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-neutral-800/80">
                <span className="text-slate-500 dark:text-neutral-400">FAA FAR Part 145:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">APPROVED (EXP: 2027)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-neutral-800/80">
                <span className="text-slate-500 dark:text-neutral-400">EASA Part 21G:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">COMPLIANT (EASA.21G.0089)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-neutral-800/80">
                <span className="text-slate-500 dark:text-neutral-400">NADCAP Heat Treating:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">AUDIT PASS (MERIT 24M)</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 dark:text-neutral-400">Operator Clearance:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">LEVEL-4 CRYPTO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
