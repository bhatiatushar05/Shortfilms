import { supabase } from '../lib/supabase'

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
      let query = supabase
        .from('v_title_summary')
        .select('*', { count: 'exact' })

      // Apply search filter
      if (q && q !== 'all') {
        // Search matches title, tags, and synopsis
        // Note: In Supabase, we'll use full-text search on title for now
        // For full implementation, you'd want to create a search vector
        query = query.or(`title.ilike.%${q}%,synopsis.ilike.%${q}%`)
      }

      // Apply genre filter
      if (genre) {
        query = query.contains('genres', [genre])
      }

      // Apply year filter
      if (year) {
        query = query.eq('year', year)
      }

      // Apply kind filter
      if (kind) {
        query = query.eq('kind', kind)
      }

      // Apply sorting
      switch (sort) {
        case 'trending':
          // TODO: Implement popularity score field
          // For now, fallback to recent views (created_at)
          query = query.order('created_at', { ascending: false })
          break
        case 'top':
          // TODO: Implement rating or editorial score
          // For now, fallback to rating
          query = query.order('rating', { ascending: false })
          break
        case 'new':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      // Apply pagination
      query = query.range(offset, offset + finalPageSize - 1)

      const { data: items, count, error } = await query

      if (error) throw error

      const total = count || 0
      const hasMore = offset + finalPageSize < total

      return {
        items: items || [],
        page,
        pageSize: finalPageSize,
        total,
        hasMore
      }
    } catch (error) {
      console.error('Error fetching catalog:', error)
      
      // If it's a database schema issue, return empty catalog instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return {
          items: [],
          page,
          pageSize: finalPageSize,
          total: 0,
          hasMore: false
        }
      }
      
      throw error
    }
  }

  /**
   * Get title details with seasons/episodes for series
   */
  async getTitle(id) {
    try {
      // Get title details
      const { data: title, error: titleError } = await supabase
        .from('titles')
        .select('*')
        .eq('id', id)
        .single()

      if (titleError) throw titleError

      if (title.kind === 'series') {
        // Get seasons with episodes
        const { data: seasons, error: seasonsError } = await supabase
          .from('seasons')
          .select(`
            *,
            episodes:episodes(*)
          `)
          .eq('title_id', id)
          .order('season_number', { ascending: true })

        if (seasonsError) throw seasonsError

        // Sort episodes within each season
        seasons?.forEach(season => {
          season.episodes?.sort((a, b) => a.episode_number - b.episode_number)
        })

        return {
          ...title,
          seasons: seasons || []
        }
      }

      // For movies, return as is (already has runtimeSec and playbackUrl)
      return title
    } catch (error) {
      console.error('Error fetching title:', error)
      
      // If it's a database schema issue, return null instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return null
      }
      
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
            // TODO: Implement popularity score
            items = await this.getCatalog({ sort: 'top', pageSize: 24 })
            break

          case 'trending':
            // TODO: Implement last 7 days view count
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
