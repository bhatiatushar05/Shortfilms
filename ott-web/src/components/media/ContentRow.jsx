import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ContentCard from './ContentCard'
import { cn } from '../../utils/cn'

const ContentRow = ({ 
  title, 
  items = [], 
  showWatchlist = true, 
  showProgress = false,
  showPlayButton = true,
  className = ''
}) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollContainerRef = useRef(null)

  // Check scroll position
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }

  // Scroll to position
  const scrollTo = (direction) => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    const currentScroll = container.scrollLeft

    if (direction === 'left') {
      container.scrollTo({
        left: Math.max(0, currentScroll - scrollAmount),
        behavior: 'smooth'
      })
    } else {
      container.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Handle scroll events
  const handleScroll = () => {
    if (!isScrolling) {
      setIsScrolling(true)
      setTimeout(() => setIsScrolling(false), 150)
    }
    checkScrollPosition()
  }

  // Handle wheel scroll - allow page scroll when at edges
  const handleWheel = (e) => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, clientWidth, scrollWidth } = container
    const atStart = scrollLeft <= 0
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1

    // If user is scrolling vertically (common on trackpads)
    if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
      // Only hijack to horizontal if we can actually move further in that direction
      const scrollingRight = e.deltaY > 0
      const canMove = (scrollingRight && !atEnd) || (!scrollingRight && !atStart)
      if (canMove) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
      // else: let it bubble for page vertical scroll
      return
    }

    // If the user is explicitly scrolling horizontally, only prevent default when we can move
    const horizontalNext = scrollLeft + e.deltaX
    if (horizontalNext >= 0 && horizontalNext <= scrollWidth - clientWidth) {
      e.preventDefault()
      container.scrollLeft += e.deltaX
    }
  }

  // Filter out invalid items
  const validItems = items?.filter(item => item && item.id) || []

  // Check scroll position on mount and resize
  useEffect(() => {
    checkScrollPosition()
    window.addEventListener('resize', checkScrollPosition)
    
    // Add wheel event listener with non-passive option
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }
    
    return () => {
      window.removeEventListener('resize', checkScrollPosition)
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [validItems])
  
  if (validItems.length === 0) return null

  return (
    <div className={cn("group", className)}>
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-white"
        >
          {title}
        </motion.h2>

        {/* Navigation Arrows */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scrollTo('left')}
            disabled={!canScrollLeft}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              canScrollLeft 
                ? "bg-dark-700 hover:bg-dark-600 text-white" 
                : "bg-dark-800 text-dark-500 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => scrollTo('right')}
            disabled={!canScrollRight}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              canScrollRight 
                ? "bg-dark-700 hover:bg-dark-600 text-white" 
                : "bg-dark-800 text-dark-500 cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Row Container */}
      <div className="relative w-full">
        {/* Left Gradient Fade */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-dark-900 to-transparent pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Right Gradient Fade */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-dark-900 to-transparent pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 lg:space-x-5 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8"
          onScroll={handleScroll}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {validItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="flex-shrink-0 w-36 sm:w-40 lg:w-44 xl:w-48"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: "easeOut"
              }}
            >
              <ContentCard
                title={item}
                showProgress={showProgress}
                showWatchlist={showWatchlist}
                showPlayButton={showPlayButton}
              />
            </motion.div>
          ))}
        </div>

        {/* Scroll Progress Indicator */}
        <div className="mt-4 px-4 sm:px-6 lg:px-8">
          <div className="w-full bg-dark-700 rounded-full h-1">
            <div 
              className="bg-primary-500 h-1 rounded-full transition-all duration-300"
              style={{ 
                width: canScrollRight ? '100%' : canScrollLeft ? '50%' : '0%' 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentRow
