import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project-id')
);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string | null;
}

/**
 * Enterprise Single Sign-On (SSO) with Microsoft Azure AD
 */
export async function signInWithMicrosoft(): Promise<{ error?: string | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Supabase is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL in .env.local.' };
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      scopes: 'email profile offline_access',
      redirectTo: `${origin}/command-center`,
    },
  });

  return { error: error ? error.message : null };
}

/**
 * Enterprise Single Sign-On (SSO) with SAP Identity Authentication Service
 */
export async function signInWithSAP(): Promise<{ error?: string | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: 'Supabase is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL in .env.local.' };
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'keycloak' as any,
    options: {
      redirectTo: `${origin}/command-center`,
    },
  });

  return { error: error ? error.message : null };
}

/**
 * Email & Password Sign-In
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  const supabase = getSupabase();
  if (!supabase) {
    return { user: null, session: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return { user: data.user, session: data.session, error: null };
}

/**
 * Email & Password Sign-Up
 */
export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthResponse> {
  const supabase = getSupabase();
  if (!supabase) {
    return { user: null, session: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0],
      },
    },
  });

  if (error) {
    return { user: null, session: null, error: error.message };
  }

  return { user: data.user, session: data.session, error: null };
}

/**
 * Sign Out from Supabase session
 */
export async function signOutSupabase(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error during Supabase signOut:', e);
    }
  }
}
