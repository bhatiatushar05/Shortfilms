import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Heart, Plus, Star, Clock, Calendar, Film, Tv, Share2, Download, User } from 'lucide-react'
import { useTitle } from '../../../hooks/useCatalog'
import { useSession } from '../../../hooks/useSession'
import { useWatchlistStatus, useToggleWatchlist } from '../../../hooks/useUserFeatures'
import { SkeletonHero } from '../../../components/ui/Skeleton'
import { cn } from '../../../utils/cn'

const TitleDetail = () => {
  const { id } = useParams()
  const { data: title, isLoading, error } = useTitle(id)
  const { isAuthed } = useSession()
  const { data: isInWatchlist } = useWatchlistStatus(title?.id)
  const toggleWatchlistMutation = useToggleWatchlist()

  const handleWatchlistToggle = async () => {
    if (!isAuthed) {
      // TODO: Show login prompt
      return
    }

    try {
      await toggleWatchlistMutation.mutateAsync(title.id)
    } catch (error) {
      console.error('Error toggling watchlist:', error)
    }
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
    return kind === 'series' ? <Tv className="w-4 h-4 text-primary-400" /> : <Film className="w-4 h-4 text-primary-400" />
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

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-dark-900">
        <SkeletonHero />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Content</h2>
          <p className="text-red-400 mb-6">Error: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!title) {
    return (
      <div className="min-h-screen w-full bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Content Not Found</h2>
          <p className="text-gray-400 mb-6">The requested content could not be found.</p>
          <button 
            onClick={() => window.history.back()} 
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-dark-900">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] lg:h-[80vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={title.hero_url || title.poster_url}
            alt={title.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-end h-full pb-20 px-4 sm:px-6 lg:px-8 ml-20">
          <div className="max-w-4xl">
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-4 mb-4"
            >
              <div className="flex items-center space-x-2 bg-dark-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-dark-600/30">
                {getContentTypeIcon(title.kind)}
                <span className="text-sm font-medium text-white capitalize">
                  {title.kind}
                </span>
              </div>
              
              <div className={cn(
                "px-3 py-1.5 rounded-full text-sm font-bold border",
                getRatingColor(title.rating),
                "border-current bg-dark-900/80 backdrop-blur-sm"
              )}>
                {title.rating}
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              {title.title}
            </motion.h1>
            
            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-6 mb-6 text-dark-300"
            >
              {title.year && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatYear(title.year)}</span>
                </div>
              )}
              {title.runtime_sec && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{formatRuntime(title.runtime_sec)}</span>
                </div>
              )}
              {title.kind === 'series' && (title.seasons?.length > 0) && (
                <div className="flex items-center space-x-2">
                  <Tv className="w-5 h-5" />
                  <span>{title.seasons.length} Season{title.seasons.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </motion.div>
            
            {/* Synopsis */}
            {title.synopsis && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg text-dark-200 mb-8 max-w-2xl leading-relaxed"
              >
                {title.synopsis}
              </motion.p>
            )}
            
            {/* Genres */}
            {title.genres && title.genres.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-2 mb-8"
              >
                {title.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1.5 bg-dark-800/80 backdrop-blur-sm border border-dark-600/30 rounded-full text-sm font-medium text-white"
                  >
                    {genre}
                  </span>
                ))}
              </motion.div>
            )}
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center space-x-4"
            >
              <Link to={`/watch/${title.id}`} className="btn-primary flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Play Now</span>
              </Link>
              
              <button className="btn-secondary flex items-center space-x-2">
                <Film className="w-5 h-5" />
                <span>Trailer</span>
              </button>
              
              {isAuthed && (
                <button
                  onClick={handleWatchlistToggle}
                  disabled={toggleWatchlistMutation.isPending}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-200",
                    isInWatchlist
                      ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                      : "bg-dark-700 text-white hover:bg-dark-600 border border-dark-600"
                  )}
                >
                  {isInWatchlist ? (
                    <Heart className="w-5 h-5 fill-current" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
              )}
              
              <button className="p-3 rounded-xl bg-dark-700 text-white hover:bg-dark-600 border border-dark-600 transition-all duration-200">
                <Share2 className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Additional Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 ml-20">
        <div className="max-w-6xl mx-auto">
          {/* Cast & Crew */}
          {title.cast && title.cast.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Cast & Crew</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {title.cast.slice(0, 6).map((person, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-dark-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <User className="w-8 h-8 text-dark-400" />
                    </div>
                    <p className="text-sm text-white font-medium">{person.name}</p>
                    <p className="text-xs text-dark-400">{person.role}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Similar Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Placeholder for similar content */}
              <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 text-center">
                <p className="text-dark-400">Similar content will appear here</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default TitleDetail
