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

  const isDedicatedPortal =
    currentPath === '/' ||
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/supplier') ||
    currentPath.startsWith('/manufacturer') ||
    currentPath === '/login' ||
    currentPath === '/privacy' ||
    currentPath === '/terms' ||
    currentPath === '/security' ||
    currentPath === '/licenses' ||
    currentPath === '/pricing';

  // Dedicated enterprise portals (Landing Page, Admin, Supplier, Manufacturer, Login, Legal)
  // manage their own dedicated layout, sidebar, topbar, and security guards.
  if (isDedicatedPortal) {
    if (currentPath === '/' || currentPath === '/login') {
      return (
        <div className="w-full min-h-screen">
          {children}
          <CookieConsentBanner />
        </div>
      );
    }
    return (
      <div className="flex-1 w-full h-full min-w-0 flex flex-col overflow-y-auto">
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
      <div className="flex-1 flex overflow-hidden w-full">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 print:w-full print:p-0">
          <div className="print:hidden">
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
