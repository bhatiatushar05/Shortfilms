import { createClient } from '@supabase/supabase-js'
import config from '../config/config.js'

// Get Supabase configuration
const supabaseConfig = config.supabase

// Validate configuration
if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  const error = new Error('Missing Supabase environment variables')
  console.error('❌ Supabase configuration error:', error.message)
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  console.error('Please check your .env.local file')
  
  // In development, throw error to prevent silent failures
  if (config.app.isDevelopment) {
    throw error
  }
  
  // In production, create a fallback client with warnings
  console.warn('⚠️ Creating fallback Supabase client - functionality will be limited')
}

// Create Supabase client with proper configuration
let supabase

try {
  supabase = createClient(
    supabaseConfig.url || 'https://placeholder.supabase.co',
    supabaseConfig.anonKey || 'placeholder-key',
    supabaseConfig.options
  )
  
  // Test connection in development
  if (config.app.isDevelopment) {
    testConnection()
  }
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error)
  
  // Create minimal fallback client
  supabase = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key',
    {
      persistSession: false,
      storageKey: 'ott-auth-fallback',
      autoRefreshToken: false,
      detectSessionInUrl: false,
      auth: { persistSession: false }
    }
  )
}

// Test database connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('titles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.warn('⚠️ Supabase connection test failed:', error.message)
    } else {
      console.log('✅ Supabase connection successful')
    }
  } catch (error) {
    console.warn('⚠️ Supabase connection test error:', error.message)
  }
}

// Enhanced error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  try {
    if (event === 'SIGNED_OUT') {
      // Clear all stored data when signed out
      clearAllStorage()
    } else if (event === 'SIGNED_IN') {
      console.log('✅ User signed in successfully')
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('🔄 Token refreshed successfully')
    }
  } catch (error) {
    console.error('❌ Auth state change error:', error)
  }
})

// Enhanced storage clearing function
function clearAllStorage() {
  try {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('ott')) {
        localStorage.removeItem(key)
      }
    })
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear any other auth-related storage
    if (typeof window !== 'undefined') {
      // Clear cookies if they exist
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=')
        if (name.trim().includes('auth') || name.trim().includes('supabase')) {
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
    }
    
    console.log('🧹 Storage cleared successfully')
  } catch (error) {
    console.warn('⚠️ Storage clearing error:', error)
  }
}

// Enhanced signOut method with better error handling
const originalSignOut = supabase.auth.signOut
supabase.auth.signOut = async () => {
  try {
    // Clear storage before sign out
    clearAllStorage()
    
    // Perform sign out
    const result = await originalSignOut()
    
    // Clear storage again after sign out
    clearAllStorage()
    
    console.log('✅ Sign out completed successfully')
    return result
  } catch (error) {
    console.error('❌ Sign out error:', error)
    
    // Even if sign out fails, clear local data
    clearAllStorage()
    
    // Return success to prevent error propagation
    return { error: null }
  }
}

// Export the enhanced client
export { supabase }
export default supabase
