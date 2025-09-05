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
        console.log('🔍 useSession: Getting initial session...')
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        console.log('🔍 useSession: Initial session result:', { 
          hasSession: !!initialSession, 
          hasUser: !!initialSession?.user,
          userEmail: initialSession?.user?.email 
        })
        
        if (initialSession?.user) {
          console.log('🔍 useSession: Setting authenticated state')
          setSession(initialSession)
          setUser(initialSession.user)
          setIsAuthed(true)
          setUserStatus({ canAccess: true, status: 'active' })
          
          // Set user in UserService
          userService.setUser(initialSession.user)
        } else {
          console.log('🔍 useSession: No session found, setting unauthenticated state')
          setSession(null)
          setUser(null)
          setIsAuthed(false)
          setUserStatus(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ useSession: Error getting initial session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 useSession: Auth state change:', { event, hasSession: !!session, hasUser: !!session?.user, userEmail: session?.user?.email })
        
        if (session?.user) {
          console.log('🔍 useSession: Setting authenticated state from auth change')
          setSession(session)
          setUser(session.user)
          setIsAuthed(true)
          setUserStatus({ canAccess: true, status: 'active' })
          
          // Update user in UserService
          userService.setUser(session.user)
        } else {
          console.log('🔍 useSession: Setting unauthenticated state from auth change')
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
