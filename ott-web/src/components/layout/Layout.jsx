import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SideNav from './SideNav'
import SearchCommand from '../search/SearchCommand'
import { useNavigationStore } from '../../store/navigationStore'

const Layout = () => {
  const location = useLocation()
  const { isMobileNavOpen, closeMobileNav, isNavigationBlurActive } = useNavigationStore()

  // Close mobile nav on route change
  useEffect(() => {
    if (isMobileNavOpen) {
      closeMobileNav()
    }
  }, [location.pathname, isMobileNavOpen, closeMobileNav])

  return (
    <div className="min-h-screen w-full bg-black backdrop-blur-md relative">
      {/* Floating Sidebar - Fixed middle-left, truly fixed to prevent scrolling */}
      <SideNav />

      {/* Main Content Area - No margin to allow hero to fill full width */}
      <motion.main 
        className={`w-full relative z-10 min-h-screen transition-all duration-300 ${
          isNavigationBlurActive ? 'blur-sm' : ''
        }`}
        animate={{
          filter: isNavigationBlurActive ? 'blur(8px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Outlet />
      </motion.main>

      {/* Global Search Command */}
      <SearchCommand />
    </div>
  )
}

export default Layout
