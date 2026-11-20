'use client';
import { Search, HelpCircle, Moon, Sun, ChevronDown, Check, Settings, LogOut, Truck, Factory, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSapEvents } from '@/components/providers/sap-event-provider';
import { NotificationsMenu } from './notifications-menu';
import { cn } from '@/lib/utils';

export function Topbar() {
  const pathname = usePathname() || '';
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { isConnected } = useSapEvents();
  const [mounted, setMounted] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState('Production');
  const [isEnvOpen, setIsEnvOpen] = useState(false);
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

  const getInitials = (name?: string) => {
    if (!name) return 'YP';
    const clean = name.replace(/\s*\(.*\)/, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return clean.slice(0, 2).toUpperCase() || 'YP';
  };

  const displayName = user?.display_name?.replace(/\s*\(.*\)/, '').trim() || 'Yug Pathak';
  const roleName = user?.job_title || (user?.role_name === 'OPERATOR' ? 'Admin' : (user?.role_name || 'Admin'));

  // Operator topbar must NEVER render inside dedicated portals (Admin, Supplier, Manufacturer, etc.)
  if (
    pathname === '/' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/supplier') ||
    pathname.startsWith('/manufacturer') ||
    pathname === '/login' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/security' ||
    pathname === '/licenses' ||
    pathname === '/pricing'
  ) {
    return null;
  }

  return (
    <header className="h-16 bg-white dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
      
      {/* Search Bar */}
      <div className="flex items-center bg-slate-50 dark:bg-neutral-900 rounded-md px-3 py-2 w-[400px] border border-slate-200 dark:border-neutral-700 focus-within:ring-2 focus-within:ring-amber-500/40 transition-shadow">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="Search suppliers, materials, plants, orders..." 
          className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-neutral-100 placeholder:text-slate-400"
        />
        <div className="flex items-center justify-center bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded px-1.5 py-0.5 ml-2 shrink-0 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400">⌘K</span>
        </div>
      </div>
      
      {/* Right Controls matching reference image */}
      <div className="flex items-center space-x-3 sm:space-x-4 text-sm">
        
        {/* 1. SAP Event Mesh Pill Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-neutral-900/90 border border-slate-200/90 dark:border-neutral-800 text-xs font-medium text-slate-700 dark:text-neutral-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                : 'bg-slate-400 dark:bg-neutral-500'
            }`}
          />
          <span className="truncate max-w-[210px]">
            {isConnected ? 'SAP Event Mesh: Connected' : 'SAP Event Mesh: Reconnecting...'}
          </span>
        </div>

        {/* 2. Operational System Status */}
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-bold text-xs tracking-tight shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          <span>Operational</span>
        </div>
        
        {/* Vertical Divider 1 */}
        <div className="h-5 w-px bg-slate-200 dark:bg-neutral-800 shrink-0" />

        {/* 3. Action Icons: Notifications, Help, Theme Toggle */}
        <div className="flex items-center space-x-2">
          {/* Notifications with Bell & Badge */}
          <NotificationsMenu />

          {/* Help & Documentation */}
          <Link
            href="/help"
            title="Help & Documentation"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800/60 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>
          
          {/* Dark / Light Theme Toggle */}
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Vertical Divider 2 */}
        <div className="h-5 w-px bg-slate-200 dark:bg-neutral-800 shrink-0" />

        {/* 4. Environment Selector Dropdown (e.g. Production ⌵) */}
        <div className="relative" ref={envRef}>
          <button
            type="button"
            onClick={() => setIsEnvOpen(!isEnvOpen)}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-800 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <span>{selectedEnv}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isEnvOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 border-b border-slate-100 dark:border-neutral-800">
                Cluster Environment
              </div>
              {['Production', 'Staging (SAP Sandbox)', 'Simulation War Room'].map((envOption) => (
                <button
                  key={envOption}
                  onClick={() => {
                    setSelectedEnv(envOption);
                    setIsEnvOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800/80 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        envOption === 'Production'
                          ? 'bg-emerald-500'
                          : envOption.includes('Staging')
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                    <span className="truncate">{envOption}</span>
                  </span>
                  {selectedEnv === envOption && (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-amber-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* 5. User Profile: Avatar + Name + Role */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2.5 text-left p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0 border border-amber-500/30"
              />
            ) : (
              <div className={cn(
                "w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 transition-colors",
                user?.avatar_color === 'emerald' ? 'bg-emerald-600' :
                user?.avatar_color === 'sapphire' ? 'bg-blue-600' :
                user?.avatar_color === 'violet' ? 'bg-purple-600' :
                user?.avatar_color === 'crimson' ? 'bg-rose-600' :
                'bg-amber-600'
              )}>
                {getInitials(displayName)}
              </div>
            )}
            <div className="hidden md:block">
              <div className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium leading-tight mt-0.5 max-w-[130px] truncate">
                {roleName}
              </div>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-neutral-800 flex items-center gap-2.5">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover shadow-xs border border-amber-500/30 shrink-0"
                  />
                ) : (
                  <div className={cn(
                    "w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0",
                    user?.avatar_color === 'emerald' ? 'bg-emerald-600' :
                    user?.avatar_color === 'sapphire' ? 'bg-blue-600' :
                    user?.avatar_color === 'violet' ? 'bg-purple-600' :
                    user?.avatar_color === 'crimson' ? 'bg-rose-600' :
                    'bg-amber-600'
                  )}>
                    {getInitials(displayName)}
                  </div>
                )}
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                    {user?.email || 'operator@linqchain.com'}
                  </div>
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 flex items-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Account & Platform Settings</span>
              </Link>

              <div className="my-1 border-t border-slate-100 dark:border-neutral-800" />

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100 dark:border-neutral-800 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
