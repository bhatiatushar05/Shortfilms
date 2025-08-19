import { motion } from 'framer-motion'
import { useAvailableGenres } from '../../../hooks/useCatalog'
import ContentRow from '../../../components/media/ContentRow'
import { SkeletonRow } from '../../../components/ui/Skeleton'

const Categories = () => {
  const { data: genres, isLoading, error } = useAvailableGenres()

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-dark-900">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Categories
          </motion.h1>
          <SkeletonRow title={false} cards={6} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-dark-900">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Categories
          </motion.h1>
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">Error loading categories: {error.message}</p>
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

  if (!genres || genres.length === 0) {
    return (
      <div className="min-h-screen w-full bg-dark-900">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Categories
          </motion.h1>
          <div className="text-center py-20">
            <h3 className="text-xl text-gray-400 mb-2">No categories available</h3>
            <p className="text-gray-500">Check back later for content categories</p>
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
          Browse by Category
        </motion.h1>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {genres.map((genre, index) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-dark-800 border border-dark-600 rounded-xl p-6 hover:border-primary-500/30 transition-all duration-200 cursor-pointer group"
            >
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors duration-200">
                {genre}
              </h3>
              <p className="text-dark-400 text-sm">
                Discover amazing {genre.toLowerCase()} content
              </p>
            </motion.div>
          ))}
        </div>

        {/* Popular Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-8"
        >
          {genres.slice(0, 5).map((genre, index) => (
            <div key={genre}>
              <ContentRow
                title={`Popular ${genre}`}
                items={[]} // This would be populated with actual genre content
                showWatchlist={true}
                showPlayButton={true}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Categories
