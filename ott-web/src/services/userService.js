import { supabase } from '../lib/supabase'

// User features service for watchlist, progress, and continue watching
export class UserService {
  constructor() {
    this.user = null
  }

  /**
   * Set current user
   */
  setUser(user) {
    this.user = user
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user
  }

  /**
   * Check if service is ready (has user)
   */
  isReady() {
    // Check if user exists and has a valid ID
    const ready = !!this.user && !!this.user.id && typeof this.user.id === 'string' && this.user.id.length > 0
    if (!ready && this.user) {
      console.warn('UserService not ready:', { 
        hasUser: !!this.user, 
        userId: this.user?.id, 
        userIdType: typeof this.user?.id,
        userIdLength: this.user?.id?.length 
      })
    }
    return ready
  }

  /**
   * Toggle watchlist - add if not present, remove if present
   */
  async toggleWatchlist(titleId) {
    try {
      // Early return if not ready
      if (!this.isReady()) {
        throw new Error('User not authenticated')
      }

      // Check if Supabase client is available
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Check if title is already in watchlist
      const { data: existing, error: checkError } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', this.user.id)
        .eq('title_id', titleId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existing) {
        // Remove from watchlist
        const { error: deleteError } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', this.user.id)
          .eq('title_id', titleId)

        if (deleteError) throw deleteError

        return {
          ok: true,
          inList: false
        }
      } else {
        // Add to watchlist
        const { error: insertError } = await supabase
          .from('watchlist')
          .insert({
            user_id: this.user.id,
            title_id: titleId
          })

        if (insertError) throw insertError

        return {
          ok: true,
          inList: true
        }
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
      throw error
    }
  }

  /**
   * Check if title is in user's watchlist
   */
  async isInWatchlist(titleId) {
    try {
      // Early return if not ready
      if (!this.isReady()) {
        return false
      }

      if (!titleId) {
        console.warn('No titleId provided to isInWatchlist')
        return false
      }

      // Check if Supabase client is available
      if (!supabase) {
        console.error('Supabase client not available')
        return false
      }

      const { data, error } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', this.user.id)
        .eq('title_id', titleId)
        .maybeSingle()

      if (error) {
        console.error('Error checking watchlist status:', error)
        
        // Handle specific Supabase errors
        if (error.code === 'PGRST116') {
          // No rows returned, which is fine
          return false
        }
        
        if (error.status === 406) {
          console.error('Supabase 406 error - possible RLS or query format issue:', error)
          return false
        }
        
        // Don't throw, just return false
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error checking watchlist status:', error)
      
      // If it's a database schema issue, return false instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return false
      }
      
      return false
    }
  }

  /**
   * Get user's watchlist
   */
  async getWatchlist() {
    try {
      // Early return if not ready
      if (!this.isReady()) {
        return []
      }

      // Check if Supabase client is available
      if (!supabase) {
        console.error('Supabase client not available')
        return []
      }

      // First, get the watchlist entries
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', this.user.id)
        .order('added_at', { ascending: false })

      if (watchlistError) {
        console.error('Error fetching watchlist entries:', watchlistError)
        return []
      }

      if (!watchlistData || watchlistData.length === 0) {
        return []
      }

      // Then, get the titles for each watchlist entry
      const titleIds = watchlistData.map(item => item.title_id)
      const { data: titlesData, error: titlesError } = await supabase
        .from('titles')
        .select('*')
        .in('id', titleIds)

      if (titlesError) {
        console.error('Error fetching titles for watchlist:', titlesError)
        // Return watchlist entries without title details
        return watchlistData.map(item => ({
          id: item.title_id,
          kind: 'movie', // fallback
          slug: item.title_id,
          title: `Title ${item.title_id}`,
          year: null,
          genres: [],
          posterUrl: null,
          rating: null,
          runtimeSec: null,
          seasonCount: null
        }))
      }

      // Create a map of titles by ID for quick lookup
      const titlesMap = {}
      titlesData?.forEach(title => {
        titlesMap[title.id] = title
      })

      // Transform to match TitleSummary format
      return watchlistData.map(item => {
        const title = titlesMap[item.title_id]
        if (!title) {
          // Fallback if title not found
          return {
            id: item.title_id,
            kind: 'movie',
            slug: item.title_id,
            title: `Title ${item.title_id}`,
            year: null,
            genres: [],
            posterUrl: null,
            rating: null,
            runtimeSec: null,
            seasonCount: null
          }
        }

        return {
          id: title.id,
          kind: title.kind,
          slug: title.slug,
          title: title.title,
          year: title.year,
          genres: title.genres || [],
          posterUrl: title.poster_url,
          rating: title.rating,
          runtimeSec: title.runtime_sec,
          seasonCount: title.kind === 'series' ? 
            // TODO: Get actual season count from seasons table
            2 : null
        }
      })
    } catch (error) {
      console.error('Error fetching watchlist:', error)
      
      // If it's a database schema issue, return empty array instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return []
      }
      
      return []
    }
  }

