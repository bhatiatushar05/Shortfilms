import { motion } from 'framer-motion'
import { useCatalog } from '../../../hooks/useCatalog'
import ContentRow from '../../../components/media/ContentRow'
import { SkeletonRow } from '../../../components/ui/Skeleton'

const Trending = () => {
  const { data: trendingContent, isLoading, error } = useCatalog({ sort: 'trending' })

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-dark-900">
        <div className="px-4 sm:px-6 lg:px-8 py-8 ml-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Trending Now
          </motion.h1>
          <SkeletonRow title={false} cards={6} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-dark-900">
        <div className="px-4 sm:px-6 lg:px-8 py-8 ml-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Trending Now
          </motion.h1>
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">Error loading trending content: {error.message}</p>
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

  if (!trendingContent || trendingContent.items.length === 0) {
    return (
      <div className="min-h-screen w-full bg-dark-900">
        <div className="px-4 sm:px-6 lg:px-8 py-8 ml-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Trending Now
          </motion.h1>
          <div className="text-center py-20">
            <h3 className="text-xl text-gray-400 mb-2">No trending content available</h3>
            <p className="text-gray-500">Check back later for trending shows and movies</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-dark-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Trending Now
        </motion.h1>

        {/* Trending Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ContentRow
            title="What's Hot Right Now"
            items={trendingContent.items}
            showWatchlist={true}
            showPlayButton={true}
          />
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-600 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-3">About Trending</h3>
            <p className="text-gray-400 text-sm">
              Our trending algorithm considers view count, user ratings, and recent activity 
              to show you what's popular right now. Content updates every few hours to 
              keep you in the loop with the latest buzz.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Trending
