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
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-4">
          {/* Logout Button - Top Right */}
          <div className="absolute top-4 right-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-red-600 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-500/25 flex items-center gap-2"
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
            </motion.button>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-3 shadow-lg shadow-red-500/25">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              My Space
            </h1>
            <p className="text-base text-gray-300 max-w-2xl mx-auto">
              Welcome back, {user?.name || 'User'}! Manage your profile and upgrade your experience.
            </p>
            
            {/* User Status Display */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  userProfile?.status === 'suspended' ? 'bg-red-500' : 
                  userProfile?.status === 'restricted' ? 'bg-yellow-500' : 'bg-green-500'
                )}></div>
                <span className="text-sm text-gray-300">
                  Status: {userProfile?.status === 'suspended' ? 'Suspended' : 
                          userProfile?.status === 'restricted' ? 'Restricted' : 'Active'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-300">Plan: {subscription.planName}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-4 h-[calc(100vh-200px)] overflow-hidden">
        {/* Stats Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-lg mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className={cn(
                "bg-gray-800/50 backdrop-blur-sm border rounded-lg p-3 text-center",
                stat.borderColor
              )}
            >
              <div className={cn("w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center", stat.bgColor)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className="text-lg font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Profile Information */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Profile Information</h3>
                <p className="text-gray-400 text-xs">Your account details</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500/20 rounded-md flex items-center justify-center">
                  <User className="w-2.5 h-2.5 text-red-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Name</div>
                  <div className="text-white font-medium text-xs">{user?.name || 'User'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500/20 rounded-md flex items-center justify-center">
                  <Shield className="w-2.5 h-2.5 text-red-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">User ID</div>
                  <div className="text-white font-medium font-mono text-xs">{user?.id?.slice(0, 8)}...</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500/20 rounded-md flex items-center justify-center">
                  <Calendar className="w-2.5 h-2.5 text-red-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Member Since</div>
                  <div className="text-white font-medium text-xs">16/08/2025</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Current Plan */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Current Plan</h3>
                <p className="text-gray-400 text-xs">Manage your subscription</p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/30 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{subscription.planName}</div>
                    <div className="text-gray-400 text-xs">Active Subscription</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-white">$9.99</div>
                  <div className="text-gray-400 text-xs">per month</div>
                </div>
              </div>
              
              <button
                onClick={handleManageSubscription}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-xs"
              >
                <Settings className="w-3 h-3" />
                <span>Manage</span>
              </button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
          >
            <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-red-400" />
              <span>Quick Actions</span>
            </h3>
            <div className="space-y-2">
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-xs">
                <TrendingUp className="w-3 h-3 text-red-400" />
                <span>View History</span>
              </button>
              <div className="text-xs text-gray-400 text-center">
                Your account is active with all features enabled
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subscription Plans Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="h-[calc(100%-400px)] overflow-hidden"
        >
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-1">Upgrade Your Plan</h3>
            <p className="text-gray-400 text-sm">Unlock premium features and unlimited entertainment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto h-full">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "relative bg-gray-800/50 backdrop-blur-sm border-2 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between",
                  selectedPlan === plan.id
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-600 hover:border-red-500/30"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-3">
                  <h4 className="text-lg font-semibold text-white mb-1">{plan.name}</h4>
                  <div className="mb-2">
                    <span className="text-xl font-bold text-red-400">${plan.price}</span>
                    <span className="text-gray-400 text-sm">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-3 flex-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading || subscription.status === plan.id}
                  className={cn(
                    "w-full py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm",
                    subscription.status === plan.id
                      ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                      : selectedPlan === plan.id
                      ? "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800"
                      : "bg-gray-600 text-white hover:bg-gray-500 border border-gray-500"
                  )}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : subscription.status === plan.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>Current Plan</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Subscribe Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Payment Security Notice */}
          <div className="mt-4 max-w-2xl mx-auto">
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white text-sm mb-1">Secure Payment</h4>
                  <p className="text-xs text-gray-400">
                    All payments are processed securely through Stripe. Your payment information is never stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MySpace
