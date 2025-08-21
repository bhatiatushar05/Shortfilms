import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  // Use placeholder values to prevent app crash
  const placeholderUrl = 'https://placeholder.supabase.co'
  const placeholderKey = 'placeholder-key'
  
  console.log('Using placeholder Supabase client. App will not function properly until environment variables are set.')
  
  supabase = createClient(placeholderUrl, placeholderKey, {
    persistSession: false,
    storageKey: 'ott-auth',
    autoRefreshToken: false,
    detectSessionInUrl: false,
    auth: {
      persistSession: false,
    }
  })
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    persistSession: true,
    storageKey: 'ott-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    auth: {
      persistSession: true,
    }
  })
}

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
    // Clear all storage before sign out
    try {
      localStorage.removeItem('ott-auth');
      sessionStorage.clear();
      // Clear all Supabase-related storage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('ott')) {
          localStorage.removeItem(key);
        }
      });
    } catch (storageError) {
      // Silently handle storage errors
    }
    
    const result = await originalSignOut();
    
    // Clear storage again after sign out
    try {
      localStorage.removeItem('ott-auth');
      sessionStorage.clear();
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('ott')) {
          localStorage.removeItem(key);
        }
      });
    } catch (storageError) {
      // Silently handle storage errors
    }
    
    return result;
  } catch (error) {
    // If signOut fails (e.g., session already expired), just clear local data
    try {
      localStorage.removeItem('ott-auth');
      sessionStorage.clear();
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('ott')) {
          localStorage.removeItem(key);
        }
      });
    } catch (storageError) {
      // Silently handle storage errors
    }
    return { error: null }; // Return success to prevent error propagation
  }
};

export { supabase }
export default supabase
