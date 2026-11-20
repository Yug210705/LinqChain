'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Cookie, X, Check, Sliders, ExternalLink, AlertCircle } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

const STORAGE_KEY = 'linqchain.cookie_consent_v1';

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasGpcSignal, setHasGpcSignal] = useState(false);

  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString(),
    version: '1.0'
  });

  useEffect(() => {
    setMounted(true);

    // 1. Detect Global Privacy Control (GPC) or Do Not Track (DNT)
    const gpcActive =
      (typeof window !== 'undefined' &&
        ((navigator as any).globalPrivacyControl === true ||
          (navigator as any).doNotTrack === '1' ||
          (window as any).doNotTrack === '1'));
    setHasGpcSignal(Boolean(gpcActive));

    // 2. Read existing saved consent
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
        setIsOpen(false);
      } else {
        // Initial visit: if GPC detected, respect it by keeping non-essential false
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }

    // 3. Register global event listener so footer / settings can open preferences
    const handleOpenPreferences = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('linqchain:open-cookie-preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('linqchain:open-cookie-preferences', handleOpenPreferences);
    };
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // storage quota / private browsing fallback
    }
    setPreferences(prefs);
    setIsOpen(false);
    setIsModalOpen(false);

    // Dispatch global event for analytics providers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('linqchain:cookie-consent-updated', { detail: prefs }));
    }
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    });
  };

  if (!mounted) return null;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING BOTTOM-RIGHT COOKIE CONSENT BANNER (MNC ENTERPRISE DESIGN)    */}
      {/* ========================================================================= */}
      {isOpen && !isModalOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 left-5 sm:left-auto sm:max-w-[440px] md:max-w-[460px] z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#0e0f14]/95 backdrop-blur-xl border border-white/10 text-white rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden">
            {/* Top Orange Accent Edge */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-orange-500/80 to-transparent" />

            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center shrink-0 text-orange-400 shadow-sm">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    Cookie & Privacy Controls
                  </h3>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-semibold text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                GDPR • CCPA
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mt-1">
              LinqChain uses essential cookies to authenticate operator mission sessions and maintain SAP S/4HANA bridge integrity. Non-essential performance telemetry is optional.
            </p>

            {hasGpcSignal && (
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Global Privacy Control (GPC) detected: optional telemetry disabled.</span>
              </div>
            )}

            <div className="pt-3.5 mt-3.5 border-t border-white/10 flex flex-col gap-2.5">
              {/* Action Buttons: 3 clean columns */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg border border-white/10 transition-colors text-center cursor-pointer"
                >
                  Preferences
                </button>
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg border border-white/10 transition-colors text-center cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-sm transition-all text-center cursor-pointer"
                >
                  Accept All
                </button>
              </div>

              {/* Sub-footer links */}
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
                <div className="flex items-center gap-2">
                  <Link href="/privacy" className="hover:text-white underline underline-offset-2 transition-colors">Privacy Policy</Link>
                  <span>•</span>
                  <Link href="/terms" className="hover:text-white underline underline-offset-2 transition-colors">Terms</Link>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">SOC 2 Type II Certified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GRANULAR PREFERENCES MODAL                                             */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121319] border border-white/15 text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Privacy & Cookie Preferences</h2>
                <p className="text-xs text-neutral-400">Configure which categories of data LinqChain is authorized to process.</p>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1 my-4">
              {/* Category 1: Strictly Necessary */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Strictly Necessary Cookies</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Required for basic site operation, JWT operator session verification, CSRF token validation, and multi-tenant isolation. Cannot be disabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="mt-1 w-4 h-4 rounded text-orange-600 bg-neutral-800 border-neutral-700 cursor-not-allowed opacity-75"
                />
              </div>

              {/* Category 2: Functional */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Functional & Workspace State</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Remembers your UI theme preference (Dark/Light), selected currency, supply chain canvas coordinates, and collapsed panel states.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-orange-600 bg-neutral-800 border-neutral-700 cursor-pointer focus:ring-orange-500"
                />
              </div>

              {/* Category 3: Analytics & Diagnostics */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Performance Telemetry & Diagnostics</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Collects anonymized platform error traces and API roundtrip latencies to help our engineering team resolve runtime performance bottlenecks.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-orange-600 bg-neutral-800 border-neutral-700 cursor-pointer focus:ring-orange-500"
                />
              </div>

              {/* Category 4: Marketing & Announcements */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Product Releases & Incident Advisories</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Allows delivery of new AI agent release digests, supply chain resilience webinars, and partner integration notifications.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-orange-600 bg-neutral-800 border-neutral-700 cursor-pointer focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Link
                href="/privacy"
                target="_blank"
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Read Full Privacy Policy</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition-colors cursor-pointer"
                >
                  Reject All Non-Essential
                </button>
                <button
                  type="button"
                  onClick={() => savePreferences(preferences)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save My Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
