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
import { useUserProfile } from '../../../hooks/useUserProfile'
import { cn } from '../../../utils/cn'
import stripeService from '../../../services/stripeService'
import { supabase } from '../../../lib/supabase'

const MySpace = () => {
  const { isAuthed, user, signOut } = useSession()
  const { data: watchlist } = useWatchlist()
  const { data: continueWatching } = useContinueWatching()
  const { profile: userProfileData } = useUserProfile()
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
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-stone-300">Loading your profile...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-800 rounded-2xl mb-4 shadow-lg border border-red-700/30">
            <AlertTriangle className="w-8 h-8 text-stone-100" />
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-stone-300 mb-6">
            Your account is currently suspended. Please contact the administrator for assistance.
          </p>
          <p className="text-stone-400 mb-6 text-sm">
            You can also try signing in with a different account using the button below.
          </p>
          <button
            onClick={handleTryDifferentAccount}
            disabled={isTryingDifferentAccount}
            className="bg-stone-700 hover:bg-stone-600 disabled:bg-stone-800 disabled:cursor-not-allowed text-stone-100 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg border border-stone-600/30"
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
      <div className="h-screen bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-800 text-stone-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-red-800 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg border border-red-700/30"
          >
            <User className="w-10 h-10 text-stone-100" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-3 text-stone-100">
            Welcome to My Space
          </h1>
          <p className="text-lg text-stone-300 mb-6">
            Sign in to access your personalized dashboard and manage your subscription
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-800 hover:bg-red-700 text-stone-100 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg border border-red-700/30"
          >
            Sign In to Continue
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-neutral-900 to-stone-800 text-stone-100 ml-20">
      {/* Header */}
      <div className="bg-stone-900/90 backdrop-blur-sm border-b border-stone-700/30 shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Profile Avatar */}
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-red-700/30">
                {userProfileData?.avatar_image ? (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-br ${userProfileData.avatar_gradient || 'from-red-800 to-red-900'}`} />
                    <img
                      src={userProfileData.avatar_image}
                      alt="Profile"
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center">
                    <User className="w-6 h-6 text-stone-100" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-100">My Space</h1>
                <p className="text-stone-300">
                  Welcome back, {userProfileData?.display_name || user?.name || 'User'}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/help-settings')}
                className="bg-stone-700 hover:bg-stone-600 text-stone-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg border border-stone-600/30"
              >
                <Settings className="w-4 h-4" />
                Help & Settings
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-800 hover:bg-red-700 text-stone-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg border border-red-700/30"
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
      <div className="max-w-6xl mx-auto px-6 py-4">
        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Profile Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-stone-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-stone-600/30 p-5 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-800/30 rounded-lg flex items-center justify-center border border-red-700/30">
                <User className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-100">Profile</h3>
                <p className="text-xs text-stone-400">Account information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Name</label>
                <p className="text-stone-100 font-medium mt-1">{userProfileData?.display_name || user?.name || 'User'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Member Since</label>
                <p className="text-stone-100 mt-1 text-sm">August 16, 2025</p>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-stone-100 capitalize text-sm">{userProfile?.status || 'Active'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-stone-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-stone-600/30 p-5 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-800/30 rounded-lg flex items-center justify-center border border-red-700/30">
                <Crown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-100">Subscription</h3>
                <p className="text-xs text-stone-400">Current plan details</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Plan</label>
                <p className="text-stone-100 font-medium mt-1">{subscription.planName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Price</label>
                <p className="text-stone-100 mt-1 text-sm">$9.99/month</p>
              </div>
              <button
                onClick={handleManageSubscription}
                className="w-full bg-red-800 hover:bg-red-700 text-stone-100 px-3 py-2 rounded-lg font-medium transition-colors shadow-lg border border-red-700/30 mt-3 text-sm"
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
            className="bg-stone-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-stone-600/30 p-5 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-800/30 rounded-lg flex items-center justify-center border border-red-700/30">
                <Activity className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-100">Activity</h3>
                <p className="text-xs text-stone-400">Your viewing stats</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Last Active</label>
                <p className="text-stone-100 font-medium mt-1">Today</p>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Watchlist Items</label>
                <p className="text-stone-100 mt-1 text-sm">{watchlist?.length || 0} titles</p>
              </div>
              <button className="w-full bg-stone-700 hover:bg-stone-600 text-stone-100 px-3 py-2 rounded-lg font-medium transition-colors shadow-lg border border-stone-600/30 mt-3 text-sm">
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
          className="bg-gradient-to-r from-red-800 to-red-900 rounded-xl p-6 text-stone-100 mb-5 shadow-xl border border-red-700/30"
        >
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold mb-2 text-stone-100">Upgrade to Premium</h2>
            <p className="text-stone-200 mb-4 leading-relaxed">Unlock 4K streaming, exclusive content, and more with our Premium plan.</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSubscribe('premium')}
                className="bg-stone-100 text-red-800 px-6 py-2 rounded-lg font-semibold hover:bg-stone-200 transition-colors shadow-lg"
              >
                Upgrade Now - $19.99/month
              </button>
              <button className="border border-stone-200/30 text-stone-100 px-6 py-2 rounded-lg font-semibold hover:bg-stone-100/10 transition-colors">
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
          <button className="bg-stone-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-stone-600/30 p-5 text-left hover:shadow-2xl hover:border-red-700/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 bg-red-800/30 rounded-lg flex items-center justify-center mb-4 border border-red-700/30">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-semibold text-stone-100 mb-1">My Watchlist</h3>
            <p className="text-xs text-stone-400">View saved content</p>
          </button>

          <button className="bg-stone-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-stone-600/30 p-5 text-left hover:shadow-2xl hover:border-red-700/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 bg-red-800/30 rounded-lg flex items-center justify-center mb-4 border border-red-700/30">
              <Play className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-semibold text-stone-100 mb-1">Continue Watching</h3>
            <p className="text-xs text-stone-400">Resume from where you left</p>
          </button>

          <button className="bg-stone-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-stone-600/30 p-5 text-left hover:shadow-2xl hover:border-red-700/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 bg-red-800/30 rounded-lg flex items-center justify-center mb-4 border border-red-700/30">
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-semibold text-stone-100 mb-1">Recommendations</h3>
            <p className="text-xs text-stone-400">Discover new content</p>
          </button>

          <button className="bg-stone-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-stone-600/30 p-5 text-left hover:shadow-2xl hover:border-red-700/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-10 h-10 bg-red-800/30 rounded-lg flex items-center justify-center mb-4 border border-red-700/30">
              <Gift className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-semibold text-stone-100 mb-1">Rewards</h3>
            <p className="text-xs text-stone-400">Check your points</p>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default MySpace
