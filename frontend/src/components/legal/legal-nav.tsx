'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, ExternalLink, Cookie } from 'lucide-react';

export function LegalHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0d12] sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mission Control</span>
          </Link>
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center p-1">
              <img src="/linqchain-logo.svg" alt="LinqChain" className="w-full h-full object-contain" />
            </div>
            <span className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
              LinqChain Legal & Compliance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GDPR, CCPA & SOC 2 Ready</span>
          </span>
          <Link
            href="/login"
            className="px-3.5 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Operator Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}

export function LegalFooter() {
  const openCookieModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('linqchain:open-cookie-preferences'));
    }
  };

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#08080a] py-12 px-6 mt-16 text-xs text-neutral-500 dark:text-neutral-400">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-orange-500/10 border border-orange-500/30 flex items-center justify-center p-1">
            <img src="/linqchain-logo.svg" alt="LinqChain" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-200">
              © {new Date().getFullYear()} LinqChain Technologies Inc. All rights reserved.
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Autonomous Supply Chain Resilience & S/4HANA Closed-Loop Orchestration.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 font-medium">
          <Link href="/privacy" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/security" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Data Security & Breach SOP
          </Link>
          <Link href="/licenses" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Open Source Licenses
          </Link>
          <Link href="/pricing" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Subscription & SLA Terms
          </Link>
          <button
            type="button"
            onClick={openCookieModal}
            className="flex items-center gap-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer"
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookie Preferences</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
