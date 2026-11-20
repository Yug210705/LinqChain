'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useManufacturerStore } from '@/stores/useManufacturerStore';
import { Factory } from 'lucide-react';

export function ManufacturerAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadFromStorage } = useManufacturerStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (mounted && !isLoading) {
      const activePortal = typeof window !== 'undefined' ? localStorage.getItem('linqchain.active_portal') : null;
      if (!isAuthenticated || activePortal !== 'MANUFACTURER') {
        router.replace('/login');
      }
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  // Show cyber emerald loading spinner during authentication verification & hydration
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-neutral-100">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <Factory className="w-6 h-6 text-emerald-500 absolute" />
        </div>
        <p className="text-sm font-medium text-neutral-400 tracking-wide uppercase font-mono">
          Verifying Plant Clearance & SCADA Credentials...
        </p>
      </div>
    );
  }

  const activePortal = typeof window !== 'undefined' ? localStorage.getItem('linqchain.active_portal') : null;
  if (!isAuthenticated || activePortal !== 'MANUFACTURER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-neutral-100 font-mono text-sm">
        <div className="text-neutral-400">Restricted Access: Redirecting to Unified Gateway...</div>
      </div>
    );
  }

  return <>{children}</>;
}
