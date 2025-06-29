import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [SUPABASE] Missing environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    debug: false // Disable debug for performance
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

// Minimal connection test
let connectionTested = false;
if (!connectionTested) {
  connectionTested = true;
  
  // Use a faster, non-blocking connection test
  supabase.auth.getSession()
    .then(({ error }) => {
      if (error) {
        console.error('❌ [SUPABASE] Connection error:', error.message);
      } else {
        console.log('✅ [SUPABASE] Connected');
      }
    })
    .catch(() => {
      console.error('❌ [SUPABASE] Connection failed');
    });
}

// Minimal auth event logging
supabase.auth.onAuthStateChange((event) => {
  console.log(`🔄 [SUPABASE] ${event}`);
});