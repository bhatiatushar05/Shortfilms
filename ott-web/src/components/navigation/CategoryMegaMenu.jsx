import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Film, Tv, Video, Music, Gamepad2, BookOpen, Heart, Star, Zap, TrendingUp } from 'lucide-react'

const CategoryMegaMenu = ({ isOpen, onClose }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const categories = [
    {
      id: 'movies',
      label: 'Movies',
      icon: Film,
      color: 'from-blue-500 to-blue-600',
      subcategories: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']
    },
    {
      id: 'series',
      label: 'TV Series',
      icon: Tv,
      color: 'from-purple-500 to-purple-600',
      subcategories: ['Drama', 'Comedy', 'Action', 'Mystery', 'Romance', 'Sci-Fi', 'Reality']
    },
    {
      id: 'shorts',
      label: 'Shorts',
      icon: Video,
      color: 'from-orange-500 to-orange-600',
      subcategories: ['Comedy', 'Music', 'Gaming', 'Lifestyle', 'News', 'Sports', 'Tech']
    },
    {
      id: 'music',
      label: 'Music',
      icon: Music,
      color: 'from-pink-500 to-pink-600',
      subcategories: ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'Country']
    },
    {
      id: 'gaming',
      label: 'Gaming',
      icon: Gamepad2,
      color: 'from-green-500 to-green-600',
      subcategories: ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Puzzle']
    },
    {
      id: 'books',
      label: 'Books',
      icon: BookOpen,
      color: 'from-yellow-500 to-yellow-600',
      subcategories: ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Biography', 'Self-Help']
    }
  ]

  const featuredContent = [
    { id: 1, title: 'Trending Now', icon: TrendingUp, color: 'from-accent-500 to-accent-600' },
    { id: 2, title: 'New Releases', icon: Star, color: 'from-primary-500 to-primary-600' },
    { id: 3, title: 'Staff Picks', icon: Heart, color: 'from-pink-500 to-pink-600' },
    { id: 4, title: 'Coming Soon', icon: Zap, color: 'from-yellow-500 to-yellow-600' }
  ]

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-full left-0 right-0 bg-dark-800/95 border border-white/10 backdrop-blur-md rounded-2xl shadow-glass z-modal mt-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseLeave={onClose}
        >
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Categories Grid */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Browse Categories</h3>
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <motion.div
                        key={category.id}
                        variants={itemVariants}
                        className="relative group"
                        onMouseEnter={() => setHoveredCategory(category.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <Link
                          to={`/categories/${category.id}`}
                          className="block p-4 rounded-xl glass-overlay hover:glass-overlay-hover transition-all duration-200 group-hover:scale-105"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-8 h-8 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-medium">{category.label}</span>
                          </div>
                          
                          <div className="space-y-1">
                            {category.subcategories.slice(0, 3).map((sub, subIndex) => (
                              <motion.div
                                key={sub}
                                className="text-dark-300 text-sm"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: subIndex * 0.1 }}
                              >
                                {sub}
                              </motion.div>
                            ))}
                            {category.subcategories.length > 3 && (
                              <div className="text-primary-400 text-sm font-medium">
                                +{category.subcategories.length - 3} more
                              </div>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Featured Content */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Featured</h3>
                <div className="space-y-3">
                  {featuredContent.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="group"
                      >
                        <Link
                          to={`/${item.title.toLowerCase().replace(' ', '-')}`}
                          className="flex items-center space-x-3 p-3 rounded-xl glass-overlay hover:glass-overlay-hover transition-all duration-200 group-hover:scale-105"
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{item.title}</div>
                            <div className="text-dark-300 text-sm">Discover amazing content</div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 p-4 glass-overlay rounded-xl">
                  <h4 className="text-white font-medium mb-3">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-primary-400 font-bold text-lg">10K+</div>
                      <div className="text-dark-300">Titles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-accent-400 font-bold text-lg">50+</div>
                      <div className="text-dark-300">Genres</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CategoryMegaMenu
