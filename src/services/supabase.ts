import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log('🔧 Supabase Config Debug:');
console.log('URL:', supabaseUrl ? 'SET ✅' : 'MISSING ❌');
console.log('Key:', supabaseAnonKey ? 'SET ✅' : 'MISSING ❌');
console.log('All env vars:', import.meta.env);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Type definitions for database tables (will expand as we create tables)
export type Database = {
  public: {
    Tables: {
      // We'll add table definitions here as we create them
    };
  };
};
