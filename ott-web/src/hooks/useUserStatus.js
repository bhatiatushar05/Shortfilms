import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export const useUserStatus = (options = {}) => {
  const { enabled = true } = options
  const [userStatus, setUserStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { logout } = useAuth()
  const lastCheckRef = useRef(0)
  const debounceTimerRef = useRef(null)

  const checkUserStatus = async (userId) => {
    if (!userId) {
      console.log('🔍 checkUserStatus: No userId provided')
      return null
    }

    try {
      console.log('🔍 checkUserStatus: Checking status for userId:', userId)
      
      // First get the user's email from Supabase auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.email) {
        console.log('🔍 checkUserStatus: No user or email found')
        return null
      }
      
      console.log('🔍 checkUserStatus: User email:', user.email)
      
      // Check user_controls table by email (the ONLY table we need)
      const { data: controlData, error: controlError } = await supabase
        .from('user_controls')
        .select('status, can_access, access_level, suspension_reason, email')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      console.log('🔍 checkUserStatus: Database result:', { controlData, controlError })

      if (controlError && controlError.code !== 'PGRST116') {
        console.error('❌ Error checking user controls:', controlError)
        return null
      }

      if (controlData) {
        const status = {
          isSuspended: controlData.status === 'suspended' || controlData.can_access === false,
          isRestricted: controlData.status === 'restricted' || controlData.access_level === 'limited',
          status: controlData.status,
          canAccess: controlData.can_access,
          accessLevel: controlData.access_level,
          suspensionReason: controlData.suspension_reason,
          email: controlData.email
        }

        console.log('🔍 checkUserStatus: Processed status:', status)

        // If user is suspended, sign them out immediately
        if (status.isSuspended) {
          console.log('🚫 checkUserStatus: User is suspended, signing out...')
          await logout()
          setError('Access denied: Your account is suspended. Please contact admin.')
          return status
        }

        return status
      }

      console.log('🔍 checkUserStatus: No user controls found, user not in system - allowing access')
      // If user is not in controls table, they should have access by default
      return {
        isSuspended: false,
        isRestricted: false,
        status: 'active',
        canAccess: true,
        accessLevel: 'full',
        suspensionReason: null,
        email: user.email
      }
    } catch (err) {
      console.error('❌ Error checking user status:', err)
      // On error, allow access by default to prevent blocking legitimate users
      return {
        isSuspended: false,
        isRestricted: false,
        status: 'active',
        canAccess: true,
        accessLevel: 'full',
        suspensionReason: null,
        email: user?.email || 'unknown'
      }
    }
  }

  const refreshStatus = useCallback(async () => {
    if (!enabled) {
      console.log('🔍 refreshStatus: DISABLED - skipping status check')
      setLoading(false)
      return
    }
    
    const now = Date.now()
    
    // Debounce rapid calls - only allow one check per 5 seconds
    if (now - lastCheckRef.current < 5000) {
      console.log('🔍 refreshStatus: Debounced - too soon since last check')
      return
    }
    
    lastCheckRef.current = now
    
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Debounce the actual call by 500ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          console.log('🔍 refreshStatus: Checking status for user:', user.email)
          const status = await checkUserStatus(user.id)
          setUserStatus(status)
          console.log('🔍 refreshStatus: User status result:', status)
        } else {
          console.log('🔍 refreshStatus: No user found, clearing status')
          setUserStatus(null)
        }
      } catch (error) {
        console.error('❌ Error refreshing user status:', error)
      } finally {
        setLoading(false)
      }
    }, 500)
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      // Do not set up any subscriptions when disabled
      setLoading(false)
      return
    }
    // Check status on mount
    refreshStatus()

    // Set up real-time subscription to user_controls table
    // Only subscribe if we have a user (to prevent unnecessary subscriptions)
    let channel = null
    
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        channel = supabase
          .channel('user_status_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_controls'
            },
            (payload) => {
              console.log('🔍 User status changed:', payload)
              // Only refresh if the change is relevant to current user
              if (payload.new?.email === user.email || payload.old?.email === user.email) {
                refreshStatus()
              }
            }
          )
          .subscribe()
      }
    }
    
    setupSubscription()

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [refreshStatus, enabled])

  return {
    userStatus,
    loading,
    error,
    refreshStatus,
    checkUserStatus
  }
}

