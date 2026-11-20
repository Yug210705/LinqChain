'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupplierStore } from '@/stores/useSupplierStore';
import { useTheme } from 'next-themes';
import {
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
  Check,
  Truck,
  Radio,
  Factory,
  ShieldCheck,
  LogOut,
  Settings,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SupplierTopbar() {
  const router = useRouter();
  const { supplierUser, logout } = useSupplierStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState('Production');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const envRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (envRef.current && !envRef.current.contains(e.target as Node)) {
        setIsEnvOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const displayName = supplierUser?.display_name || 'Marcus Vance';
  const companyName = supplierUser?.company_name || 'Titanium Alloy Forgings Corp';
  const vendorCode = supplierUser?.vendor_code || 'VEND-8821-TI';

  const getInitials = (name: string) => {
    const clean = name.replace(/\s*\(.*\)/, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return clean.slice(0, 2).toUpperCase() || 'SP';
  };

  return (
    <header className="h-16 bg-white dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between px-6 shadow-xs z-10 shrink-0">
      {/* 1. Global Enterprise Search Bar */}
      <div className="flex items-center bg-slate-50 dark:bg-neutral-900 rounded-lg px-3 py-2 w-[420px] border border-slate-200 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-blue-500/40 transition-shadow">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search purchase orders, ASNs, part batches, CoA certs..."
          className="bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-neutral-100 placeholder:text-slate-400"
        />
        <div className="flex items-center justify-center bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded px-1.5 py-0.5 ml-2 shrink-0 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-neutral-400">⌘K</span>
        </div>
      </div>

      {/* 2. Center & Right Enterprise Telemetry Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4 text-sm">
        {/* SAP BAPI RFC Active Beacon */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-neutral-900/90 border border-slate-200/90 dark:border-neutral-800 text-xs font-mono font-medium text-slate-700 dark:text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse" />
          <span>SAP RFC Bridge: Active (14ms)</span>
        </div>

        {/* Vendor Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs tracking-tight shrink-0 font-mono">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
          <span>Tier-1 Partner Verified</span>
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-200 dark:border-neutral-800 shrink-0" />

        {/* Action Icons: Notification, Help, Theme */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            title="PO Notifications"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800/60 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          <Link
            href="/help"
            title="Vendor Integration & EDI Specs"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800/60 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </Link>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-200 dark:border-neutral-800 shrink-0" />

        {/* Environment Selector Dropdown */}
        <div className="relative" ref={envRef}>
          <button
            type="button"
            onClick={() => setIsEnvOpen(!isEnvOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-neutral-700 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-xs">{selectedEnv}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isEnvOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in">
              {['Production', 'SAP BAPI Sandbox', 'EDI Test Gateway'].map((envOption) => (
                <button
                  key={envOption}
                  onClick={() => {
                    setSelectedEnv(envOption);
                    setIsEnvOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800/80 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className={cn('w-1.5 h-1.5 rounded-full', envOption === 'Production' ? 'bg-emerald-500' : 'bg-amber-500')} />
                    <span>{envOption}</span>
                  </span>
                  {selectedEnv === envOption && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2.5 text-left p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {getInitials(displayName)}
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                {displayName}
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-medium leading-tight mt-0.5 truncate">
                {vendorCode} • Tier-1
              </div>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-neutral-800 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  {getInitials(displayName)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                    {companyName}
                  </div>
                </div>
              </div>

              <Link
                href="/supplier/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 flex items-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Vendor Master & Security Credentials</span>
              </Link>

              <div className="my-1 border-t border-slate-100 dark:border-neutral-800" />

              <div className="my-1 border-t border-slate-100 dark:border-neutral-800" />
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Terminate Partner Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
