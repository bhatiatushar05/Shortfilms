import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Search,
  Tv,
  Film,
  Zap,
  Video,
  Grid3X3,
  User,
  Settings,
  Heart
} from 'lucide-react'
import { useSession } from '../../hooks/useSession'

const Sidebar = ({ isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const { isAuthed } = useSession()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/series', label: 'TV', icon: Tv },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/trending', label: 'Trending', icon: Zap },
    { path: '/shorts', label: 'Shorts', icon: Video },
    { path: '/categories', label: 'Categories', icon: Grid3X3 },
    { path: '/my-list', label: 'My List', icon: Heart },
    { path: '/account', label: 'My Space', icon: User },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <motion.div
      className={`fixed left-0 top-0 h-full bg-dark-900 bg-sidebar-pattern border-r border-dark-600/20 transition-all duration-300 z-header ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-dark-600/20 bg-gradient-to-r from-dark-800/50 to-dark-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-white font-bold text-2xl">Shortcinema</span>
            </motion.div>
          )}
          
          <div className="flex items-center space-x-2">
            {/* Collapse Button (Desktop Only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-lg hover:bg-dark-700 transition-colors duration-200"
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            </button>
            
            {/* Close Button (Mobile Only) */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="py-8 px-2">
        <ul className="space-y-3">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
                          <motion.li
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mx-1"
            >
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-4 px-4 py-4 mx-2 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-glow'
                      : 'text-white hover:bg-dark-700/50 hover:text-primary-400 hover:shadow-glow'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${active ? 'text-primary-400' : 'text-white group-hover:text-primary-400'} transition-colors duration-200`} />
                  {!isCollapsed && (
                                          <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-semibold text-lg transition-colors duration-200"
                      >
                        {item.label}
                      </motion.span>
                  )}
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-600/20 bg-gradient-to-r from-dark-800/50 to-dark-700/50 backdrop-blur-sm">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center shadow-glow">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">
                {isAuthed ? 'Welcome back!' : 'Guest User'}
              </p>
              <p className="text-dark-300 text-xs">
                {isAuthed ? 'Premium Member' : 'Sign in for more'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Sidebar
