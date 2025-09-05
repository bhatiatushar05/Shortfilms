import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useUserStatus } from '../hooks/useUserStatus'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const UserStatusContext = createContext()

export const useUserStatusContext = () => {
  const context = useContext(UserStatusContext)
  if (!context) {
    throw new Error('useUserStatusContext must be used within a UserStatusProvider')
  }
  return context
}

export const UserStatusProvider = ({ children }) => {
  const { logout } = useAuth()
  const location = useLocation()
  const intervalRef = useRef(null)
  const lastCheckRef = useRef(0)

  // Check if we're on login/signup pages
  const path = location.pathname || ''
  const isAuthPage = path.startsWith('/login') || path.startsWith('/signup')

  // COMPLETELY DISABLE status checking on auth pages
  const { userStatus, loading, error, refreshStatus } = useUserStatus({ enabled: false })

  // Only run status checks when NOT on auth pages
  useEffect(() => {
    if (isAuthPage) {
      console.log('🔍 UserStatusProvider: Skipping status checks on auth page')
      return
    }

    console.log('🔍 UserStatusProvider: Initial status check...')
    refreshStatus()
  }, [isAuthPage, refreshStatus])

  useEffect(() => {
    if (isAuthPage) return

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Only set up periodic checking if user is authenticated
    if (userStatus) {
      console.log('🔍 UserStatusProvider: Setting up periodic status checks...')
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        if (now - lastCheckRef.current > 30000) {
          console.log('🔍 UserStatusProvider: Periodic status check...')
          lastCheckRef.current = now
          refreshStatus()
        }
      }, 30000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [refreshStatus, isAuthPage, userStatus])

  useEffect(() => {
    if (isAuthPage) return

    // If user is suspended, sign them out immediately
    if (userStatus?.isSuspended) {
      console.log('🚫 UserStatusProvider: User is suspended, signing out...')
      const forceLogout = async () => {
        try {
          await logout()
          await supabase.auth.signOut()
          localStorage.clear()
          sessionStorage.clear()
        } catch (error) {
          console.error('❌ Force logout error:', error)
        } finally {
          if (location.pathname !== '/login') {
            window.history.pushState({}, '', '/login')
            window.dispatchEvent(new PopStateEvent('popstate'))
          }
        }
      }
      forceLogout()
    }
  }, [userStatus, logout, location.pathname, isAuthPage])

  const value = {
    userStatus,
    loading,
    error,
    refreshStatus
  }

  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  )
}

