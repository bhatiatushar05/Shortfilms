import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from './useSession'

export const useUserProfile = () => {
  const { user, isAuthed } = useSession()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProfile = async () => {
    if (!user?.id) {
      setProfile(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get user profile from user_controls table (the ONLY table we need)
      const { data, error } = await supabase
        .from('user_controls')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        // If no profile exists, that's okay - user might not have completed signup
        if (error.code === 'PGRST116') {
          setProfile(null)
        } else {
          throw error
        }
      } else {
        // Map user_controls data to match expected profile structure
        const profileData = {
          id: user.id,
          email: user.email,
          status: data?.status || 'active',
          can_access: data?.can_access || true,
          access_level: data?.access_level || 'full',
          suspension_reason: data?.suspension_reason || null,
          created_at: data?.created_at || new Date().toISOString(),
          updated_at: data?.updated_at || new Date().toISOString()
        }
        setProfile(profileData)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    if (!user?.id) return false

    setLoading(true)
    setError(null)

    try {
      // Update user profile in user_controls table
      const { data, error } = await supabase
        .from('user_controls')
        .upsert({
          email: user.email,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email' // This tells Supabase to UPDATE if email exists
        })
        .select()
        .single()

      if (error) throw error

      // Map the updated data back to profile structure
      const profileData = {
        id: user.id,
        email: user.email,
        status: data?.status || 'active',
        can_access: data?.can_access || true,
        access_level: data?.access_level || 'full',
        suspension_reason: data?.suspension_reason || null,
        created_at: data?.created_at || new Date().toISOString(),
        updated_at: data?.updated_at || new Date().toISOString()
      }
      
      setProfile(profileData)
      return true
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthed && user) {
      fetchProfile()
    } else {
      setProfile(null)
    }
  }, [user, isAuthed])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile
  }
}
