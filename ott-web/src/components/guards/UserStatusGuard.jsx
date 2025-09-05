import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const UserStatusGuard = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          setIsChecking(false)
          return
        }

        console.log('🔍 UserStatusGuard: Checking status for user:', session.user.email)

        // Check user_controls table (the correct table with status)
        const { data: controlData, error: controlError } = await supabase
          .from('user_controls')
          .select('status, can_access, suspension_reason')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (controlError && controlError.code !== 'PGRST116') {
          console.error('❌ Error checking user controls in guard:', controlError)
        }

        // Determine if user should be blocked
        let shouldBlock = false
        let blockReason = ''

        if (controlData && (controlData.status === 'suspended' || controlData.can_access === false)) {
          shouldBlock = true
          blockReason = `User controls: ${controlData.status}`
        }

        console.log('🔍 UserStatusGuard: Status check result:', {
          controlStatus: controlData?.status,
          canAccess: controlData?.can_access,
          shouldBlock,
          blockReason
        })

        if (shouldBlock) {
          console.log('🚫 UserStatusGuard: User is suspended - logging out')
          setIsBlocked(true)
          
          // Sign out the user
          await logout()
          
          // Redirect to login with suspension message
          navigate('/login', { 
            state: { 
              suspended: true, 
              reason: blockReason,
              email: session.user.email 
            },
            replace: true 
          })
          
          return
        }

        setIsChecking(false)
        
      } catch (error) {
        console.error('❌ Error in UserStatusGuard:', error)
        setIsChecking(false)
      }
    }

    // Check status every time location changes
    checkUserStatus()
  }, [location.pathname, logout, navigate])

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-white">Checking account status...</p>
        </div>
      </div>
    )
  }

  // Show blocked message if user is suspended
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-white text-lg mb-6">
            Your account has been suspended. You cannot access the platform.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default UserStatusGuard
