import { createClient } from '@supabase/supabase-js'
import config from '../config/config.js'

// Get Supabase configuration
const supabaseConfig = config.supabase

// Validate configuration
if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  console.error('❌ Supabase configuration error: Missing environment variables')
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  console.error('Please check your .env.local file')
  console.error('Current values:', { url: supabaseConfig.url, anonKey: supabaseConfig.anonKey })
  
  // In development, show warning but continue
  if (config.app.isDevelopment) {
    console.warn('⚠️ Continuing without Supabase configuration - authentication will not work')
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

// Simple auth state change handler
supabase.auth.onAuthStateChange((event, session) => {
  try {
    if (event === 'SIGNED_IN') {
      console.log('✅ User signed in successfully')
    } else if (event === 'SIGNED_OUT') {
      console.log('✅ User signed out successfully')
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('🔄 Token refreshed successfully')
    }
  } catch (error) {
    console.error('❌ Auth state change error:', error)
  }
})

// Export the enhanced client
export { supabase }
export default supabase
