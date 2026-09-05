import { create } from 'zustand';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export const CURRENCY_META: Record<CurrencyCode, { label: string; symbol: string; locale: string }> = {
  INR: { label: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  USD: { label: 'US Dollar', symbol: '$', locale: 'en-US' },
  EUR: { label: 'Euro', symbol: '€', locale: 'de-DE' },
  GBP: { label: 'British Pound', symbol: '£', locale: 'en-GB' },
};

const STORAGE_KEY = 'resilienceos.currency';

/* Module-level singleton so non-hook utilities (formatCurrency) can read the
   current currency without a React hook.

   IMPORTANT: always starts at INR (the SSR-safe default). Persisted preference
   is applied only after mount via hydrateAppSettings(), so the server-rendered
   HTML always matches the client's first render (avoids hydration errors). */
let activeCurrency: CurrencyCode = 'INR';

export function getActiveCurrency(): CurrencyCode {
  return activeCurrency;
}

interface AppSettingsState {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
}

export const useAppSettings = create<AppSettingsState>((set) => ({
  currency: 'INR',
  setCurrency: (c) => {
    activeCurrency = c;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, c);
    }
    set({ currency: c });
  },
}));

/** Call once inside a client component effect after mount to load persisted prefs. */
export function hydrateAppSettings() {
  if (typeof window === 'undefined') return;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (saved && saved in CURRENCY_META) {
      activeCurrency = saved;
      useAppSettings.setState({ currency: saved });
    }
  } catch {
    /* ignore malformed storage */
  }
}