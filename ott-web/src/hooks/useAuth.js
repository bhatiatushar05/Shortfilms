import { useState } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const signup = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signupError) {
        setError(signupError.message)
        return false
      }

      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔐 Login attempt for:', email)
      
      // CRITICAL: Check user status BEFORE attempting Supabase authentication
      // This prevents suspended users from even getting authenticated
      
      console.log('🔍 Step 1: Checking user status in user_controls table...')
      
      // Check user status directly from user_controls table (the ONLY table we need)
      const { data: controlData, error: controlError } = await supabase
        .from('user_controls')
        .select('status, can_access, suspension_reason, email')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      console.log('🔍 Step 1 Result:', { controlData, controlError })
      
      if (controlError && controlError.code !== 'PGRST116') {
        console.error('❌ Error checking user controls:', controlError)
        // Continue with authentication if we can't check controls
        console.log('⚠️ Continuing with authentication due to error...')
      } else if (controlData) {
        console.log('🔍 Found user in user_controls:', controlData.email, 'Status:', controlData.status, 'Can Access:', controlData.can_access)
        
        if (controlData.status === 'suspended' || controlData.can_access === false) {
          console.log('🚫 User is suspended/blocked in user_controls - BLOCKING LOGIN')
          const reason = controlData.suspension_reason || 'Suspended by administrator'
          setError(`🚫 Access Denied: Your account has been suspended. Reason: ${reason}`)
          console.log('🚫 Login blocked, returning false')
          return false
        } else {
          console.log('✅ User status check passed - not suspended')
        }
      } else {
        console.log('ℹ️ User not found in user_controls, proceeding with authentication')
      }
      
      // If we get here, user is not suspended - proceed with authentication
      console.log('✅ User status check passed - proceeding with Supabase authentication')
      
      // Now attempt Supabase authentication
      console.log('🔍 Step 2: Attempting Supabase authentication...')
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        console.log('❌ Supabase login error:', loginError.message)
        setError(loginError.message)
        return false
      }

      // Authentication successful
      if (data.user) {
        console.log('✅ Supabase authentication successful for:', data.user.email)
        console.log('✅ Final status check passed - login successful')
        return true
      }

      return false
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: logoutError } = await supabase.auth.signOut()
      
      if (logoutError) {
        setError(logoutError.message)
        return false
      }

      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    signup,
    login,
    logout,
    loading,
    error,
    clearError,
  }
}
