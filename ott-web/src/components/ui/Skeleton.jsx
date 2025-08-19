import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

// Skeleton variants
const skeletonVariants = {
  shimmer: {
    background: [
      'linear-gradient(90deg, #1a1f35 0%, #252b47 50%, #1a1f35 100%)',
      'linear-gradient(90deg, #1a1f35 0%, #2f3659 50%, #1a1f35 100%)',
      'linear-gradient(90deg, #1a1f35 0%, #252b47 50%, #1a1f35 100%)',
    ],
    backgroundSize: ['200% 100%', '200% 100%', '200% 100%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

// Base skeleton component
export const Skeleton = ({ className, variant = 'default', ...props }) => {
  return (
    <motion.div
      className={cn(
        'bg-dark-600 rounded-xl',
        variant === 'shimmer' && 'animate-pulse',
        className
      )}
      variants={variant === 'shimmer' ? skeletonVariants.shimmer : undefined}
      animate={variant === 'shimmer' ? 'shimmer' : undefined}
      {...props}
    />
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

// Skeleton for content cards
export const SkeletonCard = ({ className, ...props }) => {
  return (
    <div className={cn('flex-shrink-0 w-36 sm:w-40 lg:w-44 xl:w-48', className)} {...props}>
      <div className="space-y-3">
        {/* Poster skeleton */}
        <Skeleton className="aspect-[2/3] w-full" />
        
        {/* Title skeleton */}
        <SkeletonTitle />
        
        {/* Meta info skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

// Skeleton for content rows
export const SkeletonRow = ({ title = true, cards = 6, className, ...props }) => {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Row header skeleton */}
      {title && (
        <div className="px-4 sm:px-6 lg:px-8">
          <SkeletonTitle className="h-8 w-48" />
        </div>
      )}
      
      {/* Cards skeleton */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4 lg:space-x-5">
          {Array.from({ length: cards }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton for hero section
export const SkeletonHero = ({ className, ...props }) => {
  return (
    <div className={cn('relative h-[70vh] min-h-[500px] lg:h-[80vh]', className)} {...props}>
      {/* Background skeleton */}
      <Skeleton className="absolute inset-0" />
      
      {/* Content skeleton */}
      <div className="relative z-10 flex items-end h-full pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-6">
          {/* Badges skeleton */}
          <div className="flex space-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
          
          {/* Title skeleton */}
          <Skeleton className="h-16 w-3/4" />
          
          {/* Meta info skeleton */}
          <div className="flex space-x-6">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          
          {/* Synopsis skeleton */}
          <SkeletonText lines={3} className="max-w-2xl" />
          
          {/* Genres skeleton */}
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-18" />
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex space-x-4">
            <SkeletonButton className="h-12 w-32" />
            <SkeletonButton className="h-12 w-36" />
            <SkeletonButton className="h-12 w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for search results
export const SkeletonSearchResults = ({ className, ...props }) => {
  return (
    <div className={cn('px-4 sm:px-6 lg:px-8 py-8', className)} {...props}>
      {/* Search header skeleton */}
      <div className="mb-8">
        <SkeletonTitle className="h-8 w-64 mb-4" />
        <SkeletonText lines={2} className="max-w-2xl" />
      </div>
      
      {/* Results grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export default Skeleton
