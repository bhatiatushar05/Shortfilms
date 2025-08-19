import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Play, AlertCircle } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { useSession } from '../../../hooks/useSession'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const { login, loading, error, clearError } = useAuth()
  const { isAuthed } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthed) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthed, navigate, location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    const success = await login(email, password)
    if (success) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }

  const isEmailNotConfirmed = error?.includes('Email not confirmed') || error?.includes('email not confirmed')

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
          <p className="text-gray-400 mt-2">Sign in to continue watching</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-sm text-center rounded-lg p-3 ${
                  isEmailNotConfirmed 
                    ? 'bg-yellow-900/20 border border-yellow-800 text-yellow-300' 
                    : 'bg-red-900/20 border border-red-800 text-red-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">
                    {isEmailNotConfirmed ? 'Email Not Confirmed' : 'Authentication Error'}
                  </span>
                </div>
                
                {isEmailNotConfirmed ? (
                  <div className="text-sm">
                    <p className="mb-2">Please check your email and click the confirmation link before signing in.</p>
                    <div className="bg-yellow-800/20 rounded p-2 text-xs">
                      <p><strong>Need help?</strong></p>
                      <ul className="mt-1 space-y-1">
                        <li>• Check your spam/junk folder</li>
                        <li>• Make sure you're using the correct email</li>
                        <li>• <button 
                            onClick={() => navigate('/signup')}
                            className="text-yellow-200 hover:text-yellow-100 underline"
                          >
                            Create a new account
                          </button> if needed</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p>{error}</p>
                )}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200">
              Forgot your password?
            </a>
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-400">
              Don't have an account?{' '}
              <a href="/signup" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
                Sign up
              </a>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
