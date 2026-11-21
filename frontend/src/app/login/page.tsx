'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSupplierStore } from '@/stores/useSupplierStore';
import { useManufacturerStore } from '@/stores/useManufacturerStore';
import { useAdminStore } from '@/stores/useAdminStore';
import { useAuthorizedUsersStore } from '@/stores/useAuthorizedUsersStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { EnterpriseSsoModal } from '@/components/auth/EnterpriseSsoModal';
import {
  Globe,
  Bot,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  ShieldAlert,
  Zap,
  Activity,
  Network,
  Radio,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginWithMicrosoft, loginWithSAP, loginGuest } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const greetingName = (mounted && user?.display_name)
    ? user.display_name.replace(/\s*\(.*\)/, '').trim().split(' ')[0] || 'Yug'
    : 'Yug';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [activeSsoModal, setActiveSsoModal] = useState<'microsoft' | 'sap' | null>(null);
  const [selectedLang, setSelectedLang] = useState('English');
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const authRecord = useAuthorizedUsersStore.getState().getAuthorizedUserByEmail(cleanEmail);

      if (!authRecord) {
        throw new Error(
          `Access Denied: "${email}" is not authorized for any LinqChain portal. Please contact an administrator.`
        );
      }

      if (!authRecord.is_active) {
        throw new Error(
          `Access Denied: Account "${email}" has been disabled. Please contact your system administrator.`
        );
      }

      // Record active portal and user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('linqchain.active_portal', authRecord.authorized_portal);
        localStorage.setItem('linqchain.user_email', authRecord.email);
      }

      // Route strictly based on the authorized portal assignment
      switch (authRecord.authorized_portal) {
        case 'OPERATOR':
          try {
            await login(authRecord.email, password);
          } catch {
            // Local fallback handled in store
          }
          router.push('/command-center');
          break;

        case 'SUPPLIER':
          await useSupplierStore.getState().login(authRecord.email, password);
          router.push('/supplier');
          break;

        case 'MANUFACTURER':
          await useManufacturerStore.getState().login(authRecord.email, password);
          router.push('/manufacturer');
          break;

        case 'ADMIN':
          await useAdminStore.getState().login(authRecord.email, password);
          router.push('/admin');
          break;

        default:
          router.push('/command-center');
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = () => {
    setError(null);
    setActiveSsoModal('microsoft');
  };

  const handleSapLogin = () => {
    setError(null);
    setActiveSsoModal('sap');
  };

  const handleSsoSuccess = async (profile: { email: string; displayName: string }) => {
    setError(null);
    try {
      if (activeSsoModal === 'microsoft') {
        await loginWithMicrosoft(profile);
      } else if (activeSsoModal === 'sap') {
        await loginWithSAP(profile);
      }
      router.push('/command-center');
    } catch (err: any) {
      setError(err?.message || 'Single Sign-On authentication failed.');
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setIsGuestLoading(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('linqchain.active_portal', 'OPERATOR');
        localStorage.setItem('linqchain.user_email', 'guest@resilienceos.com');
      }
      await loginGuest();
      router.push('/command-center');
    } catch (err: any) {
      setError(err.message || 'Guest session initialization failed.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row overflow-x-clip bg-white text-neutral-900 select-none font-sans"
    >
      {/* ========================================================================= */}
      {/* LEFT COLUMN: HERO PANEL & LIVE DIGITAL TWIN (Dark #08080a)                */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[44%] xl:w-[42%] 2xl:w-[40%] bg-[#08080a] p-6 sm:p-8 lg:p-8 xl:p-10 flex flex-col justify-between shrink-0 lg:h-screen lg:overflow-y-auto border-r border-neutral-900">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 mb-5 lg:mb-6">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center p-1.5 shadow-sm">
              <img src="/linqchain-logo.svg" alt="LinqChain" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              LinqChain
            </span>
          </div>

          {/* Hero Typography */}
          <div className="space-y-1 mb-3 lg:mb-4">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
              One OS.
            </h1>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Every supply chain.
            </h1>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-[#ea580c] leading-tight">
              All resilient.
            </h1>
          </div>

          <p className="text-neutral-400 text-xs sm:text-sm lg:text-base leading-relaxed max-w-md mb-4 lg:mb-6">
            LinqChain helps modern enterprises predict, simulate, and automatically recover from supply chain disruptions before they impact the bottom line.
          </p>
        </div>

        {/* Live Executive Digital Twin Card */}
        <div className="relative overflow-hidden bg-[#0c0d12] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl mt-auto">
          {/* Ambient Lighting & Top Orange Accent Edge */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-orange-500/80 to-transparent" />

          {/* Card Header: Executive Greeting + Live System Telemetry Badge */}
          <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] shrink-0" />
              <div>
                <span suppressHydrationWarning className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  Good morning, {greetingName}! 👋
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Autonomous Digital Twin • Global Tier 1-3
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#08201a] border border-emerald-500/30 text-xs font-mono font-medium text-emerald-400 shrink-0">
              <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
              <span>SAP LIVE SYNC</span>
            </div>
          </div>

          {/* 4 Metric Tiles in Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5 relative z-10">
            {/* Tile 1: Active Disruptions */}
            <div className="bg-[#13141b] border border-white/10 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-amber-400 whitespace-nowrap shrink-0">
                  4 active
                </span>
              </div>
              <div className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-none my-1.5">
                12
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">
                DISRUPTIONS
              </div>
            </div>

            {/* Tile 2: Autonomous Actions */}
            <div className="bg-[#13141b] border border-white/10 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-400 whitespace-nowrap shrink-0">
                  ↑ 18%
                </span>
              </div>
              <div className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-none my-1.5">
                342
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">
                AI ACTIONS
              </div>
            </div>

            {/* Tile 3: Recovery Score */}
            <div className="bg-[#13141b] border border-white/10 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-400 whitespace-nowrap shrink-0">
                  ↑ 9%
                </span>
              </div>
              <div className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-none my-1.5">
                94%
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">
                RECOVERY
              </div>
            </div>

            {/* Tile 4: Suppliers & Routes */}
            <div className="bg-[#13141b] border border-white/10 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-400 whitespace-nowrap shrink-0">
                  ↑ 7%
                </span>
              </div>
              <div className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-none my-1.5">
                1,112
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">
                SUPPLIERS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDE: WHITE CANVAS WITH CENTER FORM & SOCIAL PROOF                 */}
      {/* ========================================================================= */}
      <div className="flex-1 bg-white flex flex-col lg:flex-row relative lg:h-screen lg:overflow-y-auto">
        {/* CENTER COLUMN: AUTHENTICATION FORM */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 lg:px-12 py-10 max-w-xl mx-auto w-full">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
                Welcome back
              </h2>
              <p className="text-sm text-neutral-500">
                Sign in to continue to Resilience OS
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{error}</span>
              </div>
            )}

            {/* SSO / Identity Buttons */}
            <div className="space-y-3 mb-6">
              {/* Continue with SAP */}
              <button
                type="button"
                onClick={handleSapLogin}
                disabled={isLoading || isGuestLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded-xl text-neutral-800 text-sm font-medium flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#008FD3" />
                  <path d="M2 17L12 22V12L2 7V17Z" fill="#0070B8" />
                  <path d="M22 17L12 22V12L22 7V17Z" fill="#18A0E3" />
                </svg>
                <span>Continue with SAP</span>
              </button>

              {/* Continue with Microsoft */}
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={isLoading || isGuestLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded-xl text-neutral-800 text-sm font-medium flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 shrink-0">
                  <div className="w-1.5 h-1.5 bg-[#f25022]" />
                  <div className="w-1.5 h-1.5 bg-[#7fba00]" />
                  <div className="w-1.5 h-1.5 bg-[#00a4ef]" />
                  <div className="w-1.5 h-1.5 bg-[#ffb900]" />
                </div>
                <span>Continue with Microsoft</span>
              </button>

              {/* Continue as Guest */}
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={isGuestLoading || isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded-xl text-neutral-800 text-sm font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isGuestLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Connecting as Guest...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span>Continue as Guest</span>
                  </>
                )}
              </button>
            </div>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                OR
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Password
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-400">Fill:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin@linqchain.com');
                        setPassword('admin123');
                      }}
                      className="text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
                    >
                      Admin
                    </button>
                    <span className="text-neutral-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('operator@linqchain.com');
                        setPassword('operator123');
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                    >
                      Operator
                    </button>
                    <span className="text-neutral-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('supplier@titanium-forgings.com');
                        setPassword('supplier123');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                    >
                      Supplier
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Solid Indigo Sign In Button */}
              <button
                type="submit"
                disabled={isLoading || isGuestLoading}
                className="w-full py-3 px-4 bg-[#5057ea] hover:bg-[#434ad8] active:bg-[#383ec4] text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center mt-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Bottom Links */}
            <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col items-center gap-2 text-xs text-neutral-500">
              <div suppressHydrationWarning className="flex items-center gap-1.5 text-neutral-500">
                <span
                  suppressHydrationWarning
                  className={`w-2 h-2 rounded-full ${
                    mounted && isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span suppressHydrationWarning>
                  {mounted && isSupabaseConfigured
                    ? 'Connected to Supabase Cloud'
                    : 'Enterprise Local Hybrid Engine (Supabase Ready)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@linqchain.com');
                  setPassword('admin123');
                }}
                className="text-neutral-600 hover:text-amber-600 transition-colors font-medium cursor-pointer"
              >
                Sign in to Owner Admin Portal →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SOCIAL PROOF & DR. SUPPLY AI CO-PILOT */}
        <div className="w-full lg:w-[280px] xl:w-[320px] 2xl:w-[360px] p-6 lg:p-10 flex flex-col justify-between shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-100">
          <div>
            {/* Top Right Language Selector */}
            <div className="flex justify-end mb-8 relative">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 shadow-xs cursor-pointer transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{selectedLang}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in">
                    {['English', 'Deutsch', '日本語', 'Français', 'Español'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLang(lang);
                          setShowLangMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center justify-between transition-colors"
                      >
                        <span>{lang}</span>
                        {selectedLang === lang && <Check className="w-3 h-3 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dr. Supply AI Co-pilot Floating Badge */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center gap-3 mb-10">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/60 flex items-center justify-center p-1.5 shrink-0">
                <img src="/linqchain-logo.svg" alt="Co-pilot" className="w-full h-full object-contain" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-neutral-900 truncate">Dr. Supply</div>
                <div className="text-xs text-neutral-500">AI Co-pilot</div>
              </div>
            </div>

            {/* Why Teams Love Resilience OS */}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-5">
                Why teams love Resilience OS
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-indigo-200 bg-indigo-50/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-neutral-600 leading-snug">
                    All-in-one command center for supply chain visibility
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-indigo-200 bg-indigo-50/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-neutral-600 leading-snug">
                    Powerful simulations and real-time impact analysis
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-indigo-200 bg-indigo-50/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-neutral-600 leading-snug">
                    Direct SAP S/4HANA read/write integrations
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-indigo-200 bg-indigo-50/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-neutral-600 leading-snug">
                    Secure, compliant, and built for enterprise
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Certification */}
          <div className="text-[11px] text-neutral-400 mt-auto pt-6 border-t border-neutral-100">
            Enterprise Security Standard 27001 • SOC2 Type II Certified
          </div>
        </div>
      </div>

      <EnterpriseSsoModal
        isOpen={activeSsoModal !== null}
        onClose={() => setActiveSsoModal(null)}
        provider={activeSsoModal}
        onSuccess={handleSsoSuccess}
      />
    </div>
  );
}
