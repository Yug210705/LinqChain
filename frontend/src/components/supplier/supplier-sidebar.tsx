'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PackageCheck,
  Boxes,
  AlertOctagon,
  FileBadge,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupplierStore } from '@/stores/useSupplierStore';

interface NavItem {
  name: string;
  href: string;
  basePath: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface MenuGroup {
  title: string;
  items: NavItem[];
}

const supplierMenuGroups: MenuGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Vendor Collaboration Cockpit', href: '/supplier', basePath: '/supplier', icon: LayoutDashboard },
    ],
  },
  {
    title: 'ORDERS & SHIPMENTS',
    items: [
      { name: 'Purchase Orders & ASNs', href: '/supplier/orders', basePath: '/supplier/orders', icon: PackageCheck, badge: 'Live' },
      { name: 'Material Stock & Buffers', href: '/supplier/inventory', basePath: '/supplier/inventory', icon: Boxes },
    ],
  },
  {
    title: 'RISK & COMPLIANCE',
    items: [
      { name: 'Early Warning Disruptions', href: '/supplier/disruptions', basePath: '/supplier/disruptions', icon: AlertOctagon, badge: 'Risk' },
      { name: 'Quality & CoA Compliance', href: '/supplier/quality', basePath: '/supplier/quality', icon: FileBadge, badge: 'AS9100' },
    ],
  },
  {
    title: 'PARTNER CONFIGURATION',
    items: [
      { name: 'Vendor Master & Security', href: '/supplier/settings', basePath: '/supplier/settings', icon: Settings },
    ],
  },
];

export function SupplierSidebar() {
  const pathname = usePathname() ?? '';
  const [collapsed, setCollapsed] = useState(false);
  const { supplierUser, purchaseOrders } = useSupplierStore();

  const newOrdersCount = purchaseOrders.filter((po) => po.status === 'NEW').length;

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
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                VENDOR
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono tracking-tight truncate mt-0.5">
              {supplierUser?.vendor_code || 'VEND-8821-TI'} • Tier-1
            </span>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {supplierMenuGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h4 className="px-6 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                {group.title}
              </h4>
            )}
            <nav className="space-y-0.5 px-3">
              {group.items.map((item) => {
                const isActive =
                  item.href === '/supplier'
                    ? pathname === '/supplier'
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
                        ? 'bg-blue-50 dark:bg-neutral-800/80 text-blue-700 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-200'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 min-w-[16px]',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-neutral-500',
                        !collapsed && 'mr-3'
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}

                    {!collapsed && (item.badge || (item.name === 'Purchase Orders & ASNs' && newOrdersCount > 0)) && (
                      <span className="ml-auto bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 py-0.5 px-2 rounded-full text-[10px] font-bold font-mono">
                        {item.name === 'Purchase Orders & ASNs' && newOrdersCount > 0 ? `${newOrdersCount} New` : item.badge}
                      </span>
                    )}

                    {collapsed && newOrdersCount > 0 && item.name === 'Purchase Orders & ASNs' && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
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
          href="/supplier/settings"
          className="flex items-center px-3 py-2 rounded-md text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-300"
        >
          <Settings className="h-4 w-4 min-w-[16px] text-slate-400 dark:text-neutral-500 mr-3" />
          {!collapsed && <span>Vendor Master</span>}
        </Link>
        <Link
          href="/help"
          className="flex items-center px-3 py-2 rounded-md text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-300"
        >
          <HelpCircle className="h-4 w-4 min-w-[16px] text-slate-400 dark:text-neutral-500 mr-3" />
          {!collapsed && <span>Integration Docs</span>}
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
