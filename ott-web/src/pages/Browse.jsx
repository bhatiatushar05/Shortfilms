import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Star, Clock, Plus } from 'lucide-react'
import ContentCard from '../components/ContentCard'
import ContentRow from '../components/ContentRow'

const Browse = () => {
  const [searchParams] = useSearchParams()
  const [featuredContent, setFeaturedContent] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Mock data for now - replace with API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFeaturedContent([
        {
          id: 1,
          title: 'The Great Adventure',
          type: 'movie',
          poster: 'https://via.placeholder.com/400x600/1f2937/ffffff?text=Movie+1',
          rating: 4.5,
          duration: '2h 15m',
          genre: 'Adventure',
          description: 'An epic journey through uncharted territories.'
        },
        {
          id: 2,
          title: 'Mystery Manor',
          type: 'series',
          poster: 'https://via.placeholder.com/400x600/374151/ffffff?text=Series+1',
          rating: 4.2,
          duration: '45m',
          genre: 'Mystery',
          description: 'A gripping mystery that will keep you guessing.'
        }
      ])

      setCategories([
        {
          name: 'Trending Now',
          content: Array.from({ length: 10 }, (_, i) => ({
            id: i + 10,
            title: `Trending Title ${i + 1}`,
            poster: `https://via.placeholder.com/300x450/4b5563/ffffff?text=T${i + 1}`,
            rating: (Math.random() * 2 + 3).toFixed(1),
            type: Math.random() > 0.5 ? 'movie' : 'series'
          }))
        },
        {
          name: 'Popular Movies',
          content: Array.from({ length: 10 }, (_, i) => ({
            id: i + 20,
            title: `Popular Movie ${i + 1}`,
            poster: `https://via.placeholder.com/300x450/6b7280/ffffff?text=M${i + 1}`,
            rating: (Math.random() * 2 + 3).toFixed(1),
            type: 'movie'
          }))
        },
        {
          name: 'Top Series',
          content: Array.from({ length: 10 }, (_, i) => ({
            id: i + 30,
            title: `Top Series ${i + 1}`,
            poster: `https://via.placeholder.com/300x450/9ca3af/ffffff?text=S${i + 1}`,
            rating: (Math.random() * 2 + 3).toFixed(1),
            type: 'series'
          }))
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const searchQuery = searchParams.get('search')
  const category = searchParams.get('category')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      {featuredContent.length > 0 && (
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featuredContent[0].poster}
              alt={featuredContent[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex items-end h-full pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-bold text-white mb-4"
              >
                {featuredContent[0].title}
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center space-x-6 text-white mb-6"
              >
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span>{featuredContent[0].rating}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{featuredContent[0].duration}</span>
                </div>
                <span className="px-3 py-1 bg-primary-600 rounded-full text-sm">
                  {featuredContent[0].genre}
                </span>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg text-gray-300 mb-8 max-w-2xl"
              >
                {featuredContent[0].description}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex space-x-4"
              >
                <button className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors duration-200">
                  <Play className="w-5 h-5" />
                  <span>Play Now</span>
                </button>
                <button className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 text-white px-6 py-3 rounded-lg transition-colors duration-200">
                  <Plus className="w-5 h-5" />
                  <span>Add to List</span>
                </button>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Content Categories */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <ContentRow
              title={category.name}
              content={category.content}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Browse
