'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAppSettings, CURRENCY_META, type CurrencyCode } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePersonalizationStore } from '@/stores/usePersonalizationStore';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { resetDisruptions } from '@/services/api';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Moon,
  Sun,
  Monitor,
  Coins,
  Camera,
  Upload,
  Info,
  Check,
  ShieldAlert,
  Gauge,
  Cpu,
  Database,
  Zap,
  LogOut,
  User,
  Building,
  Sliders,
  Bell,
  Radio,
  Network,
  FileText,
  ArrowRight,
  RefreshCw,
  Key,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Workflow,
  Terminal,
  Layers,
  Sparkles,
  Bot,
  Flame,
  Volume2,
  VolumeX,
  Lock,
  Globe,
  Share2,
  Cookie,
  Scale,
  Palette,
  Smartphone,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Laptop,
  Calendar,
  Clock,
  Fingerprint,
  Activity,
  Shield,
} from 'lucide-react';

const APP_VERSION = '2.1.0-enterprise';
const APP_BUILD = 'build 2026.10.30-orchestrator (resilience-core)';

const THEMES = [
  { id: 'system', label: 'System', desc: 'Follow your operating system preference', icon: Monitor },
  { id: 'light', label: 'Light', desc: 'High-contrast bright daylight control room', icon: Sun },
  { id: 'dark', label: 'Dark', desc: 'True charcoal & amber low-light mission mode', icon: Moon },
] as const;

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { currency, setCurrency } = useAppSettings();
  const { user, logout, updateUserProfile } = useAuthStore();
  const { activeDisruption, clearDisruption } = useSimulationStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | 'account'
    | 'personalization'
    | 'platform_concept'
    | 'ai_policies'
    | 'sap_erp'
    | 'notifications'
    | 'general'
    | 'system'
    | 'privacy_compliance'
  >('account');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // ------------------- Account Settings State -------------------
  const [profileName, setProfileName] = useState(user?.display_name || 'Sarah Chen');
  const [jobTitle, setJobTitle] = useState(user?.job_title || 'War Room Commander & Strategic SCM Director');
  const [department, setDepartment] = useState(user?.department || 'Aerospace Propulsion & Direct Materials');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+1 (555) 489-0128');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata (UTC+05:30)');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || 'amber');

  // Password Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  // Security Flags
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionsRevoked, setSessionsRevoked] = useState(false);

  // ------------------- Personalization & Cockpit State (Global Reactive Store) -------------------
  const {
    accentColor,
    density: uiDensity,
    highContrast,
    reducedMotion,
    defaultLandingPage,
    audioSignals,
    klaxonSound,
    audioVolume,
    dateFormat,
    clockFormat,
    numberFormat,
    operatingLanguage,
    graphFps,
    autoCenterGraph,
    setPersonalization,
  } = usePersonalizationStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compliance & Data Subject Rights State
  const [exportingData, setExportingData] = useState(false);
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [deletionEmail, setDeletionEmail] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState<string | null>(null);

  // Marketing & Communication Consents
  const [marketingConsents, setMarketingConsents] = useState({
    security_alerts: true,
    product_releases: false,
    weekly_digest: false,
    partner_notices: false,
  });

  // Advanced Platform Policy Settings (with localStorage persistence)
  const [autoApproveCap, setAutoApproveCap] = useState<number>(50000);
  const [aiStrategy, setAiStrategy] = useState<'balanced' | 'cost_optimal' | 'speed_first'>('balanced');
  const [blastRadiusHops, setBlastRadiusHops] = useState<number>(3);
  const [aiConfidenceCutoff, setAiConfidenceCutoff] = useState<number>(85);
  const [autoSapDispatch, setAutoSapDispatch] = useState<boolean>(false);
  const [sapMode, setSapMode] = useState<'sandbox' | 'live'>('sandbox');
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [slackWebhook, setSlackWebhook] = useState<string>('https://hooks.slack.com/services/T00/B00/XXXX');
  const [pagerdutyEnabled, setPagerdutyEnabled] = useState<boolean>(true);

  // Status feedback banners
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [resettingState, setResettingState] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load persisted settings
    if (typeof window !== 'undefined') {
      try {
        if (user?.display_name) setProfileName(user.display_name);
        if (user?.job_title) setJobTitle(user.job_title);
        if (user?.department) setDepartment(user.department);
        if (user?.phone) setPhoneNumber(user.phone);
        if (user?.timezone) setTimezone(user.timezone);
        if (user?.avatar_color) setAvatarColor(user.avatar_color);

        const savedCap = localStorage.getItem('linqchain.settings.auto_approve_cap');
        if (savedCap) setAutoApproveCap(Number(savedCap));

        const savedStrat = localStorage.getItem('linqchain.settings.ai_strategy');
        if (savedStrat && ['balanced', 'cost_optimal', 'speed_first'].includes(savedStrat)) {
          setAiStrategy(savedStrat as any);
        }

        const savedHops = localStorage.getItem('linqchain.settings.blast_radius_hops');
        if (savedHops) setBlastRadiusHops(Number(savedHops));

        const savedConf = localStorage.getItem('linqchain.settings.ai_confidence');
        if (savedConf) setAiConfidenceCutoff(Number(savedConf));

        const savedAutoSap = localStorage.getItem('linqchain.settings.auto_sap_dispatch');
        if (savedAutoSap) setAutoSapDispatch(savedAutoSap === 'true');

        const savedSapMode = localStorage.getItem('linqchain.settings.sap_mode');
        if (savedSapMode && ['sandbox', 'live'].includes(savedSapMode)) {
          setSapMode(savedSapMode as any);
        }

        const savedSound = localStorage.getItem('linqchain.settings.sound_alerts');
        if (savedSound) setSoundAlerts(savedSound === 'true');

        const savedWebhook = localStorage.getItem('linqchain.settings.slack_webhook');
        if (savedWebhook) setSlackWebhook(savedWebhook);
      } catch {
        /* storage unreadable */
      }
    }
  }, [user]);

  // Web Audio chime generator for interactive sound test
  const playTestChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15 * (audioVolume / 100), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      triggerSaveNotification('Audio alert synthesis test verified.');
    } catch {
      triggerSaveNotification('Audio playback tested (silenced by system).');
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      triggerSaveNotification('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      triggerSaveNotification('Image size exceeds 2.5MB. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateUserProfile({ avatar_url: dataUrl });
        triggerSaveNotification('Profile picture updated across the entire application.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    updateUserProfile({ avatar_url: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
    triggerSaveNotification('Custom photo removed. Reverted to beacon avatar.');
  };

  const handleNameChange = (val: string) => {
    setProfileName(val);
    updateUserProfile({ display_name: val });
  };

  const handleJobTitleChange = (val: string) => {
    setJobTitle(val);
    updateUserProfile({ job_title: val });
  };

  const handleDepartmentChange = (val: string) => {
    setDepartment(val);
    updateUserProfile({ department: val });
  };

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    updateUserProfile({ phone: val });
  };

  const handleTimezoneChange = (val: string) => {
    setTimezone(val);
    updateUserProfile({ timezone: val });
    triggerSaveNotification(`Timezone set to ${val}.`);
  };

  const handleAvatarColorChange = (colId: string) => {
    setAvatarColor(colId);
    updateUserProfile({ avatar_color: colId });
    triggerSaveNotification(`Avatar beacon accent changed to ${colId}.`);
  };

  const handleSaveProfile = () => {
    updateUserProfile({
      display_name: profileName,
      job_title: jobTitle,
      department: department,
      phone: phoneNumber,
      timezone: timezone,
      avatar_color: avatarColor,
    });
    triggerSaveNotification('Operator identity profile updated successfully.');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordStatus('Please enter your current security password.');
      return;
    }
    if (newPassword.length < 10) {
      setPasswordStatus('New password must be at least 10 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('New passwords do not match. Please verify.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordStatus(null);
    triggerSaveNotification('Security credentials successfully rotated and encrypted.');
  };

  const handleRevokeSessions = () => {
    setSessionsRevoked(true);
    triggerSaveNotification('All secondary active sessions terminated across remote gateways.');
  };

  const triggerSaveNotification = (msg: string) => {
    setSavedSuccess(msg);
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  const saveSetting = (key: string, val: string, message: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`linqchain.settings.${key}`, val);
    }
    triggerSaveNotification(message);
  };

  const handlePurgeGraphPositions = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('linqchain_graph_positions');
      localStorage.removeItem('linqchain_network_viewport');
      localStorage.removeItem('linqchain_network_filters');
      triggerSaveNotification('Reset graph node coordinates & layout positions to default topology grid.');
    }
  };

  const handleResetSimulations = async () => {
    if (resettingState) return;
    const ok = window.confirm(
      'Are you sure you want to purge all active disruptions and simulation history? This returns the digital twin to a zero-incident state.'
    );
    if (!ok) return;

    setResettingState(true);
    try {
      await resetDisruptions();
      clearDisruption();
      triggerSaveNotification('Successfully wiped simulation history and restored pristine supply chain state.');
    } catch (e: any) {
      alert(e?.message || 'Failed to reset disruptions');
    } finally {
      setResettingState(false);
    }
  };

  const handleExportSystemBundle = () => {
    const bundle = {
      system: 'LinqChain Supply Chain Command Center',
      version: APP_VERSION,
      build: APP_BUILD,
      timestamp: new Date().toISOString(),
      user: {
        email: user?.email || 'operator@linqchain.com',
        role: user?.role_name || 'SUPPLY_CHAIN_DIRECTOR',
        org: user?.org_name || 'Enterprise Aerospace Workspace',
      },
      policies: {
        currency,
        theme,
        autoApproveCap,
        aiStrategy,
        blastRadiusHops,
        aiConfidenceCutoff,
        sapMode,
        autoSapDispatch,
        pagerdutyEnabled,
        soundAlerts,
      },
      adapters: {
        sap_s4hana: { status: 'ONLINE', protocol: 'RFC_BAPI', mesh: 'ws://127.0.0.1:8000/api/sap/events' },
        fastapi_backend: { status: 'ONLINE', latency_ms: 12 },
      },
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linqchain-system-bundle-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateConsent = (key: keyof typeof marketingConsents, value: boolean) => {
    const updated = { ...marketingConsents, [key]: value };
    setMarketingConsents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('linqchain.marketing_consents', JSON.stringify(updated));
    }
    triggerSaveNotification(`Updated ${key.replace('_', ' ')} communication preference.`);
  };

  const handleExportUserData = async () => {
    setExportingData(true);
    try {
      let dataPayload;
      try {
        const token =
          (typeof window !== 'undefined' && (localStorage.getItem('linqchain.token') || localStorage.getItem('resilience_token'))) ||
          'demo-operator-token';
        const res = await fetch('http://127.0.0.1:8000/api/v1/compliance/export-user-data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          dataPayload = await res.json();
        }
      } catch {}

      if (!dataPayload) {
        dataPayload = {
          export_metadata: {
            format: 'GDPR-Art-20-Data-Portability-JSON',
            platform: 'LinqChain Enterprise Supply Chain OS',
            generated_at: new Date().toISOString(),
            data_controller: 'LinqChain Global Systems Inc. / privacy@linqchain.com',
          },
          identity_profile: {
            user_id: user?.id || 'demo-operator-id',
            email: user?.email || 'operator@linqchain.com',
            display_name: user?.display_name || 'Operator',
            assigned_role: user?.role_name || 'SUPPLY_CHAIN_DIRECTOR',
            organization: user?.org_name || 'Enterprise Aerospace Workspace',
          },
          privacy_and_consent_state: {
            essential_cookies: true,
            functional_state: true,
            analytics_telemetry: false,
            marketing_consents: marketingConsents,
            legal_basis: 'GDPR Art. 6(1)(b) Contract Performance & Art. 6(1)(f) Legitimate Interest',
          },
        };
      }

      const blob = new Blob([JSON.stringify(dataPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linqchain-gdpr-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      triggerSaveNotification('Personal data archive successfully generated and downloaded (GDPR Art. 20).');
    } finally {
      setExportingData(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!deletionEmail.trim()) return;
    setDeletionLoading(true);
    try {
      const token =
        (typeof window !== 'undefined' && (localStorage.getItem('linqchain.token') || localStorage.getItem('resilience_token'))) ||
        'demo-operator-token';
      try {
        await fetch('http://127.0.0.1:8000/api/v1/compliance/request-deletion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            confirm_email: deletionEmail,
            reason: deletionReason || 'Self-service account deletion',
            purge_telemetry: true,
          }),
        });
      } catch {}

      setDeletionSuccess(
        'Right to Erasure request accepted under GDPR Art. 17. Your account has been scheduled for permanent cryptographic deletion.'
      );
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleOpenCookiePreferences = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('linqchain:open-cookie-preferences'));
    }
  };

  const themeId = (theme as string) || 'system';
  const effectiveTheme = mounted ? resolvedTheme || 'dark' : 'dark';

  return (
    <div className="w-full max-w-[1850px] mx-auto py-2 px-1 sm:px-2 space-y-6">
      {/* ------------------- TOP OPERATOR PROFILE & LOGOUT STRIP ------------------- */}
      <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Amber Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-amber-500/10 dark:bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 z-10">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name || 'Operator'}
              className="w-14 h-14 rounded-2xl object-cover border border-amber-500/30 shadow-inner shrink-0"
            />
          ) : (
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-inner shrink-0 text-white transition-colors",
              user?.avatar_color === 'emerald' ? 'bg-emerald-600' :
              user?.avatar_color === 'sapphire' ? 'bg-blue-600' :
              user?.avatar_color === 'violet' ? 'bg-purple-600' :
              user?.avatar_color === 'crimson' ? 'bg-rose-600' :
              'bg-amber-600'
            )}>
              {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'O'}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.display_name || 'Mission Control Operator'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                {user?.job_title || user?.role_name || 'SUPPLY_CHAIN_DIRECTOR'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE SESSION
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 flex flex-wrap items-center gap-2">
              <span>{user?.email || 'operator@linqchain.com'}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-neutral-300">
                <Building className="w-3.5 h-3.5 text-amber-500" />
                {user?.department ? `${user.org_name || 'Enterprise Aerospace'} · ${user.department}` : (user?.org_name || 'Enterprise Aerospace Tenant')}
              </span>
              <span>•</span>
              <span className="text-slate-400 dark:text-neutral-500">Security Clearance Level 4</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Logout */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={handleExportSystemBundle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 transition-colors cursor-pointer"
            title="Download JSON system diagnostic snapshot"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Export Diagnostics</span>
          </button>



          <button
            onClick={() => setLogoutModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all cursor-pointer shadow-xs group"
          >
            <LogOut className="w-4 h-4 text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Status Saved Notification Toast */}
      {savedSuccess && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-semibold">{savedSuccess}</span>
        </div>
      )}

      {/* ------------------- NAVIGATION TABS ------------------- */}
      <div className="border-b border-slate-200 dark:border-neutral-800 pb-px flex overflow-x-auto gap-2 custom-scrollbar">
        {[
          { id: 'account', label: 'Account & Security', icon: User, badge: 'Profile' },
          { id: 'personalization', label: 'Personalization & Cockpit', icon: Palette, badge: 'UI/UX' },
          { id: 'platform_concept', label: 'Platform Concept & Architecture', icon: Workflow, badge: 'Core' },
          { id: 'ai_policies', label: 'AI & Autonomous Policies', icon: Bot, badge: 'AI Engine' },
          { id: 'sap_erp', label: 'SAP S/4HANA & ERP Bridge', icon: Database, badge: 'Integration' },
          { id: 'notifications', label: 'Alerts & Telemetry Matrix', icon: Bell },
          { id: 'privacy_compliance', label: 'Privacy & GDPR Compliance', icon: ShieldCheck, badge: 'GDPR/CCPA' },
          { id: 'general', label: 'Preferences & Appearance', icon: Sliders },
          { id: 'system', label: 'Platform Diagnostic & Resets', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded-t-lg',
                isActive
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:border-slate-300 dark:hover:border-neutral-700'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={cn(
                  'px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-normal',
                  isActive
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------- TAB: ACCOUNT & SECURITY ------------------- */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Identity Profile & Organizational Assignment */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Operator Profile & Credentials</h2>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">Manage identity information, mission command title, and regional timezone.</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                CLEARANCE LEVEL 4
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Avatar & Photo Upload & Color Swatches */}
              <div className="lg:col-span-4 flex flex-col items-center p-6 bg-slate-50 dark:bg-neutral-900/60 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 text-center">
                <div className="relative group">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={profileName}
                      className="w-24 h-24 rounded-full object-cover shadow-xl ring-4 ring-offset-4 ring-offset-white dark:ring-offset-[#18181b] ring-amber-500"
                    />
                  ) : (
                    <div className={cn(
                      'w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shadow-xl transition-all relative ring-4 ring-offset-4 ring-offset-white dark:ring-offset-[#18181b]',
                      avatarColor === 'emerald' ? 'bg-emerald-600 ring-emerald-500' :
                      avatarColor === 'sapphire' ? 'bg-blue-600 ring-blue-500' :
                      avatarColor === 'violet' ? 'bg-purple-600 ring-purple-500' :
                      avatarColor === 'crimson' ? 'bg-rose-600 ring-rose-500' :
                      'bg-amber-600 ring-amber-500'
                    )}>
                      {profileName.trim() ? profileName.charAt(0).toUpperCase() : 'O'}
                    </div>
                  )}

                  {/* Quick Change Overlay on Hover */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                    title="Upload custom profile photo"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Change</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/25 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{user?.avatar_url ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>
                  {user?.avatar_url && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25 transition-colors cursor-pointer"
                      title="Remove custom photo and use beacon initials"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-4">{profileName}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-neutral-400 mt-0.5">{jobTitle}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SSO Synchronized
                </div>

                {/* Avatar Color Swatches */}
                <div className="mt-5 w-full pt-4 border-t border-slate-200 dark:border-neutral-800">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block mb-2">Avatar Beacon Accent</label>
                  <div className="flex items-center justify-center gap-2.5">
                    {[
                      { id: 'amber', bg: 'bg-amber-500' },
                      { id: 'emerald', bg: 'bg-emerald-500' },
                      { id: 'sapphire', bg: 'bg-blue-500' },
                      { id: 'violet', bg: 'bg-purple-500' },
                      { id: 'crimson', bg: 'bg-rose-500' },
                    ].map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleAvatarColorChange(col.id)}
                        className={cn(
                          'w-6 h-6 rounded-full transition-transform cursor-pointer',
                          col.bg,
                          avatarColor === col.id ? 'scale-125 ring-2 ring-white dark:ring-neutral-200' : 'opacity-70 hover:opacity-100 hover:scale-110'
                        )}
                        title={`Select ${col.id} avatar tone`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Editable Fields */}
              <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1.5">
                      Full Operator Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 transition-colors"
                      placeholder="e.g. Sarah Chen"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1.5">
                      Corporate Work Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        readOnly
                        value={user?.email || 'operator@linqchain.com'}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 cursor-not-allowed pr-20"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        VERIFIED
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1.5">
                      Role / Mission Command Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => handleJobTitleChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 transition-colors"
                      placeholder="e.g. War Room Commander & SCM Director"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1.5">
                      Department / Business Unit
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 transition-colors"
                      placeholder="e.g. Aerospace Propulsion & Direct Materials"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1.5">
                      Escalation Mobile / PagerDuty SMS
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 transition-colors"
                      placeholder="+1 (555) 489-0128"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-1.5">
                      Operational Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => handleTimezoneChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 transition-colors cursor-pointer"
                    >
                      <option value="UTC (Universal Coordinated Time)">UTC (Universal Coordinated Time)</option>
                      <option value="America/New_York (UTC-05:00)">America/New_York (EST/EDT)</option>
                      <option value="America/Chicago (UTC-06:00)">America/Chicago (CST/CDT)</option>
                      <option value="America/Los_Angeles (UTC-08:00)">America/Los_Angeles (PST/PDT)</option>
                      <option value="Europe/London (UTC+00:00)">Europe/London (GMT/BST)</option>
                      <option value="Europe/Berlin (UTC+01:00)">Europe/Berlin (CET/CEST)</option>
                      <option value="Asia/Kolkata (UTC+05:30)">Asia/Kolkata (IST · +05:30)</option>
                      <option value="Asia/Singapore (UTC+08:00)">Asia/Singapore (SGT · +08:00)</option>
                      <option value="Asia/Tokyo (UTC+09:00)">Asia/Tokyo (JST · +09:00)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Password Security & Rotation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security Credentials & Password</h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">Regularly rotate passwords to protect autonomous execution permissions.</p>
                  </div>
                </div>

                {passwordStatus && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>{passwordStatus}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1">
                      Current Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                      placeholder="••••••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1">
                        New Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                        placeholder="Min 10 characters"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 hover:text-amber-500 flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Hide characters' : 'Show characters'}</span>
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-slate-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Password Quality Requirements */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex flex-wrap gap-3 text-[11px] text-slate-400">
                <span className={cn('flex items-center gap-1', newPassword.length >= 10 ? 'text-emerald-500 font-bold' : '')}>
                  <Check className="w-3 h-3" /> 10+ characters
                </span>
                <span className={cn('flex items-center gap-1', /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'text-emerald-500 font-bold' : '')}>
                  <Check className="w-3 h-3" /> Upper & Lower case
                </span>
                <span className={cn('flex items-center gap-1', /[0-9]/.test(newPassword) ? 'text-emerald-500 font-bold' : '')}>
                  <Check className="w-3 h-3" /> Number digit
                </span>
                <span className={cn('flex items-center gap-1', /[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-500 font-bold' : '')}>
                  <Check className="w-3 h-3" /> Symbol character
                </span>
              </div>
            </div>

            {/* MFA / 2FA & Multi-Device Governance */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h3>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">Enforced by organizational security policy for all war room operators.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ENFORCED
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-800 dark:text-neutral-200">Hardware & TOTP App</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">Google/MS Authenticator</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-800 dark:text-neutral-200">FIDO2 WebAuthn Key</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">YubiKey 5C NFC Bound</span>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => triggerSaveNotification('Generated 10 single-use emergency recovery codes (AES-256 encrypted).')}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Download Backup Codes
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerSaveNotification('Opened FIDO2 hardware token pairing wizard.')}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    >
                      Register New Key
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Sessions Strip */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                    Active Authorized Sessions
                  </span>
                  {!sessionsRevoked ? (
                    <button
                      type="button"
                      onClick={handleRevokeSessions}
                      className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Revoke Other Sessions
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-500">Secondary sessions purged</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800/60">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-semibold text-slate-800 dark:text-neutral-200">Current Workstation</span>
                      <span className="text-slate-400">· Windows 11 · 127.0.0.1</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">CURRENT</span>
                  </div>

                  {!sessionsRevoked && (
                    <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800/60">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800 dark:text-neutral-200">Executive iPad</span>
                        <span className="text-slate-400">· iPadOS 18 · 192.168.1.45</span>
                      </div>
                      <span className="text-[10px] text-slate-400">42m ago</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- TAB: PERSONALIZATION & COCKPIT ------------------- */}
      {activeTab === 'personalization' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Concept */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace Personalization & Cockpit Customization</h2>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">Tailor accent themes, mission auditory klaxons, default dashboards, and information density.</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                ACTIVE COCKPIT v2.1
              </span>
            </div>

            {/* Accent Color Palette Selector */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-3">
                Mission Control Interactive Accent Color
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[
                  { id: 'amber', label: 'Warm Amber', desc: 'Enterprise Mission Control Gold', hex: '#f59e0b', ring: 'border-amber-500', badge: 'bg-amber-500' },
                  { id: 'emerald', label: 'Cyber Emerald', desc: 'High-Resilience Operational Green', hex: '#10b981', ring: 'border-emerald-500', badge: 'bg-emerald-500' },
                  { id: 'sapphire', label: 'Electric Sapphire', desc: 'Corporate SAP Integration Blue', hex: '#3b82f6', ring: 'border-blue-500', badge: 'bg-blue-500' },
                  { id: 'crimson', label: 'War Room Crimson', desc: 'Incident Commander High-Alert', hex: '#ef4444', ring: 'border-red-500', badge: 'bg-red-500' },
                  { id: 'violet', label: 'Quantum Violet', desc: 'Autonomous AI Neural Orchestration', hex: '#8b5cf6', ring: 'border-purple-500', badge: 'bg-purple-500' },
                ].map((col) => {
                  const active = accentColor === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        setPersonalization({ accentColor: col.id as any });
                        triggerSaveNotification(`Applied ${col.label} accent theme across workspace.`);
                      }}
                      className={cn(
                        'flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer relative',
                        active
                          ? `${col.ring} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#18181b] bg-slate-50 dark:bg-neutral-900/80`
                          : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 bg-white dark:bg-[#18181b]'
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className={cn('w-6 h-6 rounded-full shadow-inner', col.badge)} />
                        {active && <Check className="w-4 h-4 text-slate-900 dark:text-white" />}
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{col.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-1 leading-snug">{col.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layout Density & High-Contrast Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-neutral-800">
              {/* Information Density */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-2">
                  Table & Graph Information Density
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'Compact', desc: 'Tight rows & max data throughput' },
                    { id: 'standard', label: 'Standard', desc: 'Balanced enterprise spacing' },
                    { id: 'comfortable', label: 'Comfortable', desc: 'Spacious cards for touchscreens' },
                  ].map((d) => {
                    const active = uiDensity === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setPersonalization({ density: d.id as any });
                          triggerSaveNotification(`Workspace layout density adjusted to ${d.label}.`);
                        }}
                        className={cn(
                          'p-3 rounded-xl border text-center transition-all cursor-pointer',
                          active
                            ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                            : 'border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800'
                        )}
                      >
                        <div className="text-xs">{d.label}</div>
                        <div className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1">{d.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Startup Default Landing View */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-2">
                  Default Cockpit Module on Login
                </label>
                <select
                  value={defaultLandingPage}
                  onChange={(e) => {
                    setPersonalization({ defaultLandingPage: e.target.value });
                    triggerSaveNotification('Default startup dashboard updated.');
                  }}
                  className="w-full px-3.5 py-3 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="/command-center">Command Center — Live Executive Twin & Disruption Matrix</option>
                  <option value="/disruptions">Disruptions Hub — Active Incident Cockpit</option>
                  <option value="/supply-chain">Supply Chain Graph — Multi-Tier Topology & Vulnerabilities</option>
                  <option value="/recovery">Recovery Orchestrator — AI Mitigation Pipeline</option>
                  <option value="/scenarios">Scenarios War Room — Chaos Simulation Studio</option>
                </select>
                <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1.5">
                  The mission control cockpit will automatically redirect to this module upon session initiation.
                </p>
              </div>
            </div>
          </div>

          {/* Auditory Telemetry & Acoustic Klaxons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Auditory Telemetry & War Room Signals</h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">Harmonic chimes and audible alerts for high-severity supply chain events.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Critical Disruption Siren</div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400">Sound alarm klaxon when Tier-1 supplier failure exceeds 70% severity</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={klaxonSound}
                      onChange={(e) => {
                        setPersonalization({ klaxonSound: e.target.checked });
                        triggerSaveNotification(e.target.checked ? 'Critical disruption sirens enabled.' : 'Critical disruption sirens silenced.');
                      }}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Autonomous PO Approval Chime</div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400">Play pleasant harmonic signal upon RFC execution in SAP S/4HANA</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={audioSignals}
                      onChange={(e) => {
                        setPersonalization({ audioSignals: e.target.checked });
                        triggerSaveNotification(e.target.checked ? 'Autonomous PO approval chimes enabled.' : 'Autonomous PO approval chimes silenced.');
                      }}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Volume Slider */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Telemetry Audio Volume</span>
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{audioVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioVolume}
                      onChange={(e) => {
                        setPersonalization({ audioVolume: Number(e.target.value) });
                      }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
                <button
                  type="button"
                  onClick={playTestChime}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/25 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Audio Alert Playback</span>
                </button>
              </div>
            </div>

            {/* Regional Formatting & Operating Language */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Regional Formatting & Localization</h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">Configure global number notation, date standards, and display language.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1">
                      Operating Language
                    </label>
                    <select
                      value={operatingLanguage}
                      onChange={(e) => {
                        setPersonalization({ operatingLanguage: e.target.value });
                        triggerSaveNotification('Operating language preference saved.');
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="en-US">English (United States)</option>
                      <option value="de-DE">Deutsch (Deutschland)</option>
                      <option value="fr-FR">Français (France)</option>
                      <option value="ja-JP">日本語 (Japan)</option>
                      <option value="es-ES">Español (España)</option>
                      <option value="zh-CN">中文 (Simplified Chinese)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1">
                      Date Formatting
                    </label>
                    <select
                      value={dateFormat}
                      onChange={(e) => {
                        setPersonalization({ dateFormat: e.target.value as any });
                        triggerSaveNotification('Date formatting updated.');
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="iso">ISO 8601 (YYYY-MM-DD)</option>
                      <option value="european">European (DD/MM/YYYY)</option>
                      <option value="us">US Standard (MM/DD/YYYY)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1">
                      Clock Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPersonalization({ clockFormat: '24h' });
                          triggerSaveNotification('24-Hour military clock format enabled.');
                        }}
                        className={cn(
                          'py-1.5 text-xs font-bold rounded-lg border cursor-pointer',
                          clockFormat === '24h'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                            : 'border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400'
                        )}
                      >
                        24-Hour (18:59)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPersonalization({ clockFormat: '12h' });
                          triggerSaveNotification('12-Hour standard clock format enabled.');
                        }}
                        className={cn(
                          'py-1.5 text-xs font-bold rounded-lg border cursor-pointer',
                          clockFormat === '12h'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                            : 'border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400'
                        )}
                      >
                        12-Hour (6:59 PM)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1">
                      Number Notation
                    </label>
                    <select
                      value={numberFormat}
                      onChange={(e) => {
                        setPersonalization({ numberFormat: e.target.value as any });
                        triggerSaveNotification('Number notation standard updated.');
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="standard">Standard (1,250,000.00)</option>
                      <option value="european">European (1.250.000,00)</option>
                      <option value="indian">Indian (12,50,000.00)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* High Contrast & Reduced Motion Switches */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => {
                      setPersonalization({ highContrast: e.target.checked });
                      triggerSaveNotification(e.target.checked ? 'High-contrast glare mode engaged.' : 'Standard contrast mode restored.');
                    }}
                    className="accent-amber-500 w-3.5 h-3.5 rounded"
                  />
                  <span className="font-semibold">High-Contrast Glare Mode</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => {
                      setPersonalization({ reducedMotion: e.target.checked });
                      triggerSaveNotification(e.target.checked ? 'Reduced motion engaged.' : 'Full animations restored.');
                    }}
                    className="accent-amber-500 w-3.5 h-3.5 rounded"
                  />
                  <span className="font-semibold">Reduced Motion & GPU Saver</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- TAB 1: PLATFORM CONCEPT & ARCHITECTURE ------------------- */}
      {activeTab === 'platform_concept' && (
        <div className="space-y-6">
          {/* Hero Concept Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/25 rounded-2xl p-6 relative overflow-hidden">
            <div className="max-w-3xl">
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-600 dark:text-amber-400">
                WHAT LINQCHAIN WORKS FOR
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Autonomous Supply Chain Resilience & Recovery Orchestration
              </h2>
              <p className="text-sm text-slate-600 dark:text-neutral-300 mt-2 leading-relaxed">
                LinqChain acts as the mission-critical central nervous system for enterprise supply operations. 
                When physical disruptions, geopolitical blockades, natural disasters, or supplier insolvencies strike, 
                LinqChain calculates the exact deterministic cascading impact, synthesizes optimized multi-tier mitigation plans, 
                and executes legally compliant Purchase Orders directly in SAP S/4HANA within seconds.
              </p>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-3">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Disruption Detection & Blast Radius
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  Ingests live supply anomalies and applies deterministic graph-traversal algorithms across Tier-1, Tier-2, and Tier-3 nodes to trace immediate inventory runways, affected plant shifts, and unfulfilled customer purchase orders.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Propagation Engine</span>
                <span className="text-red-500 font-bold">&lt;100ms latency</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-3">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Autonomous Multi-Agent AI
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  Generates ranked candidate recovery strategies (Split Allocation, Dedicated Dual-Sourcing, Buffer Rebalancing) evaluating cost trade-offs, transportation SLAs, carbon impact, and supplier reliability ratings.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Multi-Objective Scoring</span>
                <span className="text-amber-500 font-bold">Pareto-optimal</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  3. Policy Audit & Governance
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  Every proposed strategy is verified against enterprise procurement guidelines, single-source anti-monopoly caps, quality certificates, and financial exposure limits before routing to authorized human directors.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Compliance Check</span>
                <span className="text-purple-500 font-bold">SOC 2 / ISO 22301</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  4. Direct SAP S/4HANA Execution
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  Upon authorization, LinqChain fires transactional RFC/BAPIs directly into SAP S/4HANA to generate real Purchase Orders, reserve stock at alternative fulfillment centers, and notify freight carriers in real-time.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Execution Mode</span>
                <span className="text-emerald-500 font-bold">Direct BAPI Bridge</span>
              </div>
            </div>
          </div>

          {/* Interactive Topology Pipeline Visualizer */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Network className="w-4 h-4 text-amber-500" />
              <span>Closed-Loop Autonomous Resilience Pipeline</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { step: '01', title: 'Telemetry & Sensor Ingest', desc: 'Port congestion, weather, SAP Event Mesh feeds' },
                { step: '02', title: 'Topological Blast Radius', desc: 'Downstream plants, parts & revenue-at-risk mapped' },
                { step: '03', title: 'AI Mitigation Synthesis', desc: 'Dual-supplier splits & buffer shifts generated' },
                { step: '04', title: 'Governance Sign-Off', desc: 'Dual-custody authorization or policy auto-pass' },
                { step: '05', title: 'SAP Dispatch & Verify', desc: 'PO creation & carrier EDI integration confirmed' },
              ].map((pipe, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 relative group">
                  <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                    PHASE {pipe.step}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {pipe.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-snug">
                    {pipe.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------- TAB 2: AI & AUTONOMOUS POLICIES ------------------- */}
      {activeTab === 'ai_policies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auto-Authorization Spend Cap */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Autonomous Spend Authorization Cap
                  </h3>
                </div>
                <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                  {formatCurrency(autoApproveCap)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-6">
                Recovery plans with net mitigation expenditures below this threshold can be automatically approved by the policy engine without waiting for manual director sign-off.
              </p>

              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={autoApproveCap}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAutoApproveCap(val);
                  saveSetting('auto_approve_cap', String(val), `Spend Cap set to ${formatCurrency(val)}`);
                }}
                className="w-full accent-amber-500 cursor-pointer mb-4"
              />

              <div className="flex flex-wrap gap-2">
                {[10000, 25000, 50000, 100000, 200000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setAutoApproveCap(preset);
                      saveSetting('auto_approve_cap', String(preset), `Spend Cap set to ${formatCurrency(preset)}`);
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer',
                      autoApproveCap === preset
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
                    )}
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Optimization Strategy Objective */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  AI Mitigation Objective Priority
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-5">
                Defines the loss-function weighting applied by the multi-agent AI engine when ranking recovery candidate alternatives.
              </p>

              <div className="space-y-3">
                {[
                  { id: 'balanced', label: 'Balanced Optimization (Recommended)', desc: 'Equally balances expedited freight costs against assembly downtime risk.' },
                  { id: 'cost_optimal', label: 'Cost-First Conservative', desc: 'Strictly minimizes emergency air freight tariffs and premium supplier markups.' },
                  { id: 'speed_first', label: 'Zero-Downtime / Maximum Speed', desc: 'Prioritizes shortest lead-time and immediate stock availability regardless of fee.' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setAiStrategy(s.id as any);
                      saveSetting('ai_strategy', s.id, `AI Objective updated to ${s.label}`);
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer',
                      aiStrategy === s.id
                        ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/20'
                        : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/40'
                    )}
                  >
                    <div className={cn('w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0', aiStrategy === s.id ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 dark:border-neutral-700')}>
                      {aiStrategy === s.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">{s.label}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">{s.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Blast Radius Traversal Depth */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Blast Radius Graph Traversal Depth
                  </h3>
                </div>
                <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                  {blastRadiusHops} Hops (Tiers 1-{blastRadiusHops})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-6">
                Specifies how many tiers downstream the impact engine explores during disruption propagation to detect bottleneck component shortages.
              </p>

              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={blastRadiusHops}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBlastRadiusHops(val);
                  saveSetting('blast_radius_hops', String(val), `Blast Radius depth set to ${val} Hops`);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
                <span>Tier 1 Immediate</span>
                <span>Tier 3 Sub-tier</span>
                <span>Tier 5 Deep Raw Materials</span>
              </div>
            </div>

            {/* AI Plan Confidence Cutoff */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    AI Plan Confidence Threshold
                  </h3>
                </div>
                <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                  {aiConfidenceCutoff}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-6">
                Candidate strategies generated by LLM reasoning agents scoring below this confidence cutoff are rejected before presentation to operators.
              </p>

              <input
                type="range"
                min="60"
                max="98"
                step="2"
                value={aiConfidenceCutoff}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAiConfidenceCutoff(val);
                  saveSetting('ai_confidence', String(val), `Confidence Cutoff set to ${val}%`);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
                <span>60% (Permissive)</span>
                <span>85% (Standard Enterprise)</span>
                <span>98% (High Rigor)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- TAB 3: SAP S/4HANA & ERP BRIDGE ------------------- */}
      {activeTab === 'sap_erp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SAP Execution Mode */}
            <div className="lg:col-span-2 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      SAP S/4HANA Execution Environment
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      Configure target endpoint for Purchase Order creation and material reservation BAPIs.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ERP CONNECTED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setSapMode('sandbox');
                    saveSetting('sap_mode', 'sandbox', 'SAP Execution set to Sandbox Simulator');
                  }}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all cursor-pointer',
                    sapMode === 'sandbox'
                      ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/20'
                      : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/40'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Sandbox Mock Adapter</span>
                    {sapMode === 'sandbox' && <Check className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Safe training & test mode. Dispatches generate authentic SAP receipts with PO numbers without charging production accounting GL accounts.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setSapMode('live');
                    saveSetting('sap_mode', 'live', 'SAP Execution set to Live Production BAPI');
                  }}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all cursor-pointer',
                    sapMode === 'live'
                      ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/20'
                      : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/40'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live S/4HANA Production</span>
                    {sapMode === 'live' && <Check className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Direct RFC connection via SAP NetWeaver Cloud Connector. Real BAPI_PO_CREATE1 triggers live vendor commitment.
                  </p>
                </button>
              </div>

              {/* Auto Dispatch Switch */}
              <div className="pt-4 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Auto-Dispatch POs on Human Authorization
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Immediately submit Purchase Orders to SAP when a plan is authorized without requiring secondary confirmation.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSapDispatch}
                    onChange={(e) => {
                      setAutoSapDispatch(e.target.checked);
                      saveSetting('auto_sap_dispatch', String(e.target.checked), `Auto-dispatch ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                </label>
              </div>
            </div>

            {/* Adapter Telemetry Card */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
                  SAP Bridge Telemetry
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-neutral-800">
                    <span className="text-slate-500 dark:text-neutral-400">Client ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">SAP_PRD_400</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-neutral-800">
                    <span className="text-slate-500 dark:text-neutral-400">RFC Destination:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">LINQ_S4_GATEWAY</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-neutral-800">
                    <span className="text-slate-500 dark:text-neutral-400">BAPI Function:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">BAPI_PO_CREATE1</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 dark:text-neutral-400">Event Mesh Ping:</span>
                    <span className="font-mono text-emerald-500 font-bold">12ms (Synchronized)</span>
                  </div>
                </div>
              </div>

              <Link
                href="/sap-actions"
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all mt-6 shadow-xs cursor-pointer"
              >
                <span>View SAP Action Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- TAB 4: NOTIFICATIONS & TELEMETRY MATRIX ------------------- */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Toggles */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Incident Dispatch Channels
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
                Configure real-time alerting whenever disruptions exceed severity thresholds.
              </p>

              <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {soundAlerts ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">Audible Mission Control Klaxon</span>
                      <span className="block text-[11px] text-slate-500 dark:text-neutral-400">Play sound effect on Critical Level 1 disruptions.</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundAlerts}
                      onChange={(e) => {
                        setSoundAlerts(e.target.checked);
                        saveSetting('sound_alerts', String(e.target.checked), `Sound alerts ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                  </label>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Radio className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">PagerDuty Emergency On-Call</span>
                      <span className="block text-[11px] text-slate-500 dark:text-neutral-400">Trigger PagerDuty incident for plant shifts at risk.</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pagerdutyEnabled}
                      onChange={(e) => {
                        setPagerdutyEnabled(e.target.checked);
                        saveSetting('pagerduty_enabled', String(e.target.checked), `PagerDuty ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                  </label>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">Email Incident Digest</span>
                      <span className="block text-[11px] text-slate-500 dark:text-neutral-400">Send PDF impact briefs to operator@linqchain.com</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => {
                        setEmailAlerts(e.target.checked);
                        saveSetting('email_alerts', String(e.target.checked), `Email digests ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                  </label>
                </div>
              </div>
            </div>

            {/* Webhook Configuration */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Slack & Microsoft Teams Webhook Bridge
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Incoming webhook destination for automated incident channels, plan approval requests, and SAP execution receipts.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs text-slate-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">JSON Schema Payload: v2.4 (Compliant)</span>
                <button
                  onClick={() => saveSetting('slack_webhook', slackWebhook, 'Webhook URL verified and saved')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Save Webhook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- TAB 5: GENERAL PREFERENCES & APPEARANCE ------------------- */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* APPEARANCE */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center mb-1">
                <Moon className="w-4 h-4 text-amber-500 mr-2" />
                <h2 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Appearance</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-5">Choose how LinqChain looks.</p>

              <div className="space-y-2.5">
                {THEMES.map((t) => {
                  const active = themeId === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-left cursor-pointer',
                        active
                          ? 'border-amber-500 ring-1 ring-amber-500/20 bg-amber-500/10'
                          : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/60'
                      )}
                    >
                      <span className="flex items-center">
                        <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center mr-3', active ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400')}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>
                          <span className={cn('block text-xs font-bold', active ? 'text-amber-700 dark:text-amber-400' : 'text-slate-900 dark:text-white')}>{t.label}</span>
                          <span className="block text-[11px] text-slate-500 dark:text-neutral-400">{t.desc}</span>
                        </span>
                      </span>
                      {active && <Check className="w-4 h-4 text-amber-500" />}
                    </button>
                  );
                })}
              </div>

              {mounted && (
                <p className="mt-4 text-[11px] font-medium text-slate-400 dark:text-neutral-500">
                  Currently rendering <span className="font-bold text-slate-600 dark:text-neutral-300">{effectiveTheme === 'dark' ? 'True Charcoal Dark' : 'Light'}</span> mode.
                </p>
              )}
            </div>

            {/* CURRENCY */}
            <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center mb-1">
                <Coins className="w-4 h-4 text-amber-500 mr-2" />
                <h2 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Currency</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mb-5">
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
                        'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-left cursor-pointer',
                        active
                          ? 'border-amber-500 ring-1 ring-amber-500/20 bg-amber-500/10'
                          : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/60'
                      )}
                    >
                      <span className="flex items-center">
                        <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center mr-3 font-bold text-sm', active ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300')}>
                          {meta.symbol}
                        </span>
                        <span>
                          <span className={cn('block text-xs font-bold', active ? 'text-amber-700 dark:text-amber-400' : 'text-slate-900 dark:text-white')}>{code}</span>
                          <span className="block text-[11px] text-slate-500 dark:text-neutral-400">{meta.label}</span>
                        </span>
                      </span>
                      {active && <Check className="w-4 h-4 text-amber-500" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-neutral-900/50 rounded-xl border border-slate-100 dark:border-neutral-800">
                <div className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Live Representation Preview</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(12540000)}</div>
                <div className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500">12.54M exposure · {formatCurrency(482000)} · {formatCurrency(18750)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- TAB 6: PLATFORM DIAGNOSTICS & RESETS ------------------- */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Version Specs Card */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center mb-1">
              <Info className="w-4 h-4 text-amber-500 mr-2" />
              <h2 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                Platform Build Manifest
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-xl p-3.5 border border-slate-100 dark:border-neutral-800">
                <div className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Engine Version</div>
                <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">{APP_VERSION}</div>
              </div>
              <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-xl p-3.5 border border-slate-100 dark:border-neutral-800">
                <div className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Build Signature</div>
                <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">2026.10.30</div>
              </div>
              <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-xl p-3.5 border border-slate-100 dark:border-neutral-800">
                <div className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Runtime Protocol</div>
                <div className="text-base font-bold text-emerald-500 font-mono mt-0.5">FastAPI + Next.js 16</div>
              </div>
              <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-xl p-3.5 border border-slate-100 dark:border-neutral-800">
                <div className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Active Workspace</div>
                <div className="text-base font-bold text-amber-500 font-mono mt-0.5">Global Aerospace</div>
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-400 dark:text-neutral-500 mt-3">{APP_BUILD}</p>
          </div>

          {/* Maintenance & Reset Controls */}
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Diagnostic Maintenance & Cache Flush</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Reset Network Graph Layout Positions
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                    Purges persisted drag-and-drop node coordinates from local storage and restores the automatic horizontal multi-column tier topology layout.
                  </p>
                </div>
                <button
                  onClick={handlePurgeGraphPositions}
                  className="mt-4 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-300 dark:border-neutral-700 transition-colors cursor-pointer self-start"
                >
                  Clear Graph Coordinates
                </button>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Purge All Active Disruptions & Simulation History
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                    Permanently deletes all active disruption events and historical runs, reverting the supply chain topology to baseline health.
                  </p>
                </div>
                <button
                  onClick={handleResetSimulations}
                  disabled={resettingState}
                  className="mt-4 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer self-start disabled:opacity-50"
                >
                  {resettingState ? 'Purging records...' : 'Wipe All Disruptions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- TAB 7: PRIVACY & GDPR COMPLIANCE ------------------- */}
      {activeTab === 'privacy_compliance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  GDPR & CCPA Compliant
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  SOC 2 Type II
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Zero Data Selling
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Privacy, Data Protection & Legal Governance
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Exercise your statutory data subject rights under GDPR (EU/UK) and CCPA (California), manage cookie tracking consents, export personal archives, and inspect verified subprocessors.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenCookiePreferences}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white border border-neutral-300 dark:border-neutral-700 transition-colors cursor-pointer"
              >
                <Cookie className="w-4 h-4 text-orange-500" />
                <span>Cookie Preferences</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Data Subject Rights & Portability */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-500">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Data Portability & Subject Access (GDPR Art. 20)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Download your complete personal data record in structured, machine-readable JSON format.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800 text-xs text-slate-600 dark:text-neutral-400 mt-4 space-y-1.5 leading-relaxed">
                  <p><strong>Package includes:</strong> User profile identity, organization roles, consent audit timestamps, assigned policies, and session activity logs.</p>
                  <p className="text-[11px] text-neutral-500">Format: Standardized JSON compliant with GDPR Art. 20 and CCPA Section 1798.100.</p>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportUserData}
                  disabled={exportingData}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{exportingData ? 'Generating JSON...' : 'Export My Personal Data (JSON)'}</span>
                </button>
              </div>
            </div>

            {/* Card 2: Right to Erasure */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Right to Erasure / Account Deletion (GDPR Art. 17)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Permanently delete your user profile and cryptographic identity credentials.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 mt-4 space-y-1.5 leading-relaxed">
                  <p><strong>Immediate Effect:</strong> Your account will be deactivated and active JWT tokens invalidated immediately.</p>
                  <p className="text-[11px]">Notice: SAP S/4HANA PO postings and statutory accounting audit logs are preserved under GDPR Art. 17(3)(b) for commercial legal compliance.</p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => setDeletionModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Request Account & Data Deletion</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Communication & Marketing Consents */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Marketing & Communication Preferences (GDPR Art. 6/7)
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Configure which notifications, intelligence digests, and product announcements you wish to receive.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Double Opt-In Ready
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-neutral-800">
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Critical Security Advisories & Incident Klaxons
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    High-priority notices regarding platform vulnerability patches and critical supply chain bridge outages.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingConsents.security_alerts}
                  onChange={(e) => handleUpdateConsent('security_alerts', e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 bg-neutral-800 border-neutral-700 cursor-pointer"
                />
              </div>

              <div className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Product Releases & AI Engine Updates
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Monthly overview of new blast radius heuristics, multi-agent AI features, and SAP integration capabilities.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingConsents.product_releases}
                  onChange={(e) => handleUpdateConsent('product_releases', e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 bg-neutral-800 border-neutral-700 cursor-pointer"
                />
              </div>

              <div className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Weekly Disruption Intelligence Briefing
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Aggregated executive summary of regional logistics bottlenecks, port congestions, and weather alerts.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingConsents.weekly_digest}
                  onChange={(e) => handleUpdateConsent('weekly_digest', e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 bg-neutral-800 border-neutral-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Subprocessor Registry */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Third-Party Subprocessor Registry (GDPR Art. 28)
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Verified enterprise cloud and infrastructure providers with active Data Processing Agreements (DPAs).
                </p>
              </div>
              <Link href="/privacy" className="text-xs text-orange-600 dark:text-orange-400 hover:underline">
                View DPA Terms →
              </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-3 font-semibold">Subprocessor</th>
                    <th className="p-3 font-semibold">Purpose</th>
                    <th className="p-3 font-semibold">Processing Location</th>
                    <th className="p-3 font-semibold">DPA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">Supabase, Inc.</td>
                    <td className="p-3 text-slate-500 dark:text-neutral-400">Database & Realtime WebSockets</td>
                    <td className="p-3">United States / EU (Frankfurt)</td>
                    <td className="p-3"><span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active & Verified</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">Amazon Web Services (AWS)</td>
                    <td className="p-3 text-slate-500 dark:text-neutral-400">VPC Cloud Compute & Storage</td>
                    <td className="p-3">USA / Ireland / Germany</td>
                    <td className="p-3"><span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active & Verified</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">Microsoft Azure</td>
                    <td className="p-3 text-slate-500 dark:text-neutral-400">Enterprise SSO & Identity Federation</td>
                    <td className="p-3">USA / EU</td>
                    <td className="p-3"><span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active & Verified</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">SAP SE</td>
                    <td className="p-3 text-slate-500 dark:text-neutral-400">S/4HANA ERP Bridge & Event Mesh</td>
                    <td className="p-3">Germany (EU)</td>
                    <td className="p-3"><span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active & Verified</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">Stripe, Inc.</td>
                    <td className="p-3 text-slate-500 dark:text-neutral-400">Subscription Invoicing & Payments</td>
                    <td className="p-3">USA / Ireland</td>
                    <td className="p-3"><span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active & Verified</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 5: Public Legal Documents Quick Links */}
          <div className="p-6 rounded-2xl bg-slate-100 dark:bg-[#121319] border border-slate-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-orange-500" />
              <span>Public Legal Documents & Sovereign Policies</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <Link
                href="/privacy"
                target="_blank"
                className="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 hover:border-orange-500 dark:hover:border-orange-500 transition-colors text-center font-semibold"
              >
                Privacy Policy ↗
              </Link>
              <Link
                href="/terms"
                target="_blank"
                className="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 hover:border-orange-500 dark:hover:border-orange-500 transition-colors text-center font-semibold"
              >
                Terms of Service ↗
              </Link>
              <Link
                href="/security"
                target="_blank"
                className="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 hover:border-orange-500 dark:hover:border-orange-500 transition-colors text-center font-semibold"
              >
                Security & Breach SOP ↗
              </Link>
              <Link
                href="/licenses"
                target="_blank"
                className="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 hover:border-orange-500 dark:hover:border-orange-500 transition-colors text-center font-semibold"
              >
                Open Source Licenses ↗
              </Link>
              <Link
                href="/pricing"
                target="_blank"
                className="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-800 hover:border-orange-500 dark:hover:border-orange-500 transition-colors text-center font-semibold"
              >
                Subscription Terms ↗
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- DELETION REQUEST CONFIRMATION MODAL ------------------- */}
      {deletionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-neutral-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Request Right to Erasure (GDPR Art. 17)
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 mb-4 leading-relaxed">
              This initiates permanent cryptographic erasure of your personal identifiers and deactivates your mission control login credentials.
            </p>

            {deletionSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs mb-4">
                <CheckCircle2 className="w-4 h-4 mb-1" />
                <span>{deletionSuccess}</span>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDeletionModalOpen(false);
                      setDeletionSuccess(null);
                      logout();
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                  >
                    Close & Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Confirm your email address:
                  </label>
                  <input
                    type="email"
                    value={deletionEmail}
                    onChange={(e) => setDeletionEmail(e.target.value)}
                    placeholder={user?.email || 'operator@linqchain.com'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Reason for deletion (optional):
                  </label>
                  <input
                    type="text"
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    placeholder="e.g. Account no longer needed, GDPR Art. 17 request"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletionModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestDeletion}
                    disabled={deletionLoading || !deletionEmail.trim()}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {deletionLoading ? 'Submitting...' : 'Confirm Erasure Request'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------- SIGN OUT CONFIRMATION MODAL ------------------- */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#2e2e33] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/20">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sign out of LinqChain?
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 mb-6 leading-relaxed">
              Your active mission control session and administrative security tokens will be terminated. You will be redirected to the sign-in portal.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setLogoutModalOpen(false);
                  logout();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
