'use client';
import { Moon, Sun, Monitor, Coins, Info, Check, ShieldAlert, Gauge, Cpu, Database, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useAppSettings, CURRENCY_META, type CurrencyCode } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

const APP_VERSION = '2.1.0';
const APP_BUILD = 'build 2026.09.03-1430 (resilience-core)';

const THEMES = [
  { id: 'system', label: 'System', desc: 'Follow your OS preference', icon: Monitor },
  { id: 'light', label: 'Light', desc: 'Bright control room', icon: Sun },
  { id: 'dark', label: 'Dark', desc: 'Low-light mission mode', icon: Moon },
] as const;

const MODULES = [
  { name: 'Command Center', desc: 'Live disruption simulation & impact overview', icon: Zap },
  { name: 'Impact Engine', desc: 'Deterministic graph-theory cascade simulation', icon: Database },
  { name: 'Recovery Engine', desc: 'Multi-scenario plan generation & scoring', icon: Gauge },
  { name: 'AI Risk & Policy Audit', desc: 'Policy validation on every recovery plan', icon: ShieldAlert },
];

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { currency, setCurrency } = useAppSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const themeId = (theme as string) || 'system';
  const effectiveTheme = mounted ? (resolvedTheme || 'light') : 'light';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Appearance, preferences, and system information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ------------------- APPEARANCE ------------------- */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-1">
            <Moon className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
            <h2 className="font-bold text-slate-900 dark:text-white">Appearance</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Choose how Resilience OS looks.</p>

          <div className="space-y-2.5">
            {THEMES.map((t) => {
              const active = themeId === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-left',
                    active
                      ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  )}
                >
                  <span className="flex items-center">
                    <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center mr-3', active ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400')}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span>
                      <span className={cn('block text-sm font-semibold', active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white')}>{t.label}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">{t.desc}</span>
                    </span>
                  </span>
                  {active && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}
          </div>

          {mounted && (
            <p className="mt-4 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Currently rendering <span className="font-bold text-slate-600 dark:text-slate-300">{effectiveTheme === 'dark' ? 'Dark' : 'Light'}</span> mode.
            </p>
          )}
        </div>

        {/* ------------------- CURRENCY ------------------- */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-1">
            <Coins className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
            <h2 className="font-bold text-slate-900 dark:text-white">Currency</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Used across recovery plans, scenarios and exposure figures.
          </p>

          <div className="space-y-2.5">
            {(Object.keys(CURRENCY_META) as CurrencyCode[]).map((code) => {
              const meta = CURRENCY_META[code];
              const active = currency === code;
              return (
                <button
                  key={code}
                  onClick={() => setCurrency(code)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-left',
                    active
                      ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  )}
                >
                  <span className="flex items-center">
                    <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center mr-3 font-bold text-sm', active ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')}>
                      {meta.symbol}
                    </span>
                    <span>
                      <span className={cn('block text-sm font-semibold', active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white')}>{code}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">{meta.label}</span>
                    </span>
                  </span>
                  {active && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Preview</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(12540000)}</div>
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">12.54M exposure · {formatCurrency(482000)} · {formatCurrency(18750)}</div>
          </div>
        </div>
      </div>

      {/* ------------------- ABOUT / VERSION ------------------- */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 mt-6">
        <div className="flex items-center mb-1">
          <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
          <h2 className="font-bold text-slate-900 dark:text-white">About Resilience OS</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Version</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">{APP_VERSION}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Build</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">2.1.0</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Environment</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">Production</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tenant</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">Hackfest</div>
          </div>
        </div>

        <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-3">{APP_BUILD}</p>

        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-3">Core Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODULES.map((m) => (
            <div key={m.name} className="flex items-start bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 shrink-0">
                <m.icon className="w-4 h-4" />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900 dark:text-white">{m.name}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{m.desc}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            SAP disruptive supply-chain resilience platform · © 2026 Resilience OS
          </span>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 inline-flex items-center">
            <Cpu className="w-3 h-3 mr-1" /> Next.js 15 · FastAPI · Postgres
          </span>
        </div>
      </div>
    </div>
  );
}