  /**
   * Update user's progress for a title
   */
  async updateProgress(titleId, positionSec, durationSec) {
    try {
      // Check if service is ready
      if (!this.isReady()) {
        throw new Error('User not authenticated')
      }

      // Validate titleId
      if (!titleId) {
        throw new Error('Title ID is required')
      }

      // Ensure we have valid values for required fields
      const validPositionSec = Math.max(0, Math.floor(positionSec || 0))
      const validDurationSec = Math.max(1, Math.floor(durationSec || 1)) // Ensure duration is at least 1 second

      // Throttle progress updates to avoid too many database calls
      const now = Date.now()
      if (this._lastProgressUpdate && 
          this._lastProgressUpdate.titleId === titleId &&
          (now - this._lastProgressUpdate.timestamp) < 5000) { // Only update every 5 seconds
        return { ok: true } // Skip frequent updates
      }

      const { error } = await supabase
        .from('progress')
        .upsert({
          user_id: this.user.id,
          title_id: titleId,
          position_sec: validPositionSec,
          duration_sec: validDurationSec,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,title_id'
        })

      if (error) throw error

      // Cache the last update to avoid duplicates
      this._lastProgressUpdate = {
        titleId,
        positionSec: validPositionSec,
        durationSec: validDurationSec,
        timestamp: now
      }

      // Clean up old cache entries (older than 1 hour)
      if (this._lastProgressUpdate.timestamp < (now - 3600000)) {
        this._lastProgressUpdate = null
      }

      return {
        ok: true
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      throw error
    }
  }

  /**
   * Get user's continue watching
   */
  async getContinueWatching() {
    try {
      if (!this.user) {
        return []
      }

      const { data, error } = await supabase
        .from('progress')
        .select(`
          *,
          title:titles(*)
        `)
        .eq('user_id', this.user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Transform to match continue watching format
      return data?.map(item => ({
        titleId: item.title_id,
        positionSec: item.position_sec,
        durationSec: item.duration_sec,
        updatedAt: item.updated_at,
        title: {
          id: item.title.id,
          kind: item.title.kind,
          slug: item.title.slug,
          title: item.title.title,
          year: item.title.year,
          genres: item.title.genres,
          posterUrl: item.title.poster_url,
          rating: item.title.rating,
          runtimeSec: item.title.runtime_sec,
          seasonCount: item.title.kind === 'series' ? 
            // TODO: Get actual season count from seasons table
            2 : null
        }
      })) || []
    } catch (error) {
      console.error('Error fetching continue watching:', error)
      
      // If it's a database schema issue, return empty array instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return []
      }
      
      return []
    }
  }

  /**
   * Clear progress update cache (useful when switching titles)
   */
  clearProgressCache() {
    this._lastProgressUpdate = null
  }

  /**
   * Get user's progress for a specific title
   */
  async getProgress(titleId) {
    try {
      if (!this.user) {
        return null
      }

      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', this.user.id)
        .eq('title_id', titleId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Error fetching progress:', error)
      
      // If it's a database schema issue, return null instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return null
      }
      
      return null
    }
  }

  /**
   * Clear user's progress for a title
   */
  async clearProgress(titleId) {
    try {
      if (!this.user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('progress')
        .delete()
        .eq('user_id', this.user.id)
        .eq('title_id', titleId)

      if (error) throw error

      return {
        ok: true
      }
    } catch (error) {
      console.error('Error clearing progress:', error)
      throw error
    }
  }

  /**
   * Get user's viewing history
   */
  async getViewingHistory() {
    try {
      if (!this.user) {
        return []
      }

      const { data, error } = await supabase
        .from('progress')
        .select(`
          *,
          title:titles(*)
        `)
        .eq('user_id', this.user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Transform to match history format
      return data?.map(item => ({
        titleId: item.title_id,
        lastWatched: item.updated_at,
        progress: Math.round((item.position_sec / item.duration_sec) * 100),
        title: {
          id: item.title.id,
          kind: item.title.kind,
          slug: item.title.slug,
          title: item.title.title,
          year: item.title.year,
          genres: item.title.genres,
          posterUrl: item.title.poster_url,
          rating: item.title.rating
        }
      })) || []
    } catch (error) {
      console.error('Error fetching viewing history:', error)
      
      // If it's a database schema issue, return empty array instead of throwing
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Database tables not set up yet. Please run the schema setup first.')
        return []
      }
      
      return []
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences() {
    try {
      if (!this.user) {
        return null
      }

      // TODO: Implement user preferences table
      // For now, return default preferences
      return {
        autoplay: true,
        autoplayNext: true,
        subtitles: 'en',
        quality: 'auto',
        theme: 'dark'
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return null
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences) {
    try {
      if (!this.user) {
        throw new Error('User not authenticated')
      }

      // TODO: Implement user preferences table
      // For now, just return success
      console.log('Updating preferences:', preferences)
      
      return {
        ok: true
      }
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }
}

export default new UserService()
