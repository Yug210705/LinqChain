'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { hydrateAppSettings } from '@/stores/useAppStore';
import { SapEventProvider } from '@/components/providers/sap-event-provider';

// Suppress the React 19 warning caused by next-themes injecting a script tag
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
      return;
    }
    orig.apply(console, args);
  };
}
// Loads persisted app preferences (e.g. currency) AFTER hydration so the
// server-rendered HTML always matches the client's first render.
function AppSettingsHydrator() {
  useEffect(() => {
    hydrateAppSettings();
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
          {children}
        </SapEventProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}