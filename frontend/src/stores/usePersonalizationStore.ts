import { create } from 'zustand';

export type AccentColor = 'amber' | 'emerald' | 'sapphire' | 'crimson' | 'violet';
export type UiDensity = 'compact' | 'standard' | 'comfortable';
export type DateFormat = 'iso' | 'european' | 'us';
export type ClockFormat = '24h' | '12h';
export type NumberFormat = 'standard' | 'european' | 'indian';

export interface PersonalizationState {
  accentColor: AccentColor;
  density: UiDensity;
  highContrast: boolean;
  reducedMotion: boolean;
  defaultLandingPage: string;
  audioSignals: boolean;
  klaxonSound: boolean;
  audioVolume: number;
  dateFormat: DateFormat;
  clockFormat: ClockFormat;
  numberFormat: NumberFormat;
  operatingLanguage: string;
  graphFps: '60' | '30';
  autoCenterGraph: boolean;

  // Actions
  setPersonalization: (updates: Partial<Omit<PersonalizationState, 'setPersonalization' | 'applyToDOM'>>) => void;
  applyToDOM: () => void;
}

const STORAGE_KEY = 'linqchain.workspace.personalization';

export const ACCENT_PALETTES: Record<AccentColor, {
  name: string;
  hex: string;
  hoverHex: string;
  glowRgba: string;
  badgeBg: string;
  badgeText: string;
  borderRgba: string;
  twBg: string;
  twBorder: string;
  twText: string;
  twRing: string;
}> = {
  amber: {
    name: 'Warm Amber',
    hex: '#f59e0b',
    hoverHex: '#d97706',
    glowRgba: 'rgba(245, 158, 11, 0.25)',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeText: '#f59e0b',
    borderRgba: 'rgba(245, 158, 11, 0.3)',
    twBg: 'bg-amber-600',
    twBorder: 'border-amber-500',
    twText: 'text-amber-500',
    twRing: 'ring-amber-500',
  },
  emerald: {
    name: 'Cyber Emerald',
    hex: '#10b981',
    hoverHex: '#059669',
    glowRgba: 'rgba(16, 185, 129, 0.25)',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeText: '#10b981',
    borderRgba: 'rgba(16, 185, 129, 0.3)',
    twBg: 'bg-emerald-600',
    twBorder: 'border-emerald-500',
    twText: 'text-emerald-500',
    twRing: 'ring-emerald-500',
  },
  sapphire: {
    name: 'Electric Sapphire',
    hex: '#3b82f6',
    hoverHex: '#2563eb',
    glowRgba: 'rgba(59, 130, 246, 0.25)',
    badgeBg: 'rgba(59, 130, 246, 0.12)',
    badgeText: '#3b82f6',
    borderRgba: 'rgba(59, 130, 246, 0.3)',
    twBg: 'bg-blue-600',
    twBorder: 'border-blue-500',
    twText: 'text-blue-500',
    twRing: 'ring-blue-500',
  },
  crimson: {
    name: 'War Room Crimson',
    hex: '#ef4444',
    hoverHex: '#dc2626',
    glowRgba: 'rgba(239, 68, 68, 0.25)',
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    badgeText: '#ef4444',
    borderRgba: 'rgba(239, 68, 68, 0.3)',
    twBg: 'bg-rose-600',
    twBorder: 'border-rose-500',
    twText: 'text-rose-500',
    twRing: 'ring-rose-500',
  },
  violet: {
    name: 'Quantum Violet',
    hex: '#8b5cf6',
    hoverHex: '#7c3aed',
    glowRgba: 'rgba(139, 92, 246, 0.25)',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    badgeText: '#8b5cf6',
    borderRgba: 'rgba(139, 92, 246, 0.3)',
    twBg: 'bg-purple-600',
    twBorder: 'border-purple-500',
    twText: 'text-purple-500',
    twRing: 'ring-purple-500',
  },
};

const defaultSettings: Omit<PersonalizationState, 'setPersonalization' | 'applyToDOM'> = {
  accentColor: 'amber',
  density: 'standard',
  highContrast: false,
  reducedMotion: false,
  defaultLandingPage: '/command-center',
  audioSignals: true,
  klaxonSound: true,
  audioVolume: 75,
  dateFormat: 'iso',
  clockFormat: '24h',
  numberFormat: 'standard',
  operatingLanguage: 'en-US',
  graphFps: '60',
  autoCenterGraph: true,
};

export function applyPersonalizationAttributes(state: Partial<PersonalizationState>) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (state.accentColor) {
    root.setAttribute('data-accent', state.accentColor);
    const pal = ACCENT_PALETTES[state.accentColor] || ACCENT_PALETTES.amber;
    root.style.setProperty('--app-accent', pal.hex);
    root.style.setProperty('--app-accent-hover', pal.hoverHex);
    root.style.setProperty('--app-accent-glow', pal.glowRgba);
    root.style.setProperty('--app-accent-border', pal.borderRgba);
    root.style.setProperty('--app-accent-badge-bg', pal.badgeBg);
    root.style.setProperty('--app-accent-badge-text', pal.badgeText);
  }

  if (state.density) {
    root.setAttribute('data-density', state.density);
  }

  if (state.highContrast !== undefined) {
    if (state.highContrast) {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }
  }

  if (state.reducedMotion !== undefined) {
    if (state.reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }
  }
}

export const usePersonalizationStore = create<PersonalizationState>((set, get) => ({
  ...defaultSettings,

  setPersonalization: (updates) => {
    const current = get();
    const nextState = { ...current, ...updates };

    if (typeof window !== 'undefined') {
      try {
        const toSave = {
          accentColor: nextState.accentColor,
          density: nextState.density,
          highContrast: nextState.highContrast,
          reducedMotion: nextState.reducedMotion,
          defaultLandingPage: nextState.defaultLandingPage,
          audioSignals: nextState.audioSignals,
          klaxonSound: nextState.klaxonSound,
          audioVolume: nextState.audioVolume,
          dateFormat: nextState.dateFormat,
          clockFormat: nextState.clockFormat,
          numberFormat: nextState.numberFormat,
          operatingLanguage: nextState.operatingLanguage,
          graphFps: nextState.graphFps,
          autoCenterGraph: nextState.autoCenterGraph,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {}
    }

    applyPersonalizationAttributes(nextState);
    set(updates);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('linqchain:personalization-changed', { detail: nextState }));
    }
  },

  applyToDOM: () => {
    applyPersonalizationAttributes(get());
  },
}));

/** Hydrate preferences from localStorage safely after initial SSR mount */
export function hydratePersonalization() {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      usePersonalizationStore.setState(parsed);
      applyPersonalizationAttributes(parsed);
    } else {
      applyPersonalizationAttributes(defaultSettings);
    }
  } catch {
    applyPersonalizationAttributes(defaultSettings);
  }
}
