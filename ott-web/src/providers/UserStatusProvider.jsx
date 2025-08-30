import React, { createContext, useContext, useEffect } from 'react'
import { useUserStatus } from '../hooks/useUserStatus'
import { useAuth } from '../hooks/useAuth'

const UserStatusContext = createContext()

export const useUserStatusContext = () => {
  const context = useContext(UserStatusContext)
  if (!context) {
    throw new Error('useUserStatusContext must be used within a UserStatusProvider')
  }
  return context
}

export const UserStatusProvider = ({ children }) => {
  const { userStatus, loading, error, refreshStatus } = useUserStatus()
  const { logout } = useAuth()

  useEffect(() => {
    // Check user status every 30 seconds
    const interval = setInterval(() => {
      refreshStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshStatus])

  useEffect(() => {
    // If user is suspended, sign them out
    if (userStatus?.isSuspended) {
      console.log('User suspended, signing out...')
      logout()
    }
  }, [userStatus, logout])

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

