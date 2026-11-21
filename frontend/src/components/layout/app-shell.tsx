'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { CookieConsentBanner } from '@/components/legal/cookie-consent-banner';
import { MobileDeviceAdvisory } from '@/components/layout/mobile-device-advisory';

export function AppShell({ children }: { children: React.ReactNode }) {
  const nextPathname = usePathname();
  const currentPath = nextPathname ?? '/';

  // Standalone public pages (landing, login)
  if (currentPath === '/' || currentPath === '/login') {
    return (
      <div className="w-full min-h-screen">
        {children}
        <CookieConsentBanner />
      </div>
    );
  }

  // Dashboard application portals (Admin, Supplier, Manufacturer)
  // Must be strictly isolated h-screen overflow-hidden so the sidebar stays fixed
  // and only the inner main content panel scrolls independently.
  const isDashboardApp =
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/supplier') ||
    currentPath.startsWith('/manufacturer');

  if (isDashboardApp) {
    return (
      <div className="w-full h-screen overflow-hidden flex flex-col">
        <MobileDeviceAdvisory />
        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
          {children}
        </div>
        <CookieConsentBanner />
      </div>
    );
  }

  // Legal & informational pages (scroll normally)
  const isLegalPage =
    currentPath === '/privacy' ||
    currentPath === '/terms' ||
    currentPath === '/security' ||
    currentPath === '/licenses' ||
    currentPath === '/pricing';

  if (isLegalPage) {
    return (
      <div className="w-full min-h-screen overflow-y-auto">
        <MobileDeviceAdvisory />
        {children}
        <CookieConsentBanner />
      </div>
    );
  }

  // Standard Operator Command Center shell
  return (
    <div className="flex h-screen overflow-hidden w-full flex-col">
      <MobileDeviceAdvisory />
      <div className="flex-1 flex overflow-hidden w-full min-h-0">
        <div className="print:hidden h-full shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:w-full print:p-0">
          <div className="print:hidden shrink-0">
            <Topbar />
          </div>
          <main className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible print:w-full">
            {children}
          </main>
        </div>
      </div>
      <CookieConsentBanner />
    </div>
  );
}
