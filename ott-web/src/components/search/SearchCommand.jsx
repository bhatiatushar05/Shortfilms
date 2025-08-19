import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, TrendingUp, Film, Tv, Video, X } from 'lucide-react'
import { useNavigationStore } from '../../store/navigationStore'
import { useSearch } from '../../hooks/useCatalog'

const SearchCommand = () => {
  const navigate = useNavigate()
  const { isCommandOpen, openCommand, closeCommand } = useNavigationStore()
  const [query, setQuery] = useState('')
  const { data: searchResults, isLoading } = useSearch(query)

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        openCommand()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [openCommand])

  // Recent searches (mock data)
  const recentSearches = [
    { id: 1, query: 'Avengers', type: 'movie', icon: Film },
    { id: 2, query: 'Breaking Bad', type: 'series', icon: Tv },
    { id: 3, query: 'Action movies', type: 'category', icon: TrendingUp },
  ]

  // Trending searches (mock data)
  const trendingSearches = [
    { id: 1, query: 'Marvel', type: 'franchise', icon: TrendingUp },
    { id: 2, query: 'Netflix Originals', type: 'category', icon: Video },
    { id: 3, query: 'Comedy', type: 'genre', icon: TrendingUp },
  ]

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery)
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    closeCommand()
  }

  const handleResultClick = (result) => {
    navigate(`/title/${result.id}`)
    closeCommand()
  }

  const getIcon = (type) => {
    switch (type) {
      case 'movie':
        return Film
      case 'series':
        return Tv
      case 'video':
        return Video
      default:
        return Search
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'movie':
        return 'Movie'
      case 'series':
        return 'Series'
      case 'video':
        return 'Video'
      default:
        return 'Content'
    }
  }

  return (
    <AnimatePresence>
      {isCommandOpen && (
        <motion.div
          className="fixed inset-0 z-modal bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="fixed inset-0 z-modal flex items-start justify-center pt-20"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full max-w-2xl mx-4">
              <div className="bg-dark-800/95 border border-white/10 backdrop-blur-md rounded-2xl shadow-glass">
                <div className="flex items-center border-b border-white/10 px-4 py-3">
                  <Search className="w-5 h-5 text-dark-300 mr-3" />
                  <input
                    type="text"
                    placeholder="Search movies, series, actors..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white placeholder:text-dark-300 focus:ring-0 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={closeCommand}
                    className="p-2 rounded-xl glass-overlay hover:glass-overlay-hover transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {/* Recent Searches */}
                  {!query && (
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider text-dark-300">
                        Recent Searches
                      </h3>
                      <div className="space-y-2">
                        {recentSearches.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSearch(item.query)}
                              className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200 text-left"
                            >
                              <Icon className="w-4 h-4 text-primary-400" />
                              <span>{item.query}</span>
                              <span className="ml-auto text-xs text-dark-300">{getTypeLabel(item.type)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  {!query && (
                    <>
                      <div className="border-t border-white/10 mx-4"></div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider text-dark-300">
                          Trending
                        </h3>
                        <div className="space-y-2">
                          {trendingSearches.map((item) => {
                            const Icon = item.icon
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleSearch(item.query)}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200 text-left"
                              >
                                <Icon className="w-4 h-4 text-accent-400" />
                                <span>{item.query}</span>
                                <span className="ml-auto text-xs text-dark-300">{getTypeLabel(item.type)}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Search Results */}
                  {query && (
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider text-dark-300">
                        Search Results
                      </h3>
                      {isLoading ? (
                        <div className="text-center text-dark-300 py-6">
                          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                          Searching...
                        </div>
                      ) : searchResults && searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.slice(0, 8).map((result) => {
                            const Icon = getIcon(result.kind)
                            return (
                              <button
                                key={result.id}
                                onClick={() => handleResultClick(result)}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200 text-left"
                              >
                                <Icon className="w-4 h-4 text-primary-400" />
                                <div className="flex-1">
                                  <span className="block">{result.title}</span>
                                  <span className="text-sm text-dark-300">
                                    {result.year} • {getTypeLabel(result.kind)}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-dark-300 text-center py-6">
                          No results found for "{query}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  {!query && (
                    <>
                      <div className="border-t border-white/10 mx-4"></div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider text-dark-300">
                          Quick Actions
                        </h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => navigate('/movies')}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200 text-left"
                          >
                            <Film className="w-4 h-4 text-primary-400" />
                            <span>Browse Movies</span>
                          </button>
                          <button
                            onClick={() => navigate('/series')}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200 text-left"
                          >
                            <Tv className="w-4 h-4 text-primary-400" />
                            <span>Browse Series</span>
                          </button>
                          <button
                            onClick={() => navigate('/trending')}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-white hover:bg-white/10 rounded-xl transition-colors duration-200 text-left"
                          >
                            <TrendingUp className="w-4 h-4 text-accent-400" />
                            <span>Trending Now</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-white/10 text-xs text-dark-300">
                  <div className="flex items-center justify-between">
                    <span>Press Esc to close</span>
                    <span>Use ↑↓ to navigate, Enter to select</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SearchCommand
