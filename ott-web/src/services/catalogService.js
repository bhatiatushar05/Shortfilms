import mockMovieService from './mockMovieService'

// Search, sort, and pagination rules implementation
export class CatalogService {
  constructor() {
    this.maxPageSize = 48
    this.defaultPageSize = 24
  }

  /**
   * Get catalog with filters, search, sort, and pagination
   */
  async getCatalog(params = {}) {
    const {
      q = '',
      genre = '',
      year = null,
      kind = '',
      sort = 'new',
      page = 1,
      pageSize = this.defaultPageSize
    } = params

    // Enforce max page size
    const finalPageSize = Math.min(pageSize, this.maxPageSize)
    const offset = (page - 1) * finalPageSize

    try {
      // Get all movies from mock service
      let movies = await mockMovieService.getMovies()

      // Apply search filter
      if (q && q !== 'all') {
        movies = await mockMovieService.searchMovies(q)
      }

      // Apply genre filter
      if (genre) {
        movies = movies.filter(movie => 
          movie.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
        )
      }

      // Apply year filter
      if (year) {
        movies = movies.filter(movie => movie.year === parseInt(year))
      }

      // Apply kind filter
      if (kind) {
        movies = movies.filter(movie => movie.kind === kind)
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

      const total = movies.length
      const hasMore = offset + finalPageSize < total

      // Apply pagination
      const paginatedMovies = movies.slice(offset, offset + finalPageSize)

      return {
        items: paginatedMovies,
        page,
        pageSize: finalPageSize,
        total,
        hasMore
      }
    } catch (error) {
      console.error('Error fetching catalog:', error)
      throw error
    }
  }

  /**
   * Get title details with seasons/episodes for series
   */
  async getTitle(id) {
    try {
      const title = await mockMovieService.getMovieById(id)
      if (!title) {
        throw new Error('Title not found')
      }
      return title
    } catch (error) {
      console.error('Error fetching title:', error)
      throw error
    }
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
          case 'popular':
            // Get top rated movies
            items = await this.getCatalog({ sort: 'top', pageSize: 24 })
            break

          case 'trending':
            // Get newest movies
            items = await this.getCatalog({ sort: 'new', pageSize: 24 })
            break

          case 'new':
            items = await this.getCatalog({ sort: 'new', pageSize: 24 })
            break

          case 'continue':
            // TODO: Implement user progress
            items = { items: [] }
            break

          case 'mylist':
            // TODO: Implement user watchlist
            items = { items: [] }
            break

          default:
            if (key.startsWith('genre-')) {
              const genre = key.replace('genre-', '')
              items = await this.getCatalog({ genre, pageSize: 24 })
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
   * Get display name for row keys
   */
  getRowDisplayName(key) {
    const names = {
      popular: 'Popular',
      trending: 'Trending Now',
      new: 'New Releases',
      continue: 'Continue Watching',
      mylist: 'My List'
    }

    if (key.startsWith('genre-')) {
      const genre = key.replace('genre-', '')
      return `${genre.charAt(0).toUpperCase() + genre.slice(1)}`
    }

    return names[key] || key
  }
}

export default new CatalogService()
