import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

const Continue = () => {
  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Continue Watching
        </motion.h1>
        
        <div className="text-center py-20">
          <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-gray-400 mb-2">No content in progress</h3>
          <p className="text-gray-500">Start watching to see your progress here</p>
        </div>
      </div>
    </div>
  )
}

export default Continue
