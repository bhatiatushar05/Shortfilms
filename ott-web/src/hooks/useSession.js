import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import userService from '../services/userService'

export const useSession = () => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userStatus, setUserStatus] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (initialSession?.user) {
          setSession(initialSession)
          setUser(initialSession.user)
          setIsAuthed(true)
          setUserStatus({ canAccess: true, status: 'active' })
          
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
          setSession(session)
          setUser(session.user)
          setIsAuthed(true)
          setUserStatus({ canAccess: true, status: 'active' })
          
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

  const refresh = async () => {
    try {
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
      
      if (refreshedSession?.user) {
        setSession(refreshedSession)
        setUser(refreshedSession.user)
        setIsAuthed(true)
        setUserStatus({ canAccess: true, status: 'active' })
        
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
