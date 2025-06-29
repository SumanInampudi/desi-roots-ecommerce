import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 [SUPABASE] Initializing Supabase client...', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [SUPABASE] Missing environment variables:', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable automatic URL detection to prevent navigation errors
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    debug: true // Enable debug logging
  },
  global: {
    headers: {
      'X-Client-Info': 'desi-roots-web'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add connection test
console.log('🔍 [SUPABASE] Testing connection...');
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ [SUPABASE] Connection error:', error);
  } else {
    console.log('✅ [SUPABASE] Connected successfully', {
      hasSession: !!data.session,
      userId: data.session?.user?.id
    });
  }
});

// Log all auth events for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔄 [SUPABASE] Auth event:', {
    event,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    hasSession: !!session
  });
});