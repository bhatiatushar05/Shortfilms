import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import userService from '../services/userService'

export const useSession = () => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userStatus, setUserStatus] = useState(null)

  // Check user access status (simplified version)
  const checkUserAccess = async (userId) => {
    try {
      const { data: controlData, error: controlError } = await supabase
        .from('user_controls')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (controlError && controlError.code !== 'PGRST116') {
        console.error('Error checking user controls:', controlError)
        return { canAccess: true, status: 'active' }
      }

      if (controlData) {
        const canAccess = controlData.can_access !== false
        const status = controlData.status || 'active'
        return { canAccess, status }
      }

      return { canAccess: true, status: 'active' }
    } catch (error) {
      console.error('Error in checkUserAccess:', error)
      return { canAccess: true, status: 'active' }
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (initialSession?.user) {
          // Check user access
          const { canAccess, status } = await checkUserAccess(initialSession.user.id)
          
          if (!canAccess) {
            // User is suspended/restricted, sign them out
            console.log('User access revoked, signing out...')
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
            setIsAuthed(false)
            setUserStatus(null)
            setLoading(false)
            return
          }
          
          setUserStatus({ canAccess, status })
          setSession(initialSession)
          setUser(initialSession.user)
          setIsAuthed(true)
          
          // Set user in UserService
          userService.setUser(initialSession.user)
        } else {
          setSession(null)
          setUser(null)
          setIsAuthed(false)
          setUserStatus(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Check user access
          const { canAccess, status } = await checkUserAccess(session.user.id)
          
          if (!canAccess) {
            // User is suspended/restricted, sign them out
            console.log('User access revoked, signing out...')
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
            setIsAuthed(false)
            setUserStatus(null)
            setLoading(false)
            return
          }
          
          setUserStatus({ canAccess, status })
          setSession(session)
          setUser(session.user)
          setIsAuthed(true)
          
          // Update user in UserService
          userService.setUser(session.user)
        } else {
          setSession(null)
          setUser(null)
          setIsAuthed(false)
          setUserStatus(null)
          userService.setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Periodic check for user access (every 60 seconds - less frequent)
  useEffect(() => {
    if (!isAuthed || !user) return

    const checkAccess = async () => {
      try {
        const { canAccess, status } = await checkUserAccess(user.id)
        
        if (!canAccess) {
          console.log('User access revoked during session, signing out...')
          await supabase.auth.signOut()
          setSession(null)
          setUser(null)
          setIsAuthed(false)
          setUserStatus(null)
          userService.setUser(null)
          
          // Show alert to user
          alert(`Access Denied: Your account is ${status}. Please contact admin.`)
          
          // Redirect to home page
          window.location.href = '/'
        }
      } catch (error) {
        console.error('Error in periodic access check:', error)
      }
    }

    const interval = setInterval(checkAccess, 60000) // Check every 60 seconds
    return () => clearInterval(interval)
  }, [isAuthed, user])

  const refresh = async () => {
    try {
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
      
      if (refreshedSession?.user) {
        // Check user access
        const { canAccess, status } = await checkUserAccess(refreshedSession.user.id)
        
        if (!canAccess) {
          // User is suspended/restricted, sign them out
          await supabase.auth.signOut()
          setSession(null)
          setUser(null)
          setIsAuthed(false)
          setUserStatus(null)
          userService.setUser(null)
          return null
        }
        
        setUserStatus({ canAccess, status })
        setSession(refreshedSession)
        setUser(refreshedSession.user)
        setIsAuthed(true)
        
        // Update user in UserService
        userService.setUser(refreshedSession.user)
      } else {
        setSession(null)
        setUser(null)
        setIsAuthed(false)
        setUserStatus(null)
        userService.setUser(null)
      }
      
      return refreshedSession
    } catch (error) {
      console.error('Error refreshing session:', error)
      return null
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state
      setSession(null)
      setUser(null)
      setIsAuthed(false)
      setUserStatus(null)
      
      // Clear user from UserService
      userService.setUser(null)
      
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    session,
    user,
    isAuthed,
    loading,
    userStatus,
    refresh,
    signOut,
  }
}
