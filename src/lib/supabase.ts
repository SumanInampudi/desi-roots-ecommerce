import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [SUPABASE] Missing environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('❌ [SUPABASE] Invalid URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    debug: false
  },
  global: {
    headers: {
      'X-Client-Info': 'desi-roots-web'
    },
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }).catch(error => {
        console.error('❌ [SUPABASE] Fetch error:', error.message);
        throw new Error(`Network error: ${error.message}. Please check your internet connection and Supabase project status.`);
      });
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

// Enhanced connection test with better error handling
let connectionTested = false;
export const testSupabaseConnection = async (): Promise<boolean> => {
  if (connectionTested) return true;
  
  try {
    console.log('🔄 [SUPABASE] Testing connection...');
    
    // Test with a simple query that doesn't require authentication
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ [SUPABASE] Connection test failed:', error.message);
      return false;
    }
    
    connectionTested = true;
    console.log('✅ [SUPABASE] Connection successful');
    return true;
  } catch (error) {
    console.error('❌ [SUPABASE] Connection test error:', error);
    return false;
  }
};

// Test connection on module load
testSupabaseConnection();

// Enhanced auth event logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`🔄 [SUPABASE] Auth event: ${event}`);
  if (event === 'SIGNED_IN') {
    console.log('✅ [SUPABASE] User signed in');
  } else if (event === 'SIGNED_OUT') {
    console.log('🔄 [SUPABASE] User signed out');
  }
});