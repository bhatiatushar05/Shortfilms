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
      // First, authenticate with Supabase
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        setError(loginError.message)
        return false
      }

      // If login successful, check if user is suspended/restricted
      if (data.user) {
        try {
          // Check user_controls table for user status (this is where admin dashboard updates it)
          const { data: controlData, error: controlError } = await supabase
            .from('user_controls')
            .select('status, can_access, access_level')
            .eq('user_id', data.user.id)
            .single()

          if (controlError && controlError.code !== 'PGRST116') {
            console.error('Error checking user controls:', controlError)
            // Continue with login if we can't check controls
            return true
          }

          if (controlData) {
            console.log('User control status:', controlData.status)
            
            // Check if user is suspended
            if (controlData.status === 'suspended' || controlData.can_access === false) {
              // User is suspended, sign them out immediately
              await supabase.auth.signOut()
              setError('Access denied: Your account is suspended. Please contact admin.')
              return false
            }
            
            // Check if user is restricted
            if (controlData.status === 'restricted' || controlData.access_level === 'limited') {
              // User is restricted but can still access
              console.log('User has restricted access')
            }
          }
        } catch (controlErr) {
          console.error('Error checking user controls:', controlErr)
          // Continue with login if we can't check controls
        }
      }

      return true
    } catch (err) {
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
