'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SupplierAuthProvider } from '@/components/supplier/supplier-auth-provider';
import { SupplierSidebar } from '@/components/supplier/supplier-sidebar';
import { SupplierTopbar } from '@/components/supplier/supplier-topbar';

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/supplier/login';

  // Login page is completely standalone — no supplier sidebar or topbar
  if (isLoginPage) {
    return (
      <div className="w-full min-h-screen bg-[#121212] text-neutral-100">
        {children}
      </div>
    );
  }

  return (
    <SupplierAuthProvider>
      <div className="flex-1 w-full h-screen flex overflow-hidden bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-neutral-100">
        <SupplierSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <SupplierTopbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 dark:bg-[#121212]">
            <div className="w-full max-w-[1850px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SupplierAuthProvider>
  );
}
