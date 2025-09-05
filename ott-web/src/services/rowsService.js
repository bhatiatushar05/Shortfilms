import mockMovieService from './mockMovieService'
import { ROW_KEYS } from '../api/endpoints'

// Rows specification implementation
export class RowsService {
  constructor() {
    this.defaultLimit = 24
  }

  /**
   * Get home page rows
   */
  async getRows(keys = []) {
    try {
      const rows = []

      for (const key of keys) {
        let items = []

        switch (key) {
          case ROW_KEYS.POPULAR:
            // Get popular movies from mock service
            items = { items: await this.getPopularRow() }
            break

          case ROW_KEYS.TRENDING:
            // Get trending movies from mock service
            items = { items: await this.getTrendingRow() }
            break

          case ROW_KEYS.NEW:
            // Get new movies from mock service
            items = { items: await this.getNewRow() }
            break

          case ROW_KEYS.CONTINUE:
            // TODO: Implement user progress
            items = { items: [] }
            break

          case ROW_KEYS.MYLIST:
            // TODO: Implement user watchlist
            items = { items: [] }
            break

          default:
            if (key.startsWith(ROW_KEYS.GENRE_PREFIX)) {
              const genre = key.replace(ROW_KEYS.GENRE_PREFIX, '')
              items = await this.getGenreRow(genre)
            } else {
              items = { items: [] }
            }
            break
        }

        rows.push({
          key,
          name: this.getRowDisplayName(key),
          items: items.items || []
        })
      }

      return rows
    } catch (error) {
      console.error('Error fetching rows:', error)
      throw error
    }
  }

  /**
   * Popular: sort by rating desc limit 24
   */
  async getPopularRow() {
    try {
      const movies = await mockMovieService.getMovies()
      // Sort by rating (alphabetical for now, you can implement proper rating later)
      return movies
        .sort((a, b) => (a.rating || '').localeCompare(b.rating || ''))
        .slice(0, this.defaultLimit)
    } catch (error) {
      console.error('Error fetching popular row:', error)
      return []
    }
  }

  /**
   * Trending: sort by creation date desc limit 24
   */
  async getTrendingRow() {
    try {
      const movies = await mockMovieService.getMovies()
      // Sort by creation date (newest first)
      return movies
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, this.defaultLimit)
    } catch (error) {
      console.error('Error fetching trending row:', error)
      return []
    }
  }

  /**
   * New: sort by creation date desc limit 24
   */
  async getNewRow() {
    try {
      const movies = await mockMovieService.getMovies()
      // Sort by creation date (newest first)
      return movies
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, this.defaultLimit)
    } catch (error) {
      console.error('Error fetching new row:', error)
      return []
    }
  }

  /**
   * Continue: user progress updatedAt desc limit 24
   * TODO: Implement user progress tracking
   */
  async getContinueRow() {
    try {
      // For now, return empty array
      // In the future, this will query the progress table
      // and join with titles to get user's continue watching
      return []
    } catch (error) {
      console.error('Error fetching continue row:', error)
      return []
    }
  }

  /**
   * MyList: user watchlist addedAt desc limit 24
   * TODO: Implement user watchlist
   */
  async getMyListRow() {
    try {
      // For now, return empty array
      // In the future, this will query the watchlist table
      // and join with titles to get user's watchlist
      return []
    } catch (error) {
      console.error('Error fetching mylist row:', error)
      return []
    }
  }

  /**
   * Genre: filter by genre name creation date desc limit 24
   */
  async getGenreRow(genre) {
    try {
      const movies = await mockMovieService.getMoviesByGenre(genre)
      // Sort by creation date (newest first)
      return movies
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, this.defaultLimit)
    } catch (error) {
      console.error(`Error fetching genre row for ${genre}:`, error)
      return []
    }
  }

  /**
   * Get display name for row keys
   */
  getRowDisplayName(key) {
    const names = {
      [ROW_KEYS.POPULAR]: 'Popular',
      [ROW_KEYS.TRENDING]: 'Trending Now',
      [ROW_KEYS.NEW]: 'New Releases',
      [ROW_KEYS.CONTINUE]: 'Continue Watching',
      [ROW_KEYS.MYLIST]: 'My List'
    }

    if (key.startsWith(ROW_KEYS.GENRE_PREFIX)) {
      const genre = key.replace(ROW_KEYS.GENRE_PREFIX, '')
      return `${genre.charAt(0).toUpperCase() + genre.slice(1)}`
    }

    return names[key] || key
  }

  /**
   * Get all available genres for filtering
   */
  async getAvailableGenres() {
    try {
      const movies = await mockMovieService.getMovies()
      // Extract unique genres from all movies
      const allGenres = movies.flatMap(movie => movie.genres || [])
      const uniqueGenres = [...new Set(allGenres)].sort()
      return uniqueGenres
    } catch (error) {
      console.error('Error fetching available genres:', error)
      return []
    }
  }

  /**
   * Get row with custom query parameters
   */
  async getCustomRow(query, options = {}) {
    try {
      const {
        sort = 'new',
        limit = this.defaultLimit,
        filters = {}
      } = options

      let movies = await mockMovieService.getMovies()

      // Apply filters
      if (filters.genre) {
        movies = movies.filter(movie => 
          movie.genres.some(g => g.toLowerCase().includes(filters.genre.toLowerCase()))
        )
      }

      if (filters.year) {
        movies = movies.filter(movie => movie.year === parseInt(filters.year))
      }

      if (filters.kind) {
        movies = movies.filter(movie => movie.kind === filters.kind)
      }

      // Apply sorting
      switch (sort) {
        case 'trending':
          // Sort by creation date (newest first)
          movies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
        case 'top':
          // Sort by rating (alphabetical for now)
          movies.sort((a, b) => (a.rating || '').localeCompare(b.rating || ''))
          break
        case 'new':
        default:
          // Sort by creation date (newest first)
          movies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
      }

      // Apply limit
      return movies.slice(0, limit)
    } catch (error) {
      console.error('Error fetching custom row:', error)
      return []
    }
  }
}

export default new RowsService()
