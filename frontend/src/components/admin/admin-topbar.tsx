'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/useAdminStore';
import { useTheme } from 'next-themes';
import { Shield, LogOut, Sun, Moon, UserCircle } from 'lucide-react';

const pathTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Dashboard Overview', subtitle: 'Platform statistics and security posture' },
  '/admin/users': { title: 'User Management', subtitle: 'Admin accounts and platform user access' },
  '/admin/organizations': { title: 'Organization Management', subtitle: 'Tenants, enterprises, and memberships' },
  '/admin/roles': { title: 'Roles & Permissions', subtitle: 'Role-based access control and privilege matrix' },
  '/admin/policies': { title: 'Platform Policies', subtitle: 'System thresholds, automation, and engine settings' },
  '/admin/audit': { title: 'Security Audit Log', subtitle: 'Immutable trail of administrative and operational actions' },
  '/admin/system': { title: 'System Health & Diagnostics', subtitle: 'Engine runtime, DB latency, and adapter status' },
};

export function AdminTopbar() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { adminUser, logout } = useAdminStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentRouteMeta = pathTitles[pathname] || {
    title: 'Admin Console',
    subtitle: 'System administration and configuration',
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-[#18181b] border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between px-6 shadow-xs z-10 shrink-0">
      {/* Left: Dynamic Page Title & Subtitle */}
      <div className="flex flex-col">
        <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
          {currentRouteMeta.title}
        </h1>
        <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium hidden sm:block">
          {currentRouteMeta.subtitle}
        </p>
      </div>

      {/* Center: Admin Panel Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/25 text-amber-700 dark:text-amber-400">
        <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
        <span className="text-[11px] font-black tracking-widest uppercase">
          ADMIN PANEL
        </span>
      </div>

      {/* Right: Controls & User Profile */}
      <div className="flex items-center space-x-4 text-sm">
        {/* Dark Mode Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle color theme"
            className="text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* User Identity Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-neutral-800">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 dark:bg-amber-900/30 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs">
            {adminUser?.display_name ? adminUser.display_name.charAt(0).toUpperCase() : <UserCircle className="w-5 h-5" />}
          </div>
          <div className="flex flex-col hidden md:flex">
            <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">
              {adminUser?.display_name || 'Admin'}
            </span>
            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold tracking-wider">
              {adminUser?.role || 'SUPER_ADMIN'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign out of Admin Panel"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
