'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Globe,
  Network,
  Flame,
  Layers,
  Brain,
  Users,
  Building2,
  SlidersHorizontal,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  basePath: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  title: string;
  items: NavItem[];
}

const adminMenuGroups: MenuGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/admin', basePath: '/admin', icon: LayoutDashboard },
      { name: 'Supply Chain Tower', href: '/admin/supply-chain', basePath: '/admin/supply-chain', icon: Globe },
    ],
  },
  {
    title: 'PORTAL CONTROLS',
    items: [
      { name: 'Federation & SLAs', href: '/admin/portals', basePath: '/admin/portals', icon: Network },
    ],
  },
  {
    title: 'CHAOS & INTELLIGENCE',
    items: [
      { name: 'Disruption Switchboard', href: '/admin/chaos', basePath: '/admin/chaos', icon: Flame },
      { name: 'SAP Event Mesh & BAPI', href: '/admin/sap-mesh', basePath: '/admin/sap-mesh', icon: Layers },
      { name: 'AI Recovery Guardrails', href: '/admin/ai-governance', basePath: '/admin/ai-governance', icon: Brain },
    ],
  },
  {
    title: 'GOVERNANCE & SECURITY',
    items: [
      { name: 'Users', href: '/admin/users', basePath: '/admin/users', icon: Users },
      { name: 'Organizations', href: '/admin/organizations', basePath: '/admin/organizations', icon: Building2 },
      { name: 'Roles & Permissions', href: '/admin/roles', basePath: '/admin/roles', icon: Shield },
      { name: 'Platform Policies', href: '/admin/policies', basePath: '/admin/policies', icon: SlidersHorizontal },
      { name: 'Audit Log', href: '/admin/audit', basePath: '/admin/audit', icon: FileText },
      { name: 'System Status', href: '/admin/system', basePath: '/admin/system', icon: Activity },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname() ?? '';
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'bg-white dark:bg-[#18181b] border-r border-slate-200 dark:border-neutral-800 flex flex-col h-full z-20 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-amber-500/20 dark:border-neutral-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#121212] flex items-center justify-center p-1 border border-amber-500/30 shrink-0 shadow-xs">
          <img src="/linqchain-logo.svg" alt="LinqChain Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="ml-3 flex flex-col">
            <span className="text-amber-600 dark:text-amber-400 font-black tracking-wider text-sm uppercase">
              ADMIN CONTROL
            </span>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-semibold uppercase tracking-tight">
              Enterprise Resilience OS
            </span>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {adminMenuGroups.map((group, idx) => (
          <div key={idx} className="mb-5">
            {!collapsed && (
              <h4 className="px-6 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                {group.title}
              </h4>
            )}
            <nav className="space-y-0.5 px-3">
              {group.items.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname === item.basePath || pathname.startsWith(`${item.basePath}/`);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-md text-xs font-semibold transition-colors relative group',
                      isActive
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold'
                        : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-200'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 min-w-[16px] transition-colors',
                        isActive
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400 dark:text-neutral-500 group-hover:text-slate-700 dark:group-hover:text-neutral-300',
                        !collapsed && 'mr-3'
                      )}
                    />
                    {!collapsed && <span>{item.name}</span>}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-500 rounded-r-md" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto border-t border-slate-200 dark:border-neutral-800 py-3 px-3 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center px-3 py-2 rounded-md text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-200 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 min-w-[16px] text-slate-400 dark:text-neutral-500 m-auto" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 min-w-[16px] text-slate-400 dark:text-neutral-500 mr-3" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
