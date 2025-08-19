import { motion } from 'framer-motion'
import { Heart, Play, Plus, Info } from 'lucide-react'
import { useWatchlist } from '../../../hooks/useUserFeatures'
import { useSession } from '../../../hooks/useSession'
import { Link } from 'react-router-dom'

const MyList = () => {
  const { isAuthed } = useSession()
  const { data: watchlist, isLoading, error } = useWatchlist()

  // Debug logging
  console.log('MyList render:', { isAuthed, watchlist, isLoading, error })

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-8">My List</h1>
          <p className="text-gray-400">Please sign in to view your watchlist</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">My List</h1>
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading your watchlist...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">My List</h1>
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">Error loading watchlist: {error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">My List</h1>
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">Your list is empty</h3>
            <p className="text-gray-500">Start adding content to your watchlist</p>
            <Link to="/" className="btn-primary mt-4 inline-block">
              Browse Content
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          My List ({watchlist.length} items)
        </motion.h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {watchlist.map((title) => (
            <motion.div
              key={title.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-dark-800 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200"
            >
              {/* Poster */}
              <div className="aspect-[2/3] bg-dark-700 relative overflow-hidden">
                {title.posterUrl ? (
                  <img
                    src={title.posterUrl}
                    alt={title.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-dark-600 to-dark-800 flex items-center justify-center">
                    <span className="text-4xl text-dark-400">{title.title.charAt(0)}</span>
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex space-x-2">
                      <button className="p-2 bg-primary-500 rounded-full hover:bg-primary-400 transition-colors">
                        <Play className="w-4 h-4 text-white" />
                      </button>
                      <button className="p-2 bg-dark-600 rounded-full hover:bg-dark-500 transition-colors">
                        <Info className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                  {title.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{title.year}</span>
                  <span className="capitalize">{title.kind}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyList
