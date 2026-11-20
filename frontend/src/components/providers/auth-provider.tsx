'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Shield } from 'lucide-react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const currentPath = pathname ?? '/';
  const isLoginPage = currentPath === '/login';
  const isLandingPage = currentPath === '/' || currentPath === '';
  const isAdminRoute = currentPath.startsWith('/admin');
  const isSupplierRoute = currentPath.startsWith('/supplier');
  const isManufacturerRoute = currentPath.startsWith('/manufacturer');
  const isPublicRoute =
    isLandingPage ||
    currentPath === '/privacy' ||
    currentPath === '/terms' ||
    currentPath === '/security' ||
    currentPath === '/licenses' ||
    currentPath === '/pricing';

  const isBypassedRoute = isAdminRoute || isSupplierRoute || isManufacturerRoute || isLoginPage || isPublicRoute;

  // Operator Route Protection: Must have OPERATOR active portal clearance
  useEffect(() => {
      if (!isBypassedRoute && !isLoading) {
        const activePortal = typeof window !== 'undefined' ? localStorage.getItem('linqchain.active_portal') : null;
        if (!isAuthenticated || activePortal !== 'OPERATOR') {
          router.replace('/login');
        }
      }
}, [isBypassedRoute, isAuthenticated, isLoading, router]);

// Dedicated portals and public pages manage their own access
if (isBypassedRoute) {
  return <>{children}</>;
}

// Show loading indicator during initial hydration
if (isLoading) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#121212] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Shield className="h-10 w-10 text-amber-500 animate-pulse" />
          <div className="absolute inset-0 rounded-full blur-md bg-amber-500/20 animate-ping" />
        </div>
        <div className="text-sm font-medium text-neutral-400 font-mono">Verifying Operator Clearance...</div>
      </div>
    </div>
  );
}

const activePortal = typeof window !== 'undefined' ? localStorage.getItem('linqchain.active_portal') : null;
if (!isAuthenticated || activePortal !== 'OPERATOR') {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#121212] text-white font-mono text-sm">
      <div className="text-neutral-400">Restricted Access: Redirecting to Unified Gateway...</div>
    </div>
  );
}

return <>{children}</>;
}
