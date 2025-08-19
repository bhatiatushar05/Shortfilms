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
          // Check profiles table for user status (this is where admin dashboard updates it)
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('status, subscription')
            .eq('id', data.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error checking user profile:', profileError)
            // Continue with login if we can't check profile
            return true
          }

          if (profileData) {
            console.log('User profile status:', profileData.status)
            
            // Check if user is suspended
            if (profileData.status === 'suspended') {
              // User is suspended, sign them out immediately
              await supabase.auth.signOut()
              setError('Access denied: Your account is suspended. Please contact admin.')
              return false
            }
            
            // Check if user is restricted
            if (profileData.status === 'restricted') {
              // User is restricted but can still access
              console.log('User has restricted access')
            }
          }
        } catch (profileErr) {
          console.error('Error checking user profile:', profileErr)
          // Continue with login if we can't check profile
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
