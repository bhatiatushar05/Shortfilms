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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        // If no profile exists, that's okay - user might not have completed signup
        if (error.code === 'PGRST116') {
          setProfile(null)
        } else {
          throw error
        }
      } else {
        setProfile(data)
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
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id' // This tells Supabase to UPDATE if ID exists
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data)
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
