import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

// Advanced shimmer animation with Netflix-style effect
const shimmerKeyframes = {
  '0%': {
    backgroundPosition: '-200px 0'
  },
  '100%': {
    backgroundPosition: 'calc(200px + 100%) 0'
  }
}

// Sophisticated skeleton variants
const skeletonVariants = {
  pulse: {
    opacity: [0.4, 0.7, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  shimmer: {
    opacity: [0.4, 0.7, 0.4],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Base skeleton component with Netflix-style shimmer
export const Skeleton = ({ 
  className, 
  variant = 'shimmer', 
  height = 'auto',
  width = 'auto',
  rounded = 'md',
  ...props 
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-r from-slate-700/40 via-slate-600/40 to-slate-700/40',
        roundedClasses[rounded],
        className
      )}
      style={{
        height: height,
        width: width,
        backgroundImage: variant === 'shimmer' 
          ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
          : undefined,
        backgroundSize: variant === 'shimmer' ? '200px 100%' : undefined,
        animation: variant === 'shimmer' 
          ? 'shimmerMove 2s infinite linear' 
          : undefined
      }}
      variants={skeletonVariants[variant]}
      animate={variant}
      {...props}
    >
      {/* Enhanced shimmer overlay */}
      {variant === 'shimmer' && (
        <motion.div
          className="absolute inset-0 -translate-x-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
            width: '50%'
          }}
          animate={{
            x: ['100%', '200%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}
    </motion.div>
  )
}

// Skeleton for text
export const SkeletonText = ({ lines = 1, className, ...props }) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

// Skeleton for titles
export const SkeletonTitle = ({ className, ...props }) => {
  return (
    <Skeleton
      className={cn('h-6 w-3/4', className)}
      {...props}
    />
  )
}

// Skeleton for buttons
export const SkeletonButton = ({ className, ...props }) => {
  return (
    <Skeleton
      className={cn('h-10 w-24', className)}
      {...props}
    />
  )
}

// Enhanced Netflix-style content card skeleton
export const SkeletonCard = ({ className, showDetails = false, ...props }) => {
  return (
    <motion.div 
      className={cn('flex-shrink-0 w-36 sm:w-40 lg:w-44 xl:w-48', className)} 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      <div className="space-y-3">
        {/* Enhanced poster skeleton with realistic Netflix card aspect ratio */}
        <div className="relative group">
          <Skeleton 
            className="aspect-[16/9] w-full rounded-lg"
            variant="shimmer"
            rounded="lg"
          />
          
          {/* Overlay skeleton for hover effects */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-2 left-2 right-2 space-y-1">
              <Skeleton className="h-2 w-3/4" rounded="sm" />
              <Skeleton className="h-2 w-1/2" rounded="sm" />
            </div>
          </div>
        </div>
        
        {showDetails && (
          <>
            {/* Title skeleton with varied widths for realism */}
            <Skeleton 
              className="h-4 w-full" 
              rounded="sm"
              variant="shimmer"
            />
            
            {/* Meta info skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-12" rounded="sm" />
              <Skeleton className="h-3 w-16" rounded="sm" />
            </div>
            
            {/* Genre tags skeleton */}
            <div className="flex space-x-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

// Enhanced content row skeleton with staggered animations
export const SkeletonRow = ({ title = true, cards = 6, className, showDetails = false, ...props }) => {
  return (
    <motion.div 
      className={cn('space-y-6', className)} 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      {...props}
    >
      {/* Enhanced row header skeleton */}
      {title && (
        <div className="px-4 sm:px-6 lg:px-8 ml-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Skeleton 
              className="h-7 w-48" 
              variant="shimmer"
              rounded="lg"
            />
          </motion.div>
        </div>
      )}
      
      {/* Enhanced cards skeleton with staggered animation */}
      <div className="px-4 sm:px-6 lg:px-8 ml-20">
        <div className="flex space-x-4 lg:space-x-5 overflow-hidden">
          {Array.from({ length: cards }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: i * 0.1,
                ease: 'easeOut'
              }}
            >
              <SkeletonCard showDetails={showDetails} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Premium Netflix-style hero section skeleton
export const SkeletonHero = ({ className, ...props }) => {
  return (
    <motion.div 
      className={cn('relative h-screen w-full overflow-hidden', className)} 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      {...props}
    >
      {/* Enhanced background skeleton with gradient overlay */}
      <div className="absolute inset-0">
        <Skeleton 
          className="absolute inset-0" 
          variant="shimmer"
          rounded="none"
        />
        
        {/* Realistic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-red-900/20" />
      </div>
      
      {/* Enhanced content skeleton with spacing for sidebar */}
      <div className="relative z-10 flex items-end h-full pb-20 px-4 sm:px-6 lg:px-8 ml-20">
        <motion.div 
          className="max-w-4xl space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Enhanced badges skeleton */}
          <div className="flex space-x-3">
            <Skeleton className="h-7 w-16 rounded-full" variant="shimmer" />
            <Skeleton className="h-7 w-20 rounded-full" variant="shimmer" />
            <Skeleton className="h-7 w-14 rounded-full" variant="shimmer" />
          </div>
          
          {/* Enhanced title skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-full max-w-2xl" variant="shimmer" rounded="lg" />
            <Skeleton className="h-12 w-3/4 max-w-xl" variant="shimmer" rounded="lg" />
          </div>
          
          {/* Enhanced meta info skeleton */}
          <div className="flex items-center space-x-8">
            <Skeleton className="h-5 w-16" rounded="sm" />
            <Skeleton className="h-5 w-20" rounded="sm" />
            <Skeleton className="h-5 w-24" rounded="sm" />
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-4 rounded-full" />
              ))}
            </div>
          </div>
          
          {/* Enhanced synopsis skeleton */}
          <div className="space-y-2 max-w-2xl">
            <Skeleton className="h-4 w-full" rounded="sm" />
            <Skeleton className="h-4 w-11/12" rounded="sm" />
            <Skeleton className="h-4 w-3/4" rounded="sm" />
          </div>
          
          {/* Enhanced genres skeleton */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
            <Skeleton className="h-6 w-22 rounded-full" />
          </div>
          
          {/* Enhanced buttons skeleton */}
          <div className="flex space-x-4 pt-2">
            <Skeleton className="h-12 w-36 rounded-xl" variant="shimmer" />
            <Skeleton className="h-12 w-40 rounded-xl" variant="shimmer" />
            <Skeleton className="h-12 w-12 rounded-full" variant="shimmer" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Enhanced search results skeleton
export const SkeletonSearchResults = ({ className, ...props }) => {
  return (
    <motion.div 
      className={cn('px-4 sm:px-6 lg:px-8 py-8 ml-20', className)} 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      {...props}
    >
      {/* Enhanced search header skeleton */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Skeleton className="h-8 w-64 mb-4" variant="shimmer" rounded="lg" />
        <div className="space-y-2 max-w-2xl">
          <Skeleton className="h-4 w-full" rounded="sm" />
          <Skeleton className="h-4 w-3/4" rounded="sm" />
        </div>
      </motion.div>
      
      {/* Enhanced results grid skeleton with staggered animation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: i * 0.05,
              ease: 'easeOut'
            }}
          >
            <SkeletonCard showDetails />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Premium loading page skeleton
export const SkeletonPage = ({ showHero = true, rows = 3, className, ...props }) => {
  return (
    <motion.div 
      className={cn('min-h-screen w-full bg-black', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      {...props}
    >
      {/* Hero skeleton */}
      {showHero && <SkeletonHero />}
      
      {/* Content rows skeleton */}
      <div className="space-y-12 py-8">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow 
            key={i} 
            cards={6} 
            showDetails={i === 0} 
          />
        ))}
      </div>
    </motion.div>
  )
}

// Advanced grid skeleton for category pages
export const SkeletonGrid = ({ 
  columns = 6, 
  rows = 4, 
  showHeader = true, 
  className, 
  ...props 
}) => {
  return (
    <motion.div 
      className={cn('px-4 sm:px-6 lg:px-8 py-8 ml-20', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      {...props}
    >
      {showHeader && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Skeleton className="h-10 w-48 mb-4" variant="shimmer" rounded="lg" />
        </motion.div>
      )}
      
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${Math.min(columns, 6)} gap-4 lg:gap-5`}>
        {Array.from({ length: columns * rows }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: i * 0.03,
              ease: 'easeOut'
            }}
          >
            <SkeletonCard />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Skeleton
