import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Fallback or environment keys
const defaultUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const defaultAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

// Initialize Supabase Client dynamically
export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  // Check localStorage for custom user-configured credentials if env is not set
  let url = defaultUrl;
  let key = defaultAnonKey;

  if (typeof window !== 'undefined' && (!url || !key)) {
    const customConfig = localStorage.getItem('dsa_tracker_supabase_config');
    if (customConfig) {
      try {
        const parsed = JSON.parse(customConfig);
        url = parsed.url || url;
        key = parsed.key || key;
      } catch (e) {
        console.error('Error parsing custom supabase config:', e);
      }
    }
  }

  if (url && key) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      return supabaseClient;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

// Helper to check if Supabase is currently connected
export function isSupabaseConfigured(): boolean {
  return !!getSupabase();
}

// Save custom Supabase config
export function saveCustomSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('dsa_tracker_supabase_config', JSON.stringify({ url, key }));
      supabaseClient = null; // Reset client to recreate with new config
      return getSupabase();
    } else {
      localStorage.removeItem('dsa_tracker_supabase_config');
      supabaseClient = null;
    }
  }
  return null;
}

// Get stored Supabase config
export function getStoredSupabaseConfig(): { url: string; key: string } {
  if (typeof window !== 'undefined') {
    const customConfig = localStorage.getItem('dsa_tracker_supabase_config');
    if (customConfig) {
      try {
        return JSON.parse(customConfig);
      } catch (e) {}
    }
  }
  return {
    url: defaultUrl,
    key: defaultAnonKey,
  };
}

export type { User, Session };
