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

// Ultra-cool hero section skeleton with spectacular effects
export const SkeletonHero = ({ className, ...props }) => {
  return (
    <motion.div 
      className={cn('relative h-screen w-full overflow-hidden bg-black', className)} 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      {...props}
    >
      {/* Epic background with multiple spectacular layers */}
      <div className="absolute inset-0">
        {/* Primary background with pulsing energy */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-900/60"
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.05, 1],
            filter: ['hue-rotate(0deg)', 'hue-rotate(15deg)', 'hue-rotate(0deg)']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Matrix-style digital rain effect */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={`rain-${i}`}
              className="absolute w-0.5 bg-gradient-to-b from-cyan-400/80 via-cyan-300/60 to-transparent"
              style={{
                left: `${Math.random() * 100}%`,
                height: `${50 + Math.random() * 100}px`,
              }}
              animate={{
                y: [-100, window.innerHeight + 100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear'
              }}
            />
          ))}
        </div>

        {/* Pulse wave effects */}
        <div className="absolute inset-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`pulse-${i}`}
              className="absolute rounded-full border border-red-500/30"
              style={{
                width: '20px',
                height: '20px',
                left: '50%',
                top: '50%',
                translateX: '-50%',
                translateY: '-50%',
              }}
              animate={{
                scale: [0, 20],
                opacity: [0.8, 0],
                borderWidth: ['2px', '0px']
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 1.5,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
        
        {/* Floating neon particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: `linear-gradient(45deg, ${
                  ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff'][Math.floor(Math.random() * 5)]
                }, transparent)`,
                boxShadow: `0 0 10px ${
                  ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff'][Math.floor(Math.random() * 5)]
                }`
              }}
              animate={{
                y: [-20, -120, -20],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Scanning lines effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent"
          style={{ height: '4px' }}
          animate={{
            y: [0, window.innerHeight],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Enhanced gradient overlays with glitch effects */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"
          animate={{ 
            opacity: [0.8, 1, 0.8],
            filter: ['hue-rotate(0deg)', 'hue-rotate(5deg)', 'hue-rotate(0deg)']
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-red-900/20"
          animate={{ 
            opacity: [0.6, 0.9, 0.6],
            skewX: [0, 0.5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>
      
      {/* Enhanced content skeleton with cinematic spacing */}
      <div className="relative z-10 flex items-end h-full pb-20 px-4 sm:px-6 lg:px-8 ml-20">
        <motion.div 
          className="max-w-4xl space-y-8"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
        >
          {/* Epic badges with holographic effects */}
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[16, 24, 20].map((width, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.7 + i * 0.15, type: 'spring' }}
                className="relative"
              >
                <motion.div
                  className={`h-8 w-${width} rounded-full bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-cyan-500/40 relative overflow-hidden`}
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(168, 85, 247, 0.4)',
                      '0 0 20px rgba(236, 72, 153, 0.6)', 
                      '0 0 10px rgba(34, 211, 238, 0.4)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Epic glitched title skeleton with mind-blowing effects */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <motion.div
              initial={{ width: 0, scaleY: 0 }}
              animate={{ width: '100%', scaleY: 1 }}
              transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
              className="overflow-hidden relative"
            >
              <motion.div 
                className="h-16 w-full max-w-3xl bg-gradient-to-r from-red-500/60 via-yellow-500/60 to-red-500/60 relative rounded-lg overflow-hidden"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(239, 68, 68, 0.5)',
                    '0 0 40px rgba(245, 158, 11, 0.7)',
                    '0 0 20px rgba(239, 68, 68, 0.5)'
                  ],
                  filter: [
                    'hue-rotate(0deg) saturate(100%)',
                    'hue-rotate(10deg) saturate(120%)',
                    'hue-rotate(0deg) saturate(100%)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Glitch effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-transparent to-magenta-400/30"
                  animate={{
                    x: [-10, 10, -5, 5, 0],
                    opacity: [0, 0.8, 0, 0.6, 0]
                  }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: [-200, 200] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ width: 0, scaleY: 0 }}
              animate={{ width: '75%', scaleY: 1 }}
              transition={{ duration: 1.2, delay: 1.3, ease: 'easeOut' }}
              className="overflow-hidden relative"
            >
              <motion.div 
                className="h-16 w-full max-w-2xl bg-gradient-to-r from-purple-500/60 via-blue-500/60 to-purple-500/60 relative rounded-lg overflow-hidden"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(147, 51, 234, 0.4)',
                    '0 0 30px rgba(59, 130, 246, 0.6)',
                    '0 0 15px rgba(147, 51, 234, 0.4)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: [-150, 150] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Enhanced meta info with icon placeholders */}
          <motion.div 
            className="flex items-center space-x-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {[
              { w: 'w-6', h: 'h-6', rounded: 'rounded-sm' },
              { w: 'w-20', h: 'h-6', rounded: 'rounded-md' },
              { w: 'w-24', h: 'h-6', rounded: 'rounded-md' },
              { w: 'w-28', h: 'h-6', rounded: 'rounded-md' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.3 + i * 0.1 }}
              >
                <Skeleton className={`${item.h} ${item.w} ${item.rounded}`} />
              </motion.div>
            ))}
            
            {/* Star rating skeleton */}
            <motion.div 
              className="flex items-center space-x-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.4, delay: 1.7 + i * 0.05 }}
                >
                  <Skeleton className="h-5 w-5 rounded-full" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Dynamic synopsis with line-by-line reveal */}
          <motion.div 
            className="space-y-3 max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            {[100, 95, 85, 60].map((width, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: `${width}%` }}
                transition={{ duration: 0.8, delay: 1.5 + i * 0.2, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <Skeleton className="h-5 w-full rounded-md" />
              </motion.div>
            ))}
          </motion.div>
          
          {/* Mind-blowing neon genre tags */}
          <motion.div 
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            {[18, 22, 16, 24, 20].map((width, i) => {
              const colors = [
                'from-emerald-500/50 to-teal-500/50',
                'from-violet-500/50 to-purple-500/50', 
                'from-orange-500/50 to-red-500/50',
                'from-blue-500/50 to-cyan-500/50',
                'from-pink-500/50 to-rose-500/50'
              ];
              const glowColors = [
                'rgba(16, 185, 129, 0.5)',
                'rgba(139, 92, 246, 0.5)',
                'rgba(249, 115, 22, 0.5)', 
                'rgba(59, 130, 246, 0.5)',
                'rgba(236, 72, 153, 0.5)'
              ];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, rotateZ: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 1.9 + i * 0.15, 
                    type: 'spring',
                    stiffness: 200,
                    damping: 15
                  }}
                  className="relative"
                >
                  <motion.div 
                    className={`h-7 w-${width} rounded-full bg-gradient-to-r ${colors[i]} relative overflow-hidden`}
                    animate={{
                      boxShadow: [
                        `0 0 10px ${glowColors[i]}`,
                        `0 0 25px ${glowColors[i]}`,
                        `0 0 10px ${glowColors[i]}`
                      ],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 2 + i * 0.3, 
                      repeat: Infinity, 
                      ease: 'easeInOut',
                      delay: i * 0.2 
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: `0 0 30px ${glowColors[i]}`
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ 
                        x: [-50, 50],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: 'easeInOut',
                        delay: i * 0.3
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Spectacular action buttons with insane effects */}
          <motion.div 
            className="flex space-x-6 pt-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.2 }}
          >
            {[
              { w: 'w-40', primary: true, label: 'Play' },
              { w: 'w-44', primary: false, label: 'Details' },
              { w: 'w-14', primary: false, round: true, label: 'Add' }
            ].map((btn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ 
                  duration: 1, 
                  delay: 2.3 + i * 0.2,
                  type: 'spring',
                  stiffness: 150,
                  damping: 12
                }}
                whileHover={{ 
                  scale: 1.1,
                  rotateZ: [0, -2, 2, 0],
                  transition: { duration: 0.3 }
                }}
                className="cursor-pointer relative"
              >
                <motion.div
                  className={`h-14 ${btn.w} ${btn.round ? 'rounded-full' : 'rounded-xl'} relative overflow-hidden ${
                    btn.primary 
                      ? 'bg-gradient-to-r from-red-600/70 via-orange-500/70 to-red-600/70' 
                      : 'bg-gradient-to-r from-slate-600/60 via-slate-500/60 to-slate-600/60'
                  }`}
                  animate={{
                    boxShadow: btn.primary ? [
                      '0 0 20px rgba(239, 68, 68, 0.6)',
                      '0 0 40px rgba(249, 115, 22, 0.8)',
                      '0 0 20px rgba(239, 68, 68, 0.6)'
                    ] : [
                      '0 0 10px rgba(100, 116, 139, 0.4)',
                      '0 0 20px rgba(148, 163, 184, 0.6)', 
                      '0 0 10px rgba(100, 116, 139, 0.4)'
                    ]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: 'easeInOut',
                    delay: i * 0.5
                  }}
                >
                  {/* Energy pulse effect */}
                  <motion.div
                    className={`absolute inset-0 ${btn.round ? 'rounded-full' : 'rounded-xl'} ${
                      btn.primary 
                        ? 'bg-gradient-to-r from-yellow-400/30 via-red-400/30 to-yellow-400/30'
                        : 'bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-cyan-400/20'
                    }`}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3
                    }}
                  />
                  
                  {/* Lightning shimmer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{ 
                      x: [-100, 100],
                      skewX: [0, 10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: 'easeInOut',
                      delay: 1 + i * 0.4
                    }}
                  />
                  
                  {/* Glitch overlay */}
                  {btn.primary && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-transparent to-magenta-400/20"
                      animate={{
                        x: [-5, 5, -3, 3, 0],
                        opacity: [0, 1, 0, 0.8, 0]
                      }}
                      transition={{ 
                        duration: 0.2, 
                        repeat: Infinity, 
                        repeatDelay: 3,
                        ease: 'linear'
                      }}
                    />
                  )}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Epic layered vignette with dynamic effects */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.4) 70%)'
        }}
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.02, 1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Dynamic light beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`beam-${i}`}
            className="absolute bg-gradient-to-r from-transparent via-white/5 to-transparent"
            style={{
              width: '2px',
              height: '100vh',
              left: `${20 + i * 20}%`,
              transform: 'rotate(15deg)',
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scaleY: [0.5, 1.2, 0.5]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
      
      {/* Holographic grid overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
        animate={{
          opacity: [0.05, 0.15, 0.05],
          transform: ['translate(0, 0)', 'translate(25px, 25px)', 'translate(0, 0)']
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
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
