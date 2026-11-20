'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, ShieldAlert, GitMerge, FileCheck, LayoutDashboard, 
  Network, PlaySquare, Bot, Settings, HelpCircle, ChevronLeft,
  ChevronRight, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const baseMenuGroups = [
  {
    title: 'COMMAND CENTER',
    items: [
      { name: 'Overview', href: '/command-center', basePath: '/command-center', icon: LayoutDashboard },
      { name: 'Disruptions', href: '/disruptions', basePath: '/disruptions', icon: Activity },
      { name: 'Supply Chain', href: '/supply-chain', basePath: '/supply-chain', icon: Network },
    ]
  },
  {
    title: 'RECOVERY',
    items: [
      { name: 'Recovery Plans', href: '/recovery-plans', basePath: '/recovery-plans', icon: GitMerge },
      { name: 'Scenarios', href: '/scenarios', basePath: '/scenarios', icon: PlaySquare },
    ]
  },
  {
    title: 'RISK & AUDIT',
    items: [
      { name: 'Risk & Audit', href: '/risk', basePath: '/risk', icon: ShieldAlert },
    ]
  },
  {
    title: 'APPROVALS',
    items: [
      { name: 'Approvals', href: '/approvals', basePath: '/approvals', icon: FileCheck },
    ]
  },
  {
    title: 'EXECUTION',
    items: [
      { name: 'SAP Actions', href: '/sap-actions', basePath: '/sap-actions', icon: Play },
      { name: 'Action History', href: '/action-history', basePath: '/action-history', icon: Activity },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Settings', href: '/settings', basePath: '/settings', icon: Settings },
      { name: 'Help & Docs', href: '/help', basePath: '/help', icon: HelpCircle },
    ]
  }
];

import { useSimulationStore } from '@/stores/useSimulationStore';
import { fetchPersistedRecoveryPlans } from '@/services/api';

export function Sidebar() {
  const pathname = usePathname() ?? '';
  const [collapsed, setCollapsed] = useState(false);
  const { activeDisruption } = useSimulationStore();
  
  const [pendingApprovalCount, setPendingApprovalCount] = useState<number>(0);

  // Operator sidebar must NEVER render inside dedicated portals (Admin, Supplier, Manufacturer, etc.)
  if (
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

  // Poll for pending approval count to keep badge fresh across workspace navigations
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetchPersistedRecoveryPlans({ limit: 1 });
        setPendingApprovalCount(res.total_pending_approval || 0);
      } catch (e) {
        // Silently ignore polling errors
      }
    };
    
    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const menuGroups = baseMenuGroups.map(group => {
    const filteredItems = group.items.filter(item => item.name !== 'AI Insights');

    return {
      ...group,
      items: filteredItems.map(item => {
        // Only update the navigation href — never touch basePath (used for active-state matching)
        if (item.name === 'Disruptions') {
          return { ...item, href: '/disruptions' };
        }
        if (item.name === 'Recovery Plans') {
          return {
            ...item,
            href: '/recovery-plans'
          };
        }
        if (item.name === 'Approvals') {
          return {
            ...item,
            badge: pendingApprovalCount > 0 ? pendingApprovalCount : undefined
          };
        }
        return item;
      })
    };
  });

  return (
    <div className={cn(
      "bg-white dark:bg-[#1a1a1a] border-r border-slate-200 dark:border-neutral-800 flex flex-col h-full z-20 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-neutral-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-neutral-900 flex items-center justify-center p-1 border border-slate-800 dark:border-neutral-700 shrink-0 shadow-xs">
          <img src="/linqchain-logo.svg" alt="LinqChain Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && <span className="text-slate-900 dark:text-white font-extrabold tracking-tight text-sm ml-3 uppercase">LINQCHAIN</span>}
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h4 className="px-6 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                {group.title}
              </h4>
            )}
            <nav className="space-y-0.5 px-3">
              {group.items.map((item) => {
                const matchBase = (item as any).basePath ?? item.href;
                const isActive = pathname === matchBase || pathname.startsWith(`${matchBase}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-semibold transition-colors relative",
                      isActive 
                        ? "bg-blue-50 dark:bg-neutral-800/80 text-blue-700 dark:text-amber-400 shadow-xs" 
                        : "text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-200"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 min-w-[16px]", 
                      isActive ? "text-blue-600 dark:text-amber-400" : "text-slate-400 dark:text-neutral-500",
                      !collapsed && "mr-3"
                    )} />
                    {!collapsed && <span>{item.name}</span>}
                    
                    {!collapsed && (item as any).badge && (
                      <span className="ml-auto bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 py-0.5 px-2 rounded-full text-[10px] font-bold">
                        {(item as any).badge}
                      </span>
                    )}
                    {collapsed && (item as any).badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
      
      <div className="mt-auto border-t border-slate-200 dark:border-neutral-800 py-4 px-3 space-y-0.5">
        <Link href="/settings" className="flex items-center px-3 py-2 rounded-md text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-300">
          <Settings className="h-4 w-4 min-w-[16px] text-slate-400 dark:text-neutral-500 mr-3" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <Link href="/help" className="flex items-center px-3 py-2 rounded-md text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-300">
          <HelpCircle className="h-4 w-4 min-w-[16px] text-slate-400 dark:text-neutral-500 mr-3" />
          {!collapsed && <span>Help & Docs</span>}
        </Link>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center px-3 py-2 rounded-md text-sm font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-neutral-300"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 min-w-[16px] text-slate-400 dark:text-neutral-500 m-auto" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 min-w-[16px] text-slate-400 dark:text-neutral-500 mr-3" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
