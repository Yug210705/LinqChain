'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupplierStore } from '@/stores/useSupplierStore';
import { Truck } from 'lucide-react';

export function SupplierAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadFromStorage } = useSupplierStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (mounted && !isLoading) {
      const activePortal = typeof window !== 'undefined' ? localStorage.getItem('linqchain.active_portal') : null;
      if (!isAuthenticated || activePortal !== 'SUPPLIER') {
        router.replace('/login');
      }
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  // Show sapphire-themed loading spinner during authentication verification & hydration
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-neutral-100">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <Truck className="w-6 h-6 text-blue-500 absolute" />
        </div>
        <p className="text-sm font-medium text-neutral-400 tracking-wide uppercase font-mono">
          Verifying Supplier Partner Clearance...
        </p>
      </div>
    );
  }

  const activePortal = typeof window !== 'undefined' ? localStorage.getItem('linqchain.active_portal') : null;
  if (!isAuthenticated || activePortal !== 'SUPPLIER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-neutral-100 font-mono text-sm">
        <div className="text-neutral-400">Restricted Access: Redirecting to Unified Gateway...</div>
      </div>
    );
  }

  return <>{children}</>;
}
