import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export const useUserStatus = () => {
  const [userStatus, setUserStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { logout } = useAuth()

  const checkUserStatus = async (userId) => {
    if (!userId) return null

    try {
      // Check user_controls table for current status
      const { data: controlData, error: controlError } = await supabase
        .from('user_controls')
        .select('status, can_access, access_level, suspension_reason')
        .eq('user_id', userId)
        .single()

      if (controlError && controlError.code !== 'PGRST116') {
        console.error('Error checking user controls:', controlError)
        return null
      }

      if (controlData) {
        const status = {
          isSuspended: controlData.status === 'suspended' || controlData.can_access === false,
          isRestricted: controlData.status === 'restricted' || controlData.access_level === 'limited',
          status: controlData.status,
          canAccess: controlData.can_access,
          accessLevel: controlData.access_level,
          suspensionReason: controlData.suspension_reason
        }

        // If user is suspended, sign them out immediately
        if (status.isSuspended) {
          console.log('User is suspended, signing out...')
          await logout()
          setError('Access denied: Your account is suspended. Please contact admin.')
          return status
        }

        return status
      }

      return null
    } catch (err) {
      console.error('Error checking user status:', err)
      return null
    }
  }

  const refreshStatus = async () => {
    const user = supabase.auth.getUser()
    if (user) {
      const status = await checkUserStatus(user.id)
      setUserStatus(status)
    }
    setLoading(false)
  }

  useEffect(() => {
    // Check status on mount
    refreshStatus()

    // Set up real-time subscription to user_controls table
    const channel = supabase
      .channel('user_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_controls'
        },
        (payload) => {
          console.log('User status changed:', payload)
          // Refresh status when it changes
          refreshStatus()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    userStatus,
    loading,
    error,
    refreshStatus,
    checkUserStatus
  }
}

