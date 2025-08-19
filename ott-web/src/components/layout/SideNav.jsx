import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Search, Tv, Film, Video, Grid3X3, User, Heart,
  TrendingUp
} from 'lucide-react'
import { useNavigationStore } from '../../store/navigationStore'

const SideNav = () => {
  const location = useLocation()
  const { isAuthed, activateNavigationBlur, deactivateNavigationBlur } = useNavigationStore()
  const [showLabels, setShowLabels] = useState(false)

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/series', label: 'TV', icon: Tv },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/trending', label: 'Trending', icon: TrendingUp },
    { path: '/shorts', label: 'Sparks', icon: Video },
    { path: '/categories', label: 'Categories', icon: Grid3X3 },
    { path: '/my-list', label: 'My List', icon: Heart },
    { path: '/my-space', label: 'My Space', icon: User },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleMouseEnter = () => {
    setShowLabels(true)
    activateNavigationBlur()
  }

  const handleMouseLeave = () => {
    setShowLabels(false)
    deactivateNavigationBlur()
  }

  const getItemVariants = (index) => ({
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.3, 
        delay: index * 0.05,
        ease: "easeOut"
      }
    }
  })

  return (
    <>
      {/* Background blur overlay when labels are shown - covers left half of page */}
      <AnimatePresence>
        {showLabels && createPortal(
          <motion.div
            className="fixed inset-0 z-[1999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Left half blur */}
            <div className="absolute left-0 top-0 w-1/2 h-full bg-black/40 backdrop-blur-md" />
            {/* Right half - no blur */}
            <div className="absolute right-0 top-0 w-1/2 h-full" />
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {createPortal(
        <div 
          className="fixed left-2 top-1/2 -translate-y-1/2 z-[2000] pointer-events-none" 
          data-sidebar
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div 
            className="flex items-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Icon Column */}
            <div className="flex flex-col items-center space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const active = isActive(item.path)

                if (item.protected && !isAuthed) return null

                return (
                  <motion.div
                    key={item.path}
                    variants={getItemVariants(index)}
                    initial="hidden"
                    animate="visible"
                    className="relative h-11 flex items-center"
                  >
                    <Link to={item.path}>
                      <button
                        className={`p-3 transition-all duration-300 flex items-center justify-center rounded-lg ${
                          active
                            ? 'text-red-400'
                            : 'text-red-300/80 hover:text-red-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Labels Column */}
            <AnimatePresence>
              {showLabels && (
                <motion.div
                  className="ml-4 flex flex-col space-y-2"
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {navItems.map((item, index) => {
                    const active = isActive(item.path)

                    if (item.protected && !isAuthed) return null

                    return (
                      <motion.div
                        key={`label-${item.path}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="h-11 flex items-center"
                      >
                        <Link to={item.path}>
                          <span className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                            active
                              ? 'text-red-400'
                              : 'text-red-300/90 hover:text-red-400'
                          }`}>
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  )
}

export default SideNav