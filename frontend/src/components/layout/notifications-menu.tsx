'use client';
import { Bell, AlertTriangle, FileCheck, Settings2, CheckCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'alert' | 'approval' | 'system';
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
}

const STORAGE_KEY = 'resilienceos.notifications.read';

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'alert', title: 'Supplier disruption detected',
    body: 'SUP-007 capacity dropped to 0% — cascade simulation started.',
    time: '2m ago', read: false, href: '/disruptions',
  },
  {
    id: 'n2', type: 'approval', title: 'Recovery plan pending approval',
    body: 'A recovery plan is awaiting human authorization.',
    time: '18m ago', read: false, href: '/approvals',
  },
  {
    id: 'n3', type: 'system', title: 'Impact engine reconfigured',
    body: 'Supply chain topology rebuilt from current master data.',
    time: '1h ago', read: false,
  },
  {
    id: 'n4', type: 'system', title: 'Weekly resilience score published',
    body: 'Enterprise resilience: 74.2 ▲ (+3.1 vs last week)',
    time: '1d ago', read: true,
  },
];

const TYPE_STYLES: Record<Notification['type'], { bg: string; icon: typeof AlertTriangle; label: string }> = {
  alert:    { bg: 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400', icon: AlertTriangle, label: 'Alert' },
  approval: { bg: 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400', icon: FileCheck, label: 'Approval' },
  system:   { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400', icon: Settings2, label: 'System' },
};

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  /* Hydrate read-state from localStorage once mounted */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const readIds = JSON.parse(saved) as string[];
        setItems((prev) => prev.map((n) => (readIds.includes(n.id) ? { ...n, read: true } : n)));
      }
    } catch { /* ignore */ }
  }, []);

  /* Close on click outside */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const persistRead = useCallback((updated: Notification[]) => {
    setItems(updated);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.filter((n) => n.read).map((n) => n.id)));
    }
  }, []);

  const markAllRead = useCallback(() => {
    persistRead(items.map((n) => ({ ...n, read: true })));
  }, [items, persistRead]);

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 relative p-1 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${open ? 'text-blue-600 dark:text-blue-400' : ''}`} />
        {unread > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 border border-white dark:border-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((n) => {
              const style = TYPE_STYLES[n.type];
              const Icon = style.icon;
              const inner = (
                <>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between items-start gap-2">
                      <span className={`text-[13px] leading-tight ${n.read ? 'text-slate-600 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                        {n.title}
                      </span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.body}</span>
                    <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1">{n.time}</span>
                  </span>
                </>
              );
              return n.href ? (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  {inner}
                </Link>
              ) : (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  {inner}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-[10px] font-semibold text-slate-400 dark:text-slate-500 text-center">
            {unread === 0 ? 'You are all caught up 🎉' : `${unread} unread notification${unread > 1 ? 's' : ''}`}
          </div>
        </div>
      )}
    </div>
  );
}