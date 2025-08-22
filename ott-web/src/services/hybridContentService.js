import { supabase } from '../lib/supabase';

// Configuration for hybrid storage
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  PIPELINE_ENDPOINTS: {
    UPLOAD_MOVIE: '/api/pipeline/upload-movie',
    UPLOAD_EPISODE: '/api/pipeline/upload-episode',
    UPLOAD_POSTER: '/api/pipeline/upload-poster',
    GET_MOVIE: '/api/pipeline/movie',
    GET_SERIES: '/api/pipeline/series',
    STORAGE_STATS: '/api/pipeline/storage-stats',
    HEALTH: '/api/pipeline/health'
  }
};

class HybridContentService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.endpoints = API_CONFIG.PIPELINE_ENDPOINTS;
  }

  /**
   * Get authentication token from Supabase
   */
  async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }
    return session.access_token;
  }

  /**
   * Upload movie through hybrid pipeline
   */
  async uploadMovie(movieFile, metadata = {}) {
    try {
      const token = await this.getAuthToken();
      
      const formData = new FormData();
      formData.append('movie', movieFile);
      
      // Add metadata
      Object.keys(metadata).forEach(key => {
        if (metadata[key] !== undefined && metadata[key] !== null) {
          formData.append(key, metadata[key]);
        }
      });

      const response = await fetch(`${this.baseUrl}${this.endpoints.UPLOAD_MOVIE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Movie upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload episode through hybrid pipeline
   */
  async uploadEpisode(episodeFile, metadata = {}) {
    try {
      const token = await this.getAuthToken();
      
      const formData = new FormData();
      formData.append('episode', episodeFile);
      
      // Add metadata
      Object.keys(metadata).forEach(key => {
        if (metadata[key] !== undefined && metadata[key] !== null) {
          formData.append(key, metadata[key]);
        }
      });

      const response = await fetch(`${this.baseUrl}${this.endpoints.UPLOAD_EPISODE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Episode upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload poster/thumbnail through hybrid pipeline
   */
  async uploadPoster(posterFile, contentType, contentId) {
    try {
      const token = await this.getAuthToken();
      
      const formData = new FormData();
      formData.append('poster', posterFile);
      formData.append('contentType', contentType);
      formData.append('contentId', contentId);

      const response = await fetch(`${this.baseUrl}${this.endpoints.UPLOAD_POSTER}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Poster upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Poster upload failed:', error);
      throw error;
    }
  }

  /**
   * Get movie with hybrid storage URLs
   */
  async getMovie(id) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.GET_MOVIE}/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get movie');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to get movie:', error);
      throw error;
    }
  }

  /**
   * Get series with episodes
   */
  async getSeries(id) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.GET_SERIES}/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get series');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to get series:', error);
      throw error;
    }
  }

  /**
   * Get hybrid storage statistics
   */
  async getStorageStats() {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}${this.endpoints.STORAGE_STATS}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get storage stats');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw error;
    }
  }

  /**
   * Check pipeline health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.HEALTH}`);
      
      if (!response.ok) {
        throw new Error('Pipeline health check failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Get content from Supabase (fallback for existing content)
   */
  async getContentFromSupabase(id, type = 'movie') {
    try {
      if (type === 'movie') {
        const { data, error } = await supabase
          .from('titles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return { success: true, data };
      } else if (type === 'series') {
        const { data: title, error: titleError } = await supabase
          .from('titles')
          .select('*')
          .eq('id', id)
          .single();

        if (titleError) throw titleError;

        const { data: episodes, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .eq('title_id', id)
          .order('season_number, episode_number');

        if (episodesError) console.warn('Failed to get episodes');

        return {
          success: true,
          data: {
            ...title,
            episodes: episodes || []
          }
        };
      }
    } catch (error) {
      console.error('Failed to get content from Supabase:', error);
      throw error;
    }
  }

  /**
   * Smart content retrieval - tries hybrid pipeline first, falls back to Supabase
   */
  async getContent(id, type = 'movie') {
    try {
      // Try hybrid pipeline first
      if (type === 'movie') {
        return await this.getMovie(id);
      } else if (type === 'series') {
        return await this.getSeries(id);
      }
    } catch (error) {
      console.log('Hybrid pipeline failed, falling back to Supabase...');
      
      // Fallback to Supabase
      return await this.getContentFromSupabase(id, type);
    }
  }
}

export default new HybridContentService();
