import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Heart, Clock, Star, Film, Tv, Plus } from 'lucide-react'
import { useWatchlistStatus, useToggleWatchlist } from '../../hooks/useUserFeatures'
import { useSession } from '../../hooks/useSession'
import { cn } from '../../utils/cn'

const ContentCard = ({ title, showProgress = false, showWatchlist = true, showPlayButton = true }) => {
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimeoutRef = useRef(null)
  const { isAuthed } = useSession()
  
  // Validate title object
  if (!title || !title.id) {
    console.warn('ContentCard: Invalid title object', title)
    return null
  }
  
  // Only fetch watchlist status if title has a valid ID and showWatchlist is enabled
  const { data: isInWatchlist } = useWatchlistStatus(
    showWatchlist && title?.id ? title.id : null
  )
  const toggleWatchlistMutation = useToggleWatchlist()

  const handleWatchlistToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthed) {
      // TODO: Show login prompt
      return
    }

    try {
      if (!title?.id) {
        console.warn('Cannot toggle watchlist: no title ID')
        return
      }
      await toggleWatchlistMutation.mutateAsync(title.id)
    } catch (error) {
      console.error('Error toggling watchlist:', error)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Hover delay handlers
  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // Set hover state after 0.5 second delay
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true)
    }, 500)
  }

  const handleMouseLeave = () => {
    // Clear timeout if leaving before 0.5 seconds
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // Immediately remove hover state
    setIsHovered(false)
  }

  const formatRuntime = (seconds) => {
    if (!seconds) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatYear = (year) => {
    if (!year) return ''
    return year.toString()
  }

  const getContentTypeIcon = (kind) => {
    return kind === 'series' ? <Tv className="w-3 h-3 text-primary-400" /> : <Film className="w-3 h-3 text-primary-400" />
  }

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'U': return 'text-green-400'
      case 'U/A 7+': return 'text-yellow-400'
      case 'U/A 13+': return 'text-orange-400'
      case 'U/A 16+': return 'text-red-400'
      case 'A': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  return (
    <motion.div
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{ scale: isHovered ? 1.03 : 1 }}
      transition={{ duration: 0.1 }}
    >
      <Link to={`/title/${title.id}`} className="block">
        {/* Card Container */}
        <div className={cn(
          "relative aspect-[2/3] overflow-hidden rounded-xl bg-dark-800 border border-dark-600/20 shadow-card transition-all duration-200",
          isHovered && "shadow-card-hover border-primary-500/30"
        )}>
          
          {/* Loading Skeleton */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark-700 to-dark-800 animate-pulse" />
          
          {/* Poster Image */}
          <img
            src={title.poster_url}
            alt={title.title}
            className={cn(
              "relative z-10 w-full h-full object-cover transition-transform duration-300",
              isHovered && "scale-110"
            )}
            loading="lazy"
            onLoad={(e) => {
              // Hide loading skeleton when image loads
              e.target.previousSibling.style.display = 'none'
            }}
            onError={(e) => {
              console.log(`Image failed to load for "${title.title}": ${title.poster_url}`)
              // Fallback to a solid color background if image fails
              e.target.style.display = 'none'
              e.target.previousSibling.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          
          {/* Fallback Background (hidden by default) */}
          <div 
            className="hidden w-full h-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center"
            style={{ display: 'none' }}
          >
            <div className="text-center text-white">
              <Film className="w-12 h-12 mx-auto mb-2 text-dark-400" />
              <p className="text-sm font-medium">{title.title}</p>
              <p className="text-xs text-dark-400 mt-1">Image not available</p>
            </div>
          </div>
          
          {/* Content Type Badge */}
          <div className="absolute top-2 left-2 bg-dark-900/80 backdrop-blur-sm px-2 py-1 rounded-full border border-dark-600/30">
            <div className="flex items-center space-x-1">
              {getContentTypeIcon(title.kind)}
              <span className="text-xs font-medium text-white capitalize">
                {title.kind}
              </span>
            </div>
          </div>

          {/* Rating Badge */}
          {title.rating && (
            <div className="absolute top-2 right-2">
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-bold border bg-dark-900/80 backdrop-blur-sm",
                getRatingColor(title.rating),
                "border-current"
              )}>
                {title.rating}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && title.progress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-600/30">
              <div 
                                  className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${title.progress}%` }}
              />
            </div>
          )}

          {/* Hover Overlay with Actions */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            initial={false}
          >
            {/* Play Button */}
            {showPlayButton && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-glow-lg group-hover:scale-110 transition-transform duration-200">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </motion.div>
            )}

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              {/* Title */}
              <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                {title.title}
              </h3>
              
              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-dark-300">
                <div className="flex items-center space-x-2">
                  {title.year && (
                    <span>{formatYear(title.year)}</span>
                  )}
                  {title.runtime_sec && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatRuntime(title.runtime_sec)}</span>
                    </div>
                  )}
                </div>
                
                {/* Watchlist Toggle */}
                {showWatchlist && isAuthed && (
                  <motion.button
                    onClick={handleWatchlistToggle}
                    disabled={toggleWatchlistMutation.isPending}
                    className={cn(
                      "p-1.5 rounded-full transition-all duration-200",
                      isInWatchlist 
                        ? "text-primary-400 hover:text-primary-300" 
                        : "text-dark-300 hover:text-primary-400"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isInWatchlist ? (
                      <Heart className="w-4 h-4 fill-current" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Card Info Below (Desktop) */}
        <div className="mt-3 space-y-2 hidden sm:block">
          <h3 className="font-medium text-white line-clamp-2 group-hover:text-primary-400 transition-colors duration-200">
            {title.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-dark-400">
            <div className="flex items-center space-x-3">
              {title.year && (
                <span>{formatYear(title.year)}</span>
              )}
              {title.runtime_sec && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatRuntime(title.runtime_sec)}</span>
                </div>
              )}
              {title.kind === 'series' && title.season_count && (
                <span>{title.season_count} Season{title.season_count !== 1 ? 's' : ''}</span>
              )}
            </div>
            
            {/* Watchlist Toggle (Desktop) */}
            {showWatchlist && isAuthed && (
              <motion.button
                onClick={handleWatchlistToggle}
                disabled={toggleWatchlistMutation.isPending}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-200",
                  isInWatchlist 
                    ? "text-primary-400 hover:text-primary-300" 
                    : "text-dark-400 hover:text-primary-400"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isInWatchlist ? (
                  <Heart className="w-4 h-4 fill-current" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </div>

          {/* Genres */}
          {title.genres && title.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {title.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-xs text-dark-500 bg-dark-800 px-2 py-1 rounded-full border border-dark-600/30"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default ContentCard
