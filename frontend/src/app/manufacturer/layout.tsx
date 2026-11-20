'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ManufacturerAuthProvider } from '@/components/manufacturer/manufacturer-auth-provider';
import { ManufacturerSidebar } from '@/components/manufacturer/manufacturer-sidebar';
import { ManufacturerTopbar } from '@/components/manufacturer/manufacturer-topbar';

export default function ManufacturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/manufacturer/login';

  // Login page is completely standalone — no manufacturer sidebar or topbar
  if (isLoginPage) {
    return (
      <div className="w-full min-h-screen bg-[#121212] text-neutral-100">
        {children}
      </div>
    );
  }

  return (
    <ManufacturerAuthProvider>
      <div className="flex-1 w-full h-screen flex overflow-hidden bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-neutral-100">
        <ManufacturerSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <ManufacturerTopbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 dark:bg-[#121212]">
            <div className="w-full max-w-[1850px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ManufacturerAuthProvider>
  );
}
