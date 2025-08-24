import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Play, AlertCircle, QrCode, Smartphone } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { useSession } from '../../../hooks/useSession'
import QRCodeLogin from '../../../components/auth/QRCodeLogin'
import LightRays from '../../../components/ui/LightRays'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState('email') // 'email' or 'qr'
  
  const { login, loading, error, clearError } = useAuth()
  const { isAuthed } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated, but allow suspended users to stay
  useEffect(() => {
    if (isAuthed) {
      // Check if this is a suspended user trying to sign in again
      const isSuspendedUserSignin = sessionStorage.getItem('suspended-user-signin')
      
      if (isSuspendedUserSignin) {
        // Clear the flag and allow them to stay on login page
        sessionStorage.removeItem('suspended-user-signin')
        console.log('🔍 Suspended user allowed to stay on login page')
        return
      }
      
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

  const handleLoginSuccess = () => {
    const from = location.state?.from?.pathname || '/'
    navigate(from, { replace: true })
  }

  const isEmailNotConfirmed = error?.includes('Email not confirmed') || error?.includes('email not confirmed')

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Light Rays Background */}
      <div style={{ width: '100%', height: '600px', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#FFFFFF"
          raysSpeed={1.9}
          lightSpread={2.3}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.2}
          noiseAmount={0.1}
          distortion={0.02}
          className="custom-rays"
        />
      </div>
      
             <div className="max-w-md w-full relative z-10 mt-24">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.96, ease: "easeOut", delay: 0.16 }}
          className="text-center mb-6"
        >
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500/15 to-red-500/5 backdrop-blur-md rounded-3xl mb-4 border border-red-500/20 shadow-2xl"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.24 }}
          >
            <Play className="w-8 h-8 text-white drop-shadow-lg" />
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.64 }}
          >
            ShortCinema
          </motion.h1>
          <motion.p 
            className="text-white/60 text-base font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Sign in to continue watching
          </motion.p>
        </motion.div>

        {/* Login Method Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.32 }}
          className="bg-red-500/5 backdrop-blur-xl rounded-3xl p-4 border border-red-500/15 mb-6 shadow-2xl"
        >
          <div className="flex bg-red-500/5 backdrop-blur-sm rounded-2xl p-2 border border-red-500/15">
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-240 ${
                loginMethod === 'email'
                  ? 'bg-red-500/20 text-white shadow-lg backdrop-blur-sm border border-red-500/30'
                  : 'text-white/60 hover:text-white hover:bg-red-500/10'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('qr')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-240 ${
                loginMethod === 'qr'
                  ? 'bg-red-500/20 text-white shadow-lg backdrop-blur-sm border border-red-500/30'
                  : 'text-white/60 hover:text-white hover:bg-red-500/10'
              }`}
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code & Phone
            </button>
          </div>
        </motion.div>

        {/* Login Form */}
        <AnimatePresence mode="wait">
          {loginMethod === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{ duration: 0.96, ease: "easeOut", delay: 0.48 }}
              className="bg-red-500/5 backdrop-blur-xl rounded-3xl p-6 border border-red-500/15 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.64, delay: 0.64 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-red-500/10 border border-red-500/25 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 focus:bg-red-500/15 backdrop-blur-sm transition-all duration-240 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.64, delay: 0.8 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-3 bg-red-500/10 border border-red-500/25 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 focus:bg-red-500/15 backdrop-blur-sm transition-all duration-240 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors duration-240 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.64, delay: 0.96 }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500/20 to-red-500/10 hover:from-red-500/30 hover:to-red-500/20 disabled:from-red-500/10 disabled:to-red-500/5 text-white font-medium py-3 px-6 rounded-2xl backdrop-blur-sm border border-red-500/25 transition-all duration-240 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed shadow-lg"
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
          <motion.div 
            className="mt-6 text-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.64, delay: 1.12 }}
          >
            <a href="#" className="block text-sm text-white/60 hover:text-white transition-colors duration-240">
              Forgot your password?
            </a>
            
            <div>
              <span className="text-sm text-white/60">
                Don't have an account?{' '}
                <a href="/signup" className="text-white hover:text-white/80 font-medium transition-colors duration-240">
                  Sign up
                </a>
              </span>
            </div>
            
            <Link
              to="/qr-demo"
              className="inline-block text-sm text-white/70 hover:text-white transition-colors duration-240"
            >
              Try QR Code Login Demo →
            </Link>
          </motion.div>
        </motion.div>
          )}

          {/* QR Code Login Section */}
          {loginMethod === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <QRCodeLogin 
                onBack={() => setLoginMethod('email')}
                onSuccess={handleLoginSuccess}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Login
