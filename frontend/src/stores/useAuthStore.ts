import { create } from 'zustand';
import {
  isSupabaseConfigured,
  signInWithEmail as supabaseSignIn,
  signInWithMicrosoft as supabaseMicrosoft,
  signInWithSAP as supabaseSAP,
  signOutSupabase,
  getSupabase,
} from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface PlatformUserProfile {
  id: string;
  email: string;
  display_name: string;
  role_id: string;
  role_name?: string;
  org_id?: string;
  org_name?: string;
  is_active: boolean;
  permissions: string[];
  job_title?: string;
  department?: string;
  phone?: string;
  timezone?: string;
  avatar_color?: string;
  avatar_url?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: PlatformUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authProvider: 'supabase' | 'local' | 'guest';
  login: (email: string, password: string) => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  loginWithSAP: () => Promise<void>;
  loginGuest: () => Promise<void>;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
  updateUserProfile: (updates: Partial<PlatformUserProfile>) => void;
  hasPermission: (resource: string, action: string) => boolean;
}

const TOKEN_KEY = 'resilienceos.platform.token';
const REFRESH_KEY = 'resilienceos.platform.refresh_token';
const USER_KEY = 'resilienceos.platform.user';
const PROVIDER_KEY = 'resilienceos.platform.provider';

