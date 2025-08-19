import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, Filter, X, Sparkles, TrendingUp, Clock } from 'lucide-react'
import { useSearch, useAvailableGenres } from '../../../hooks/useCatalog'
import { useSession } from '../../../hooks/useSession'
import ContentCard from '../../../components/media/ContentCard'
import { SkeletonSearchResults } from '../../../components/ui/Skeleton'
import { cn } from '../../../utils/cn'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthed } = useSession()
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '')
  const [selectedKind, setSelectedKind] = useState(searchParams.get('kind') || '')
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'new')
  const [showFilters, setShowFilters] = useState(false)
  
  // Get search results - now works with filters even without search query
  const { data: searchResults, isLoading, error } = useSearch(
    searchQuery || 'all', // Pass 'all' if no search query to get filtered results
    {
      genre: selectedGenre,
      kind: selectedKind,
      sort: selectedSort
    }
  )
  
  // Get available genres
  const { data: availableGenres } = useAvailableGenres()
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedGenre) params.set('genre', selectedGenre)
    if (selectedKind) params.set('kind', selectedKind)
    if (selectedSort) params.set('sort', selectedSort)
    
    setSearchParams(params, { replace: true })
  }, [searchQuery, selectedGenre, selectedKind, selectedSort, setSearchParams])

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled automatically by the hook
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedGenre('')
    setSelectedKind('')
    setSelectedSort('new')
    setSearchQuery('')
  }

  // Check if any filters are active
  const hasActiveFilters = selectedGenre || selectedKind || selectedSort !== 'new' || searchQuery

  // Get result count
  const resultCount = searchResults?.total || 0

  // Get sort icon and label
  const getSortInfo = (sort) => {
    switch (sort) {
      case 'trending':
        return { icon: TrendingUp, label: 'Trending' }
      case 'top':
        return { icon: Sparkles, label: 'Top Rated' }
      case 'new':
      default:
        return { icon: Clock, label: 'Newest' }
    }
  }

  const currentSort = getSortInfo(selectedSort)

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Search Header */}
      <div className="page-padding py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-primary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies, series, actors..."
                className="w-full pl-14 pr-4 py-4 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200 text-lg shadow-glow"
                autoFocus
              />
            </div>
          </form>

          {/* Search Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Content'}
              </h1>
              <div className="flex items-center gap-4 text-dark-300">
                {hasActiveFilters && (
                  <span className="flex items-center gap-2">
                    <currentSort.icon className="w-4 h-4 text-primary-400" />
                    {currentSort.label}
                  </span>
                )}
                {searchQuery && (
                  <span>
                    {isLoading ? 'Searching...' : `${resultCount} result${resultCount !== 1 ? 's' : ''} found`}
                  </span>
                )}
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium",
                showFilters 
                  ? "bg-primary-500 text-white shadow-glow" 
                  : "bg-dark-800 text-dark-300 hover:bg-dark-700 border border-dark-600/20"
              )}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="bg-dark-800 border border-dark-600/20 rounded-xl p-6 mb-8 shadow-glow"
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Genre Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-4 uppercase tracking-wide">Genre</label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setSelectedGenre('')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                          !selectedGenre 
                            ? "bg-primary-500 text-white shadow-glow" 
                            : "bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600/30"
                        )}
                      >
                        All Genres
                      </button>
                      {availableGenres?.slice(0, 8).map((genre) => (
                        <button
                          key={genre}
                          onClick={() => setSelectedGenre(genre)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                            selectedGenre === genre 
                              ? "bg-primary-500 text-white shadow-glow" 
                              : "bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600/30"
                          )}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Type Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-4 uppercase tracking-wide">Content Type</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedKind('')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                          !selectedKind 
                            ? "bg-primary-500 text-white shadow-glow" 
                            : "bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600/30"
                        )}
                      >
                        All Types
                      </button>
                      <button
                        onClick={() => setSelectedKind('movie')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                          selectedKind === 'movie' 
                            ? "bg-primary-500 text-white shadow-glow" 
                            : "bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600/30"
                        )}
                      >
                        Movies
                      </button>
                      <button
                        onClick={() => setSelectedKind('series')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                          selectedKind === 'series' 
                            ? "bg-primary-500 text-white shadow-glow" 
                            : "bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600/30"
                        )}
                      >
                        Series
                      </button>
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-4 uppercase tracking-wide">Sort By</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedSort('new')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                          selectedSort === 'new' 
                            ? "bg-primary-500 text-white shadow-glow" 
                            : "bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600/30"
                        )}
                      >
                        <Clock className="w-4 h-4" />
                        Newest
                      </button>
                      <button
                        onClick={() => setSelectedSort('trending')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                          selectedSort === 'trending' 
                            ? "bg-primary-500 text-white shadow-glow" 
                            : "bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600/30"
                        )}
                      >
                        <TrendingUp className="w-4 h-4" />
                        Trending
                      </button>
                      <button
                        onClick={() => setSelectedSort('top')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                          selectedSort === 'top' 
                            ? "bg-primary-500 text-white shadow-glow" 
                            : "bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600/30"
                        )}
                      >
                        <Sparkles className="w-4 h-4" />
                        Top Rated
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="mt-8 pt-6 border-t border-dark-600/20">
                    <button
                      onClick={clearFilters}
                      className="flex items-center space-x-3 text-dark-400 hover:text-primary-400 transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-dark-700"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear all filters</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Search Results */}
      <div className="page-padding pb-8">
        {isLoading ? (
          <SkeletonSearchResults />
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-dark-800 border border-dark-600/20 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Search Error</h2>
              <p className="text-dark-300 mb-6">Could not load search results. Please try again.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary px-6 py-3"
              >
                Retry
              </button>
            </div>
          </div>
        ) : searchResults?.items && searchResults.items.length > 0 ? (
          <div>
            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
              {searchResults.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <ContentCard
                    title={item}
                    showWatchlist={true}
                    showPlayButton={true}
                  />
                </motion.div>
              ))}
            </div>

            {/* Load More (if applicable) */}
            {searchResults.hasMore && (
              <div className="text-center mt-8">
                <button className="btn-secondary px-8 py-3">
                  Load More Results
                </button>
              </div>
            )}
          </div>
        ) : hasActiveFilters ? (
          <div className="text-center py-16">
            <div className="bg-dark-800 border border-dark-600/20 rounded-xl p-8 max-w-md mx-auto">
              <SearchIcon className="w-16 h-16 text-dark-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No Results Found</h2>
              <p className="text-dark-300 mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary px-6 py-3"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-dark-800 border border-dark-600/20 rounded-xl p-8 max-w-lg mx-auto">
              <SearchIcon className="w-20 h-20 text-primary-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Start Exploring</h2>
              <p className="text-dark-300 max-w-md mx-auto mb-6">
                Search for your favorite movies, series, or actors to discover new content on Shortcinema.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setSelectedGenre('Action')}
                  className="chip-primary"
                >
                  Action
                </button>
                <button
                  onClick={() => setSelectedGenre('Comedy')}
                  className="chip-primary"
                >
                  Comedy
                </button>
                <button
                  onClick={() => setSelectedGenre('Drama')}
                  className="chip-primary"
                >
                  Drama
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
