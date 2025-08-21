import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, 
  Calendar, 
  Clock, 
  Heart, 
  Play, 
  Crown, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Zap,
  Gift,
  Settings,
  CreditCard,
  TrendingUp,
  Activity,
  LogOut,
  AlertTriangle
} from 'lucide-react'
import { useSession } from '../../../hooks/useSession'
import { useWatchlist, useContinueWatching } from '../../../hooks/useUserFeatures'
import { cn } from '../../../utils/cn'
import stripeService from '../../../services/stripeService'
import { supabase } from '../../../lib/supabase'

const MySpace = () => {
  const { isAuthed, user, signOut } = useSession()
  const { data: watchlist } = useWatchlist()
  const { data: continueWatching } = useContinueWatching()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isTryingDifferentAccount, setIsTryingDifferentAccount] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const navigate = useNavigate()

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('status, subscription, created_at')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }

        setUserProfile(data)
        console.log('User profile loaded:', data)
      } catch (err) {
        console.error('Error in fetchUserProfile:', err)
      }
    }

    fetchUserProfile()
  }, [user])

  // Debug logging
  console.log('MySpace component loaded:', { isAuthed, user, watchlist, continueWatching, userProfile })

  // Show loading state while fetching user profile
  if (user && !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Show suspended/restricted user message
  // Check for suspended status as soon as we have user data
  if (user && userProfile && userProfile.status === 'suspended') {
    const handleTryDifferentAccount = async () => {
      console.log('🔍 Try Different Account button clicked!');
      console.log('🔍 Current route:', window.location.pathname);
      
      setIsTryingDifferentAccount(true)
      
      try {
        // First, sign out directly from Supabase to clear authentication state immediately
        console.log('🔍 Signing out from Supabase...');
        console.log('🔍 Current auth state before sign out:', { isAuthed, user: !!user });
        
        // Call Supabase signOut directly for immediate effect
        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) {
          console.error('❌ Supabase sign out error:', signOutError)
        } else {
          console.log('🔍 Supabase sign out successful');
        }
        
        // Also call the hook's signOut to update local state
        await signOut()
        console.log('🔍 Hook sign out successful');
        
        // Clear local storage and session data
        try {
          localStorage.removeItem('ott-auth');
          sessionStorage.clear();
          console.log('🔍 Local storage cleared');
        } catch (error) {
          console.log('🔍 Error clearing local storage:', error);
        }
        
        // Wait a moment for the auth state to update
        console.log('🔍 Waiting for auth state to update...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Double-check that we're signed out
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔍 Final auth check - session:', !!session);
        
        // If we still have a session, try to force clear it
        if (session) {
          console.log('🔍 Session still exists, attempting to force clear...');
          try {
            // Force clear the session by removing it from storage
            await supabase.auth.signOut({ scope: 'global' })
            console.log('🔍 Global sign out successful');
          } catch (forceError) {
            console.error('❌ Force sign out error:', forceError);
          }
        }
        
        // Navigate to login page after successful sign out
        console.log('🔍 Navigating to /login...');
        // Add a flag to indicate this is a suspended user trying to sign in again
        sessionStorage.setItem('suspended-user-signin', 'true')
        window.location.href = '/login'
        
      } catch (error) {
        console.error('❌ Error during sign out:', error)
        // Even if sign out fails, try to navigate to login
        console.log('🔍 Attempting navigation despite sign out error...');
        window.location.href = '/login'
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-2xl mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">
            Your account is currently suspended. Please contact the administrator for assistance.
          </p>
          <p className="text-gray-400 mb-6 text-sm">
            You can also try signing in with a different account using the button below.
          </p>
          <button
            onClick={handleTryDifferentAccount}
            disabled={isTryingDifferentAccount}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isTryingDifferentAccount ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing Out...</span>
              </div>
            ) : (
              'Try Different Account'
            )}
          </button>
        </div>
      </div>
    )
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      console.log('🔍 MySpace logout initiated')
      
      // Comprehensive storage cleanup before sign out
      try {
        // Clear custom storage key
        localStorage.removeItem('ott-auth')
        // Clear all Supabase-related storage
        localStorage.removeItem('supabase.auth.token')
        localStorage.removeItem('supabase.auth.expires_at')
        localStorage.removeItem('supabase.auth.refresh_token')
        localStorage.removeItem('supabase.auth.access_token')
        // Clear session storage
        sessionStorage.clear()
        // Clear any other potential auth storage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.includes('ott')) {
            localStorage.removeItem(key)
          }
        })
        console.log('🔍 MySpace storage cleanup completed')
      } catch (storageError) {
        console.warn('Failed to clear storage:', storageError)
      }
      
      await signOut()
      
      // Force clear any remaining Supabase session with multiple approaches
      try {
        console.log('🔍 Force clearing Supabase session...')
        // Try global sign out
        await supabase.auth.signOut({ scope: 'global' })
        // Try local sign out again
        await supabase.auth.signOut()
        console.log('🔍 Force sign out completed')
      } catch (forceError) {
        console.warn('Force sign out failed:', forceError)
      }
      
      // Final storage cleanup after sign out
      try {
        localStorage.removeItem('ott-auth')
        sessionStorage.clear()
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.includes('ott')) {
            localStorage.removeItem(key)
          }
        })
        console.log('🔍 Final cleanup completed')
      } catch (finalCleanupError) {
        console.warn('Final cleanup failed:', finalCleanupError)
      }
      
      // Force page reload to clear any remaining state
      console.log('🔍 Force reloading page...')
      window.location.reload()
      
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
      // Even if logout fails, try to force reload
      console.log('🔍 Attempting force reload despite error...')
      window.location.reload()
    }
  }

  // Real subscription data from database
  const subscription = {
    status: userProfile?.subscription || 'basic',
    nextBilling: '2025-09-18',
    planName: userProfile?.subscription === 'premium' ? 'Premium Plan' : 'Basic Plan'
  }

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '9.99',
      period: 'month',
      features: [
        'HD Streaming',
        '2 Devices',
        'Basic Support',
        'Ad-Free Experience'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '19.99',
      period: 'month',
      features: [
        '4K Ultra HD',
        '4 Devices',
        'Priority Support',
        'Exclusive Content',
        'Offline Downloads'
      ],
      popular: true
    }
  ]

  const handleSubscribe = async (planId) => {
    if (!isAuthed) {
      // Redirect to login
      window.location.href = '/login'
      return
    }
    
    setIsLoading(true)
    setSelectedPlan(planId)
    
    try {
      const sessionId = await stripeService.createCheckoutSession(planId, user?.id)
      await stripeService.redirectToCheckout(sessionId)
    } catch (error) {
      console.error('Subscription error:', error)
      setIsLoading(false)
      setSelectedPlan(null)
      // Fallback to mock subscription for demo purposes
      setTimeout(() => {
        alert('Demo: Subscription would be processed through Stripe in production!')
        setIsLoading(false)
        setSelectedPlan(null)
      }, 2000)
    }
  }

  const handleManageSubscription = async () => {
    try {
      await stripeService.redirectToCustomerPortal(user?.id)
    } catch (error) {
      console.error('Error redirecting to customer portal:', error)
      alert('Customer portal coming soon! For now, contact support to manage your subscription.')
    }
  }

  const stats = [
    {
      label: 'Member Since',
      value: '16 Aug 2025',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      label: 'Last Active',
      value: 'Today',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    }
  ]

  if (!isAuthed) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Welcome to My Space
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Sign in to access your personalized dashboard and manage your subscription
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-red-600 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-500/25"
          >
            Sign In to Continue
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-slate-100 ml-20">
      {/* Header */}
      <div className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-600/50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">My Space</h1>
                <p className="text-slate-300">Welcome back, {user?.name || 'User'}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/help-settings')}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Help & Settings
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging Out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/30 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Profile</h3>
                <p className="text-sm text-slate-300">Account information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Name</label>
                <p className="text-slate-100 font-medium">{user?.name || 'User'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Member Since</label>
                <p className="text-slate-100">August 16, 2025</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-100 capitalize">{userProfile?.status || 'Active'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/30 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Subscription</h3>
                <p className="text-sm text-slate-300">Current plan details</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Plan</label>
                <p className="text-slate-100 font-medium">{subscription.planName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Price</label>
                <p className="text-slate-100">$9.99/month</p>
              </div>
              <button
                onClick={handleManageSubscription}
                className="w-full bg-slate-600 hover:bg-slate-500 text-slate-100 px-3 py-2 rounded-lg font-medium transition-colors"
              >
                Manage Subscription
              </button>
            </div>
          </motion.div>

          {/* Activity Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/30 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Activity</h3>
                <p className="text-sm text-slate-300">Your viewing stats</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Last Active</label>
                <p className="text-slate-100 font-medium">Today</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Watchlist Items</label>
                <p className="text-slate-100">{watchlist?.length || 0} titles</p>
              </div>
              <button className="w-full bg-slate-600 hover:bg-slate-500 text-slate-100 px-3 py-2 rounded-lg font-medium transition-colors">
                View History
              </button>
            </div>
          </motion.div>
        </div>

        {/* Upgrade Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-8 text-white mb-8"
        >
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
            <p className="text-red-100 mb-6">Unlock 4K streaming, exclusive content, and more with our Premium plan.</p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleSubscribe('premium')}
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Upgrade Now - $19.99/month
              </button>
              <button className="border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <button className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/30 p-6 text-left hover:shadow-2xl hover:border-slate-500/50 transition-all">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-1">My Watchlist</h3>
            <p className="text-sm text-slate-300">View saved content</p>
          </button>

          <button className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/30 p-6 text-left hover:shadow-2xl hover:border-slate-500/50 transition-all">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
              <Play className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-1">Continue Watching</h3>
            <p className="text-sm text-slate-300">Resume from where you left</p>
          </button>

          <button className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/30 p-6 text-left hover:shadow-2xl hover:border-slate-500/50 transition-all">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-1">Recommendations</h3>
            <p className="text-sm text-slate-300">Discover new content</p>
          </button>

          <button className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/30 p-6 text-left hover:shadow-2xl hover:border-slate-500/50 transition-all">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
              <Gift className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-1">Rewards</h3>
            <p className="text-sm text-slate-300">Check your points</p>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default MySpace
