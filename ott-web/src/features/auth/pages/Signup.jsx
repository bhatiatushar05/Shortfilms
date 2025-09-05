import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Play, CheckCircle } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { useSession } from '../../../hooks/useSession'
import ProfileCreation from '../../../components/profile/ProfileCreation'
import { supabase } from '../../../lib/supabase'

const Signup = () => {
  const [currentStep, setCurrentStep] = useState('account') // 'account', 'profile', 'success'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [profileData, setProfileData] = useState({
    displayName: '',
    avatar: null
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { signup, loading: authLoading, error, clearError } = useAuth()
  const { isAuthed } = useSession()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthed) {
      navigate('/', { replace: true })
    }
  }, [isAuthed, navigate])

  const handleAccountSubmit = async (e) => {
    e.preventDefault()
    clearError()

    if (formData.password !== formData.confirmPassword) {
      return // Error will be shown
    }

    // Disable button and show loading
    setIsLoading(true)
    
    try {
      console.log('Signup: Starting account creation...')
      const success = await signup(formData.email, formData.password)
      console.log('Signup: Account creation result:', success)
      
      if (success) {
        // Wait for user session to be established
        console.log('Signup: Waiting for user session...')
        
        // Try multiple approaches to get the user session
        let attempts = 0
        const maxAttempts = 8
        
        const checkUserSession = async () => {
          attempts++
          console.log(`Signup: User check attempt ${attempts}...`)
          
          try {
            // Method 1: Try to get current user
            let { data: { user } } = await supabase.auth.getUser()
            console.log(`Signup: Method 1 - getUser():`, user)
            
            // Method 2: If no user, try to get session
            if (!user) {
              const { data: { session } } = await supabase.auth.getSession()
              console.log(`Signup: Method 2 - getSession():`, session)
              user = session?.user || null
            }
            
            // Method 3: If still no user, try to refresh session
            if (!user) {
              const { data: { session } } = await supabase.auth.refreshSession()
              console.log(`Signup: Method 3 - refreshSession():`, session)
              user = session?.user || null
            }
            
            if (user) {
              console.log('Signup: User authenticated, moving to profile step')
              setCurrentStep('profile')
              setProfileData(prev => ({ ...prev, displayName: formData.name }))
              setIsLoading(false)
              return
            }
            
            // If still no user, wait and retry
            if (attempts < maxAttempts) {
              const delay = Math.min(attempts * 1000, 5000) // 1s, 2s, 3s, 4s, 5s, 5s, 5s, 5s
              console.log(`Signup: User not ready, retrying in ${delay}ms...`)
              setTimeout(checkUserSession, delay)
            } else {
              console.log('Signup: Max attempts reached, trying alternative approach...')
              
              // Final attempt: Try to sign in with the credentials
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
              })
              
              if (signInData?.user) {
                console.log('Signup: Alternative signin successful, moving to profile step')
                setCurrentStep('profile')
                setProfileData(prev => ({ ...prev, displayName: formData.name }))
                setIsLoading(false)
              } else {
                console.log('Signup: Alternative signin failed:', signInError)
                setIsLoading(false)
                alert('Account created successfully! Please sign in to continue.')
                // Redirect to login page
                navigate('/login', { 
                  state: { 
                    message: 'Account created successfully! Please sign in with your credentials.',
                    email: formData.email 
                  }
                })
              }
            }
          } catch (error) {
            console.error(`Signup: Error in attempt ${attempts}:`, error)
            if (attempts < maxAttempts) {
              const delay = Math.min(attempts * 1000, 5000)
              setTimeout(checkUserSession, delay)
            } else {
              setIsLoading(false)
              alert('Account created but session not ready. Please try signing in.')
            }
          }
        }
        
        // Start checking after initial delay
        setTimeout(checkUserSession, 1000)
      }
    } catch (error) {
      console.error('Signup error:', error)
      setIsLoading(false)
      
      // Handle specific error types
      if (error?.message?.includes('429') || error?.message?.includes('Too Many Requests')) {
        alert('Rate limit exceeded. Please wait a minute before trying again.')
      } else if (error?.message?.includes('already registered')) {
        alert('This email is already registered. Please sign in instead.')
      } else if (error?.message?.includes('Invalid email')) {
        alert('Please enter a valid email address.')
      } else if (error?.message?.includes('Password')) {
        alert('Password must be at least 6 characters long.')
      } else {
        alert(`Signup failed: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const handleProfileComplete = async (profile) => {
    console.log('Signup: handleProfileComplete called with:', profile)
    setIsCreatingProfile(true)
    
    try {
      // Get current user with retry logic and multiple methods
      let user = null
      let attempts = 0
      const maxAttempts = 5
      
      while (!user && attempts < maxAttempts) {
        attempts++
        console.log(`Signup: Getting current user (attempt ${attempts})...`)
        
        try {
          // Method 1: getCurrentUser
          let { data: { user: currentUser } } = await supabase.auth.getUser()
          if (currentUser) {
            user = currentUser
            console.log(`Signup: User found via getUser() (attempt ${attempts}):`, user)
            break
          }
          
          // Method 2: getSession
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            user = session.user
            console.log(`Signup: User found via getSession() (attempt ${attempts}):`, user)
            break
          }
          
          // Method 3: refreshSession
          const { data: { refreshData } } = await supabase.auth.refreshSession()
          if (refreshData?.user) {
            user = refreshData.user
            console.log(`Signup: User found via refreshSession() (attempt ${attempts}):`, user)
            break
          }
          
          console.log(`Signup: No user found in attempt ${attempts}`)
          
          if (attempts < maxAttempts) {
            const delay = Math.min(attempts * 1000, 3000)
            console.log(`Signup: User not ready, waiting ${delay}ms before retry...`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        } catch (error) {
          console.error(`Signup: Error in attempt ${attempts}:`, error)
          if (attempts < maxAttempts) {
            const delay = Math.min(attempts * 1000, 3000)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }
      
      if (user) {
        console.log('Signup: User found, saving profile...')
        
        // Use UPSERT to handle existing profiles in user_controls table
        const { error } = await supabase
          .from('user_controls')
          .upsert({
            email: user.email,
            status: 'active',
            can_access: true,
            access_level: 'full',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'email' // This tells Supabase to UPDATE if email exists
          })

        if (error) {
          console.error('Error saving profile:', error)
          
          // Handle specific profile errors
          if (error.message.includes('duplicate key')) {
            alert('Profile already exists. Updating...')
            // Try to update instead
            const { error: updateError } = await supabase
              .from('user_controls')
              .update({
                status: 'active',
                can_access: true,
                access_level: 'full',
                updated_at: new Date().toISOString()
              })
              .eq('email', user.email)
            
            if (updateError) {
              alert('Error updating profile: ' + updateError.message)
              return
            }
          } else {
            alert('Error saving profile: ' + error.message)
            return
          }
        }
        
        console.log('Profile saved successfully!')
        console.log('Moving to success step...')
        
        // Complete the signup process
        setCurrentStep('success')
        setSignupSuccess(true)
        setIsCreatingProfile(false)
        
        console.log('Success step set, will redirect in 3 seconds...')
        
        // Auto-redirect after a short delay
        setTimeout(() => {
          console.log('Redirecting to OTT app...')
          navigate('/', { replace: true })
        }, 3000)
        
      } else {
        console.log('Signup: No user found after all attempts!')
        setIsCreatingProfile(false)
        
        // Try one final signin attempt
        console.log('Signup: Trying final signin attempt...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        
        if (signInData?.user) {
          console.log('Signup: Final signin successful, retrying profile creation...')
          // Retry the profile creation with the authenticated user
          const { error } = await supabase
            .from('user_controls')
            .upsert({
              email: signInData.user.email,
              status: 'active',
              can_access: true,
              access_level: 'full',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'email'
            })

          if (error) {
            console.error('Error saving profile after signin:', error)
            alert('Profile creation failed. Please try again.')
            return
          }
          
          console.log('Profile saved successfully after signin!')
          setCurrentStep('success')
          setSignupSuccess(true)
          setIsCreatingProfile(false)
          
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 3000)
        } else {
          console.log('Signup: Final signin failed:', signInError)
                  // Try one final signin attempt
        console.log('Signup: Trying final signin attempt...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        
        if (signInData?.user) {
          console.log('Signup: Final signin successful, retrying profile creation...')
          // Retry the profile creation with the authenticated user
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: signInData.user.id,
              display_name: profile.displayName,
              avatar_id: profile.avatar.id,
              avatar_image: profile.avatar.image,
              avatar_gradient: profile.avatar.gradient,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            })

          if (error) {
            console.error('Error saving profile after signin:', error)
            alert('Profile creation failed. Please try again.')
            return
          }
          
          console.log('Profile saved successfully after signin!')
          setCurrentStep('success')
          setSignupSuccess(true)
          setIsCreatingProfile(false)
          
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 3000)
        } else {
          console.log('Signup: Final signin failed:', signInError)
          alert('Authentication failed. Please try signing up again from the beginning.')
          setCurrentStep('account')
        }
        }
      }
      
    } catch (error) {
      console.error('Error creating profile:', error)
      setIsCreatingProfile(false)
      
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        alert('Rate limit exceeded. Please wait a minute before trying again.')
      } else {
        alert('Error creating profile: ' + error.message)
      }
    }
  }

  // Profile creation step
  if (currentStep === 'profile') {
    console.log('Signup: Rendering ProfileCreation step')
    console.log('Signup: profileData:', profileData)
    console.log('Signup: isCreatingProfile:', isCreatingProfile)
    
    // Check if user is authenticated before showing profile creation
    useEffect(() => {
      const checkUserSession = async () => {
        console.log('Signup: Profile step - Checking user session...')
        
        // Try multiple methods to get user
        let user = null
        
        // Method 1: getCurrentUser
        let { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
          user = currentUser
          console.log('Signup: Profile step - User found via getUser():', user)
        }
        
        // Method 2: getSession
        if (!user) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            user = session.user
            console.log('Signup: Profile step - User found via getSession():', user)
          }
        }
        
        // Method 3: refreshSession
        if (!user) {
          const { data: { session } } = await supabase.auth.refreshSession()
          if (session?.user) {
            user = session.user
            console.log('Signup: Profile step - User found via refreshSession():', user)
          }
        }
        
        if (!user) {
          console.log('Signup: No user in profile step, going back to account')
          setCurrentStep('account')
          alert('Please complete account creation first.')
        } else {
          console.log('Signup: Profile step - User authenticated:', user)
        }
      }
      
      checkUserSession()
    }, [])
    
    return (
      <ProfileCreation
        onComplete={handleProfileComplete}
        onBack={() => setCurrentStep('account')}
        initialData={profileData}
        loading={isCreatingProfile}
      />
    )
  }

  // Success step
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Profile Created Successfully!</h2>
            
            {profileData.avatar && (
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-3 border-primary-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${profileData.avatar.gradient}`} />
                  <img
                    src={profileData.avatar.image}
                    alt={profileData.avatar.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}
            
            <p className="text-gray-300 mb-6">
              Welcome <strong>{profileData.displayName}</strong>! We've sent a confirmation email to <strong>{formData.email}</strong>
            </p>
            
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
              <p className="text-green-300 text-sm">
                <strong>Profile Created Successfully!</strong>
              </p>
              <ol className="text-green-200 text-sm mt-2 space-y-1">
                <li>1. Your profile is ready</li>
                <li>2. You'll be redirected to the OTT app</li>
                <li>3. Start watching your favorite content!</li>
              </ol>
            </div>
            
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Go to OTT App
            </button>
            
            <p className="text-gray-400 text-sm mt-4">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSignupSuccess(false)}
                className="text-primary-400 hover:text-primary-300"
              >
                try signing up again
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ShortCinema</h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700"
        >
          <form onSubmit={handleAccountSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white transition-colors duration-200 disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isCreatingProfile ? 'Creating profile...' : 'Creating account...'}
                </div>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
                Sign in
              </a>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup
