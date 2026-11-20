'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider } from '@/components/admin/admin-auth-provider';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Login page is completely standalone — no admin sidebar or topbar
  if (isLoginPage) {
    return (
      <div className="w-full min-h-screen bg-[#121212] text-neutral-100">
        {children}
      </div>
    );
  }

  return (
    <AdminAuthProvider>
      <div className="flex-1 w-full h-screen flex overflow-hidden bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-neutral-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/60 dark:bg-[#121212]">
            <div className="w-full max-w-[1700px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}
