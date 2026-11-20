'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { hydrateAppSettings } from '@/stores/useAppStore';
import { hydratePersonalization } from '@/stores/usePersonalizationStore';
import { SapEventProvider } from '@/components/providers/sap-event-provider';
import { AuthProvider } from '@/components/providers/auth-provider';

// Suppress third-party browser extension errors (e.g. MetaMask inpage.js) and React 19 next-themes warnings
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message || '';
    const stack = reason?.stack || '';
    if (
      msg.includes('MetaMask') ||
      msg.includes('Failed to connect to MetaMask') ||
      stack.includes('chrome-extension://') ||
      stack.includes('moz-extension://') ||
      stack.includes('inpage.js')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const filename = event.filename || '';
    const msg = event.message || '';
    if (
      filename.includes('chrome-extension://') ||
      filename.includes('moz-extension://') ||
      msg.includes('MetaMask')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const orig = console.error;
    console.error = (...args: unknown[]) => {
      const first = typeof args[0] === 'string' ? args[0] : '';
      if (
        first.includes('Encountered a script tag') ||
        first.includes('MetaMask') ||
        first.includes('Hydration failed') ||
        first.includes('hydration-mismatch') ||
        first.includes("didn't match the client")
      ) {
        return;
      }
      orig.apply(console, args);
    };
  }
}
// Loads persisted app preferences (e.g. currency, accent, density) AFTER hydration so the
// server-rendered HTML always matches the client's first render.
function AppSettingsHydrator() {
  useEffect(() => {
    hydrateAppSettings();
    hydratePersonalization();
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SapEventProvider>
          <AppSettingsHydrator />
          <AuthProvider>
            {children}
          </AuthProvider>
        </SapEventProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}