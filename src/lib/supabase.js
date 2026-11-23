import { createClient } from '@supabase/supabase-js';

let rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Strip accidental "https://" or "http://" from key if prepended
if (rawKey.startsWith('https://sb_') || rawKey.startsWith('http://sb_')) {
  rawKey = rawKey.replace(/^https?:\/\//, '');
}
if (rawUrl.startsWith('https://sb_') || rawUrl.startsWith('http://sb_')) {
  rawUrl = rawUrl.replace(/^https?:\/\//, '');
}

// Auto-detect if URL and Key were accidentally swapped
if ((rawUrl.startsWith('sb_') || rawUrl.startsWith('eyJ')) && rawKey.includes('supabase.co')) {
  const temp = rawUrl;
  rawUrl = rawKey;
  rawKey = temp;
}

// Clean URL: strip trailing /rest/v1 and trailing slashes
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = rawKey;

export const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('.supabase.co') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 20 &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
};

// Fallback dummy client if credentials are not configured yet, preventing app crashes
const dummyClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: null, error: new Error('Supabase not configured yet') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured yet') }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: new Error('Supabase not configured yet') })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        order: async () => ({ data: [], error: null }),
        single: async () => ({ data: null, error: null }),
        then: (cb) => Promise.resolve({ data: [], error: null }).then(cb)
      }),
      order: async () => ({ data: [], error: null }),
      then: (cb) => Promise.resolve({ data: [], error: null }).then(cb)
    }),
    insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
    update: async () => ({ data: null, error: new Error('Supabase not configured') }),
    delete: async () => ({ data: null, error: new Error('Supabase not configured') })
  })
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : dummyClient;
