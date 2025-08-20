import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, Bell, Settings, Globe, Sun, Moon, LogOut, User, Heart } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'
import { useNavigationStore } from '../../store/navigationStore'
import { supabase } from '../../lib/supabase'

const TopNav = () => {
  const location = useLocation()
  const { isAuthed, user, signOut } = useSession()
  const {
    isSearchOpen,
    openSearch,
    isMobileNavOpen,
    toggleMobileNav,
    isProfileMenuOpen,
    toggleProfileMenu,
    theme,
    toggleTheme,
    language,
    setLanguage,
    openCommand,
  } = useNavigationStore()

  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll for glassy effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile nav on route change
  useEffect(() => {
    if (isMobileNavOpen) {
      // Close mobile nav logic will be handled by parent component
    }
  }, [location.pathname])

  const handleSignOut = async () => {
    try {
      console.log('🔍 Sign out initiated')
      console.log('🔍 Current auth state:', { isAuthed, user: !!user })
      
      // Close profile menu first
      if (isProfileMenuOpen) {
        toggleProfileMenu()
      }
      
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
        console.log('🔍 Comprehensive storage cleanup completed')
      } catch (storageError) {
        console.warn('Failed to clear storage:', storageError)
      }
      
      // Check current session before sign out
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔍 Current session before sign out:', !!session)
      
      // Perform sign out using the signOut function from useSession
      console.log('🔍 Calling useSession signOut...')
      await signOut()
      console.log('🔍 useSession signOut completed')
      
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
        console.log('🔍 Final storage cleanup completed')
      } catch (finalCleanupError) {
        console.warn('Final cleanup failed:', finalCleanupError)
      }
      
      // Check session after sign out
      const { data: { session: afterSession } } = await supabase.auth.getSession()
      console.log('🔍 Session after sign out:', !!afterSession)
      
      // Force page reload to clear any remaining state
      console.log('🔍 Force reloading page to clear state...')
      window.location.reload()
      
    } catch (error) {
      console.error('❌ Sign out failed:', error)
      // Even if sign out fails, try to force reload
      console.log('🔍 Attempting force reload despite error...')
      window.location.reload()
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-header transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-md border-b border-white/20 shadow-glass' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-padding">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileNav}
              className="lg:hidden p-2 rounded-2xl glass-overlay hover:glass-overlay-hover transition-all duration-200"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-white font-bold text-2xl hidden sm:block">
                Shortcinema
              </span>
            </motion.div>
          </div>

          {/* Center Section - Quick Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1">
            {[
              { path: '/', label: 'Home' },
              { path: '/movies', label: 'Movies' },
              { path: '/series', label: 'Series' },
              { path: '/trending', label: 'Trending' },
            ].map((link) => {
              const isActive = location.pathname === link.path
              return (
                <button
                  key={link.path}
                  className={`px-4 py-2 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-glow'
                      : 'glass-overlay hover:glass-overlay-hover text-white'
                  }`}
                  onClick={() => window.location.href = link.path}
                >
                  {link.label}
                </button>
              )
            })}
          </div>

          {/* Right Section - Search, Notifications, Profile */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <button
              onClick={openCommand}
              className="p-2 rounded-2xl glass-overlay hover:glass-overlay-hover transition-all duration-200"
              title="Search (Ctrl+K)"
            >
              <Search className="w-5 h-5 text-white" />
            </button>

            {/* Notifications */}
            <button
              className="p-2 rounded-2xl glass-overlay hover:glass-overlay-hover transition-all duration-200 relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full"></span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="p-2 rounded-2xl glass-overlay hover:glass-overlay-hover transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {getInitials(user?.name)}
                </div>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-64 bg-dark-800/95 border border-white/10 backdrop-blur-md rounded-2xl shadow-glass z-modal"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(user?.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user?.name || 'Guest User'}</p>
                          <p className="text-sm text-dark-300">
                            {isAuthed ? 'Premium Member' : 'Sign in for more'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link to="/my-space" className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200">
                        <User className="w-4 h-4" />
                        <span>My Space</span>
                      </Link>
                      
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200">
                        <Heart className="w-4 h-4" />
                        <span>My List</span>
                      </button>
                      
                      <div className="border-t border-white/10 my-2"></div>
                      
                      <Link to="/my-space" className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200">
                        <Settings className="w-4 h-4" />
                        <span>My Space</span>
                      </Link>
                      
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200">
                        <Globe className="w-4 h-4" />
                        <span>Language: {language === 'en' ? 'English' : language}</span>
                      </button>
                      
                      <button 
                        className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200"
                        onClick={toggleTheme}
                      >
                        {theme === 'dark' ? (
                          <>
                            <Sun className="w-4 h-4" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </button>
                      
                      {isAuthed && (
                        <>
                          <div className="border-t border-white/10 my-2"></div>
                          <button 
                            className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors duration-200"
                            onClick={handleSignOut}
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default TopNav
