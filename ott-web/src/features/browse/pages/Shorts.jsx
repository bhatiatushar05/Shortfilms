import { motion } from 'framer-motion'
import ContentRow from '../../../components/media/ContentRow'

const Shorts = () => {
  // For now, shorts will show a placeholder since we don't have short-form content
  // In the future, this can be connected to actual short-form video data

  return (
    <div className="min-h-screen w-full bg-dark-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 ml-20">
        {/* Page Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Shorts
        </motion.h1>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center py-20"
        >
          <div className="max-w-md mx-auto">
            <h3 className="text-xl text-gray-400 mb-4">Short-form content coming soon!</h3>
            <p className="text-gray-500 mb-6">
              We're working on bringing you bite-sized entertainment content.
              Stay tuned for updates!
            </p>
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-600">
              <p className="text-sm text-gray-400">
                Shorts will include:
              </p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                <li>• Behind-the-scenes content</li>
                <li>• Movie trailers and teasers</li>
                <li>• Actor interviews</li>
                <li>• Quick reviews and recommendations</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Shorts
