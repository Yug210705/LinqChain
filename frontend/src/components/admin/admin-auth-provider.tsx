'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/useAdminStore';
import { Shield } from 'lucide-react';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadFromStorage } = useAdminStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (typeof window !== 'undefined') {
        localStorage.setItem('linqchain.active_portal', 'ADMIN');
      }
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  // Show amber-themed loading spinner during authentication verification & hydration
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-neutral-100">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <Shield className="w-6 h-6 text-amber-500 absolute" />
        </div>
        <p className="text-sm font-medium text-neutral-400 tracking-wide uppercase font-mono">
          Verifying Admin Clearance & Governance Credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-neutral-100 font-mono text-sm">
        <div className="text-neutral-400">Restricted Access: Redirecting to Unified Gateway...</div>
      </div>
    );
  }

  return <>{children}</>;
}
