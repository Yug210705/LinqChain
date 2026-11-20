'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  Layers,
  Component,
  FileCheck2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Factory,
  Radio,
  Truck,
  ShieldCheck,
  Activity,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useManufacturerStore } from '@/stores/useManufacturerStore';

interface NavItem {
  name: string;
  href: string;
  basePath: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  alert?: boolean;
}

interface MenuGroup {
  title: string;
  items: NavItem[];
}

const manufacturerMenuGroups: MenuGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Plant Operations Cockpit', href: '/manufacturer', basePath: '/manufacturer', icon: LayoutDashboard },
    ],
  },
  {
    title: 'SHOP FLOOR EXECUTION',
    items: [
      { name: 'Production Lines & OEE', href: '/manufacturer/lines', basePath: '/manufacturer/lines', icon: Cpu, badge: '4 Cells' },
      { name: 'Work Orders & BOM Shortages', href: '/manufacturer/work-orders', basePath: '/manufacturer/work-orders', icon: Layers, badge: 'Alert', alert: true },
      { name: 'Line-Side Kanban Staging', href: '/manufacturer/kanban', basePath: '/manufacturer/kanban', icon: Component, badge: '2-Bin' },
    ],
  },
  {
    title: 'QUALITY & AIRWORTHINESS',
    items: [
      { name: 'Scrap & Non-Conformance', href: '/manufacturer/quality', basePath: '/manufacturer/quality', icon: FileCheck2, badge: 'AS9100' },
    ],
  },
  {
    title: 'FACILITY CONFIGURATION',
    items: [
      { name: 'Plant Fleet & Telemetry', href: '/manufacturer/settings', basePath: '/manufacturer/settings', icon: Settings },
    ],
  },
];

export function ManufacturerSidebar() {
  const pathname = usePathname() ?? '';
  const [collapsed, setCollapsed] = useState(false);
  const { manufacturerUser, lines } = useManufacturerStore();

  const starvedCount = lines.filter((l) => l.status === 'STARVED' || l.status === 'BLOCKED').length;

  return (
    <aside
      className={cn(
        'bg-white dark:bg-[#1a1a1a] border-r border-slate-200 dark:border-neutral-800 flex flex-col h-full z-20 transition-all duration-300 select-none shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header matching Operator Portal Branding */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-neutral-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-neutral-900 flex items-center justify-center p-1 border border-slate-800 dark:border-neutral-700 shrink-0 shadow-xs">
          <img src="/linqchain-logo.svg" alt="LinqChain Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="ml-3 flex flex-col truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 dark:text-white font-extrabold tracking-tight text-sm uppercase">
                LINQCHAIN
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                MFG
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono tracking-tight truncate mt-0.5">
              {manufacturerUser?.plant_code || 'PLANT-TX-04'} • Propulsion Cell
            </span>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {manufacturerMenuGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h4 className="px-6 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                {group.title}
              </h4>
            )}
            <nav className="space-y-0.5 px-3">
              {group.items.map((item) => {
                const isActive =
                  item.href === '/manufacturer'
                    ? pathname === '/manufacturer'
                    : pathname.startsWith(item.basePath);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-md text-sm font-semibold transition-colors relative group',
                      isActive
                        ? 'bg-emerald-50 dark:bg-neutral-800/80 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-200'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 min-w-[16px]',
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-neutral-500',
                        !collapsed && 'mr-3'
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}

                    {!collapsed && item.badge && (
                      <span
                        className={cn(
                          'ml-auto py-0.5 px-2 rounded-full text-[10px] font-bold font-mono',
                          item.alert && starvedCount > 0
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}

                    {collapsed && item.badge && item.alert && starvedCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer matching Operator Sidebar */}
      <div className="mt-auto border-t border-slate-200 dark:border-neutral-800 py-3 px-3 space-y-0.5">
        <Link
          href="/manufacturer/settings"
          className="flex items-center px-3 py-2 rounded-md text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-300"
        >
          <Settings className="h-4 w-4 min-w-[16px] text-slate-400 dark:text-neutral-500 mr-3" />
          {!collapsed && <span>Facility Settings</span>}
        </Link>
        <Link
          href="/help"
          className="flex items-center px-3 py-2 rounded-md text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-300"
        >
          <HelpCircle className="h-4 w-4 min-w-[16px] text-slate-400 dark:text-neutral-500 mr-3" />
          {!collapsed && <span>Shop Floor SOPs</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center px-3 py-2 rounded-md text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-300 cursor-pointer"
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