export function getPlatformToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authProvider: 'local',

  login: async (email: string, password: string) => {
    // 1. If Supabase is configured in environment, attempt Supabase Auth first
    if (isSupabaseConfigured) {
      const { user: sbUser, session, error } = await supabaseSignIn(email, password);
      if (!error && sbUser && session) {
        const token = session.access_token;
        const refreshToken = session.refresh_token;
        const userProfile: PlatformUserProfile = {
          id: sbUser.id,
          email: sbUser.email || email,
          display_name: sbUser.user_metadata?.display_name || sbUser.email?.split('@')[0] || 'Enterprise Operator',
          role_id: 'role-operator',
          role_name: 'OPERATOR',
          org_id: 'org-global',
          org_name: 'Global Enterprise Corp',
          is_active: true,
          permissions: ['*'],
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(REFRESH_KEY, refreshToken);
          localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
          localStorage.setItem(PROVIDER_KEY, 'supabase');
        }

        set({
          token,
          refreshToken,
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
          authProvider: 'supabase',
        });
        return;
      }
      // If Supabase was configured but returned an auth error, we can attempt local backend fallback
    }

    // 2. Direct FastAPI local backend authentication
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Failed to sign in. Please check your credentials.');
    }

    const data = await res.json();
    const token = data.access_token;
    const refreshToken = data.refresh_token;

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
      localStorage.setItem(PROVIDER_KEY, 'local');
    }

    // Fetch user profile & RBAC permissions from /api/auth/me
    let userProfile: PlatformUserProfile;
    try {
      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        userProfile = await meRes.json();
      } else {
        userProfile = {
          id: data.user?.id || 'user',
          email: data.user?.email || email,
          display_name: data.user?.display_name || email.split('@')[0],
          role_id: data.user?.role_id || '',
          role_name: data.user?.role_name || 'OPERATOR',
          org_id: data.user?.org_id,
          org_name: data.user?.org_name,
          is_active: true,
          permissions: ['*'],
        };
      }
    } catch {
      userProfile = {
        id: 'usr-operator-001',
        email,
        display_name: 'Lead Supply Chain Operator',
        role_id: 'role-operator',
        role_name: 'OPERATOR',
        org_id: 'org-global',
        org_name: 'Global Enterprise Corp',
        is_active: true,
        permissions: ['*'],
      };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
    }

    set({
      token,
      refreshToken,
      user: userProfile,
      isAuthenticated: true,
      isLoading: false,
      authProvider: 'local',
    });
  },

  loginWithMicrosoft: async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabaseMicrosoft();
      if (error) throw new Error(error);
    } else {
      // Mock / direct enterprise SSO bridge when keys are pending
      await get().loginGuest();
    }
  },

  loginWithSAP: async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabaseSAP();
      if (error) throw new Error(error);
    } else {
      // Mock / direct SAP IAS bridge
      await get().loginGuest();
    }
  },

  loginGuest: async () => {
    // 1-Click Instant Guest / Demo operator access
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'operator@linqchain.com', password: 'operator123' }),
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.access_token;
        const refreshToken = data.refresh_token;
        const userProfile: PlatformUserProfile = {
          id: data.user?.id || 'usr-operator-001',
          email: data.user?.email || 'operator@linqchain.com',
          display_name: 'Yug Pathak (Lead Operator)',
          role_id: data.user?.role_id || 'role-operator',
          role_name: data.user?.role_name || 'OPERATOR',
          org_id: data.user?.org_id || 'org-global',
          org_name: data.user?.org_name || 'Global Enterprise Corp',
          is_active: true,
          permissions: ['*'],
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token);
          if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
          localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
          localStorage.setItem(PROVIDER_KEY, 'guest');
        }

        set({
          token,
          refreshToken,
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
          authProvider: 'guest',
        });
        return;
      }
    } catch (e) {
      console.warn('Backend login for guest session failed, using local fallback:', e);
    }

    const fallbackToken = 'guest-operator-token';
    const guestUser: PlatformUserProfile = {
      id: 'usr-guest-001',
      email: 'operator@linqchain.com',
      display_name: 'Yug Pathak (Lead Operator)',
      role_id: 'role-operator',
      role_name: 'OPERATOR',
      org_id: 'org-linqchain',
      org_name: 'LinqChain Enterprise',
      is_active: true,
      permissions: ['*'],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, fallbackToken);
      localStorage.setItem(USER_KEY, JSON.stringify(guestUser));
      localStorage.setItem(PROVIDER_KEY, 'guest');
    }

    set({
      token: fallbackToken,
      refreshToken: null,
      user: guestUser,
      isAuthenticated: true,
      isLoading: false,
      authProvider: 'guest',
    });
  },

  logout: () => {
    signOutSupabase();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PROVIDER_KEY);
    }
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authProvider: 'local',
    });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  loadFromStorage: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    // Check Supabase session first if configured
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            const sbUser = data.session.user;
            const userProfile: PlatformUserProfile = {
              id: sbUser.id,
              email: sbUser.email || '',
              display_name: sbUser.user_metadata?.display_name || sbUser.email?.split('@')[0] || 'Enterprise Operator',
              role_id: 'role-operator',
              role_name: 'OPERATOR',
              org_id: 'org-global',
              org_name: 'Global Enterprise Corp',
              is_active: true,
              permissions: ['*'],
            };
            set({
              token: data.session.access_token,
              refreshToken: data.session.refresh_token,
              user: userProfile,
              isAuthenticated: true,
              isLoading: false,
              authProvider: 'supabase',
            });
            return;
          }
        } catch (e) {
          console.warn('Supabase session load error:', e);
        }
      }
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    const provider = (localStorage.getItem(PROVIDER_KEY) as any) || 'local';

    if (!token) {
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    let user: PlatformUserProfile | null = null;
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch {
        /* ignore parse error */
      }
    }

    set({
      token,
      refreshToken,
      user,
      isAuthenticated: true,
      isLoading: false,
      authProvider: provider,
    });

    // Background verify / refresh permissions
    try {
      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const freshProfile = await meRes.json();
        localStorage.setItem(USER_KEY, JSON.stringify(freshProfile));
        set({ user: freshProfile });
      }
    } catch {
      // keep cached profile
    }
  },

  updateUserProfile: (updates: Partial<PlatformUserProfile>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('linqchain:user-profile-updated', { detail: updated }));
    }
    set({ user: updated });
  },

  hasPermission: (resource: string, action: string) => {
    const { user } = get();
    if (!user) return false;
    if (user.role_name === 'OWNER') return true;
    const permKey = `${resource}:${action}`;
    return user.permissions?.includes(permKey) || user.permissions?.includes(`${resource}:*`) || user.permissions?.includes('*') || false;
  },
}));
