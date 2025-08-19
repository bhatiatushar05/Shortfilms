import { supabase } from '../lib/supabase'
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
            // TODO: Implement popularity score
            items = { items: await this.getPopularRow() }
            break

          case ROW_KEYS.TRENDING:
            // TODO: Implement last 7 days view count
            items = { items: await this.getTrendingRow() }
            break

          case ROW_KEYS.NEW:
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
      
      // If it's a database schema issue, return empty rows instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return []
      }
      
      throw error
    }
  }

  /**
   * Popular: sort by popularity score desc limit 24
   * TODO: Implement popularity score field
   * For now, fallback to rating
   */
  async getPopularRow() {
    try {
      const { data, error } = await supabase
        .from('v_title_summary')
        .select('*')
        .order('rating', { ascending: false })
        .limit(this.defaultLimit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching popular row:', error)
      
      // If it's a database schema issue, return empty array instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return []
      }
      
      return []
    }
  }

  /**
   * Trending: trending score desc limit 24
   */
  async getTrendingRow() {
    try {
      const { data, error } = await supabase
        .from('v_title_summary')
        .select('*')
        .order('created_at', { ascending: false })  // Fixed: changed from 'createdAt' to 'created_at'
        .limit(this.defaultLimit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching trending row:', error)
      
      // If it's a database schema issue, return empty array instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return []
      }
      
      return []
    }
  }

  /**
   * New: createdAt desc limit 24
   */
  async getNewRow() {
    try {
      const { data, error } = await supabase
        .from('v_title_summary')
        .select('*')
        .order('created_at', { ascending: false })  // Fixed: changed from 'createdAt' to 'created_at'
        .limit(this.defaultLimit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching new row:', error)
      
      // If it's a database schema issue, return empty array instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return []
      }
      
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
   * Genre: filter by genre name createdAt desc limit 24
   */
  async getGenreRow(genre) {
    try {
      const { data, error } = await supabase
        .from('v_title_summary')
        .select('*')
        .contains('genres', [genre])
        .order('createdAt', { ascending: false })
        .limit(this.defaultLimit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Error fetching genre row for ${genre}:`, error)
      
      // If it's a database schema issue, return empty array instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return []
      }
      
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
      const { data, error } = await supabase
        .from('titles')
        .select('genres')

      if (error) throw error

      // Extract unique genres from all titles
      const allGenres = data?.flatMap(title => title.genres || []) || []
      const uniqueGenres = [...new Set(allGenres)].sort()

      return uniqueGenres
    } catch (error) {
      console.error('Error fetching available genres:', error)
      
      // If it's a database schema issue, return empty array instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return []
      }
      
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

      let supabaseQuery = supabase
        .from('v_title_summary')
        .select('*')

      // Apply filters
      if (filters.genre) {
        supabaseQuery = supabaseQuery.contains('genres', [filters.genre])
      }

      if (filters.year) {
        supabaseQuery = supabaseQuery.eq('year', filters.year)
      }

      if (filters.kind) {
        supabaseQuery = supabaseQuery.eq('kind', filters.kind)
      }

      // Apply sorting
      switch (sort) {
        case 'trending':
          // TODO: Implement popularity score
          supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
          break
        case 'top':
          // TODO: Implement rating or editorial score
          supabaseQuery = supabaseQuery.order('rating', { ascending: false })
          break
        case 'new':
        default:
          supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
          break
      }

      // Apply limit
      supabaseQuery = supabaseQuery.limit(limit)

      const { data, error } = await supabaseQuery

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching custom row:', error)
      
      // If it's a database schema issue, return empty array instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return []
      }
      
      return []
    }
  }
}

export default new RowsService()
