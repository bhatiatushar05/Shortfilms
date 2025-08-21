import { motion } from 'framer-motion'
import { useSeriesCatalog } from '../../../hooks/useCatalog'
import ContentRow from '../../../components/media/ContentRow'
import { SkeletonRow } from '../../../components/ui/Skeleton'

const Series = () => {
  const { data: series, isLoading, error } = useSeriesCatalog()

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black">
        <div className="px-4 sm:px-6 lg:px-8 py-8 ml-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Series
          </motion.h1>
          <SkeletonRow title={false} cards={6} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-black">
        <div className="px-4 sm:px-6 lg:px-8 py-8 ml-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Series
          </motion.h1>
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">Error loading series: {error.message}</p>
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

  if (!series || series.items.length === 0) {
    return (
      <div className="min-h-screen w-full bg-black">
        <div className="px-4 sm:px-6 lg:px-8 py-8 ml-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Series
          </motion.h1>
          <div className="text-center py-20">
            <h3 className="text-xl text-gray-400 mb-2">No series available</h3>
            <p className="text-gray-500">Check back later for new releases</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Series ({series.total || series.items.length})
        </motion.h1>

        {/* All Series Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ContentRow
            title="All Series"
            items={series.items}
            showWatchlist={true}
            showPlayButton={true}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default Series
