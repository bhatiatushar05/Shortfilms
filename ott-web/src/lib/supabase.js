import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  persistSession: true,
  storageKey: 'ott-auth',
  autoRefreshToken: true,
  detectSessionInUrl: true,
})

// Add error handling to prevent console spam
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any stored data when signed out
    try {
      localStorage.removeItem('ott-auth');
      sessionStorage.clear();
    } catch (error) {
      // Silently handle storage errors
    }
  }
});

// Override the signOut method to handle errors gracefully
const originalSignOut = supabase.auth.signOut;
supabase.auth.signOut = async () => {
  try {
    return await originalSignOut();
  } catch (error) {
    // If signOut fails (e.g., session already expired), just clear local data
    try {
      localStorage.removeItem('ott-auth');
      sessionStorage.clear();
    } catch (storageError) {
      // Silently handle storage errors
    }
    return { error: null }; // Return success to prevent error propagation
  }
};

export default supabase
