const { supabase, isConfigured: isSupabaseConfigured } = require('../config/database');
const awsUploadService = require('./awsUploadService');
const { getPublicURL, isConfigured: isAWSConfigured } = require('../config/aws');
const { config } = require('../config/config');

class HybridStorageService {
  constructor() {
    this.storageType = config.features.awsStorage ? 'hybrid' : 'supabase';
    this.isAWSEnabled = isAWSConfigured();
    this.isSupabaseEnabled = isSupabaseConfigured();
    
    console.log(`🚀 Hybrid Storage Service initialized with type: ${this.storageType}`);
    console.log(`📦 AWS Storage: ${this.isAWSEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`🗄️ Supabase Storage: ${this.isSupabaseEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  }

  /**
   * Check service health
   */
  async healthCheck() {
    try {
      const checks = {
        supabase: this.isSupabaseEnabled,
        aws: this.isAWSEnabled,
        timestamp: new Date().toISOString()
      };

      if (this.isSupabaseEnabled) {
        try {
          const { data, error } = await supabase
            .from('titles')
            .select('count')
            .limit(1);
          
          checks.supabase = !error;
        } catch (error) {
          checks.supabase = false;
          checks.supabaseError = error.message;
        }
      }

      if (this.isAWSEnabled) {
        try {
          const awsHealth = await require('../config/aws').healthCheck();
          checks.aws = awsHealth.status === 'healthy';
          checks.awsDetails = awsHealth;
        } catch (error) {
          checks.aws = false;
          checks.awsError = error.message;
        }
      }

      const overallStatus = checks.supabase && checks.aws ? 'healthy' : 'degraded';
      
      return {
        status: overallStatus,
        message: overallStatus === 'healthy' ? 'All services operational' : 'Some services degraded',
        checks,
        storageType: this.storageType
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        checks: {},
        storageType: this.storageType
      };
    }
  }

  /**
   * Upload movie with hybrid storage (metadata in Supabase, files in S3)
   */
  async uploadMovie(file, metadata = {}) {
    try {
      console.log('🎬 Starting hybrid movie upload...');
      
      // Validate service availability
      if (!this.isSupabaseEnabled) {
        throw new Error('Supabase service not available');
      }
      
      if (!this.isAWSEnabled) {
        throw new Error('AWS S3 service not available');
      }
      
      // Step 1: Upload video file to AWS S3
      console.log('📤 Uploading video to AWS S3...');
      const s3Result = await awsUploadService.uploadMovie(file, metadata);
      
      if (!s3Result.success) {
        throw new Error('Failed to upload to S3: ' + s3Result.message);
      }
      
      console.log('✅ Video uploaded to S3 successfully');
      
      // Step 2: Create title record in Supabase database
      console.log('💾 Creating title record in Supabase...');
      const titleData = {
        title: metadata.title || 'Untitled Movie',
        kind: 'movie',
        year: metadata.year ? parseInt(metadata.year) : null,
        genres: metadata.genre ? [metadata.genre] : [],
        synopsis: metadata.synopsis || '',
        duration: metadata.duration ? parseInt(metadata.duration) : null,
        rating: metadata.rating || 0,
        poster_url: metadata.posterUrl || null,
        trailer_url: metadata.trailerUrl || null,
        playback_url: s3Result.url, // Use S3 URL
        aws_key: s3Result.key, // Store S3 key for future reference
        storage_type: 'aws_s3',
        file_size: s3Result.size,
        content_type: s3Result.contentType,
        quality: metadata.quality || '1080p',
        language: metadata.language || 'English',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: title, error: titleError } = await supabase
        .from('titles')
        .insert([titleData])
        .select()
        .single();
      
      if (titleError) {
        // If title creation fails, delete the S3 file
        console.log('❌ Title creation failed, cleaning up S3 file...');
        await awsUploadService.deleteFile(s3Result.key);
        throw new Error('Failed to create title record: ' + titleError.message);
      }
      
      console.log('✅ Title record created in Supabase successfully');
      
      // Step 3: Create media record for tracking
      console.log('📹 Creating media record...');
      const mediaData = {
        title_id: title.id,
        type: 'video',
        url: s3Result.url,
        aws_key: s3Result.key,
        storage_type: 'aws_s3',
        file_size: s3Result.size,
        content_type: s3Result.contentType,
        status: 'active',
        created_at: new Date().toISOString()
      };
      
      const { error: mediaError } = await supabase
        .from('media')
        .insert([mediaData]);
      
      if (mediaError) {
        console.log('⚠️ Media record creation failed, but title was created');
      } else {
        console.log('✅ Media record created successfully');
      }
      
      return {
        success: true,
        message: 'Movie uploaded successfully with hybrid storage',
        data: {
          title: title,
          s3: s3Result,
          storage: {
            type: 'hybrid',
            database: 'supabase',
            files: 'aws_s3'
          }
        }
      };
      
    } catch (error) {
      console.error('❌ Hybrid movie upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload series episode with hybrid storage
   */
  async uploadEpisode(file, metadata = {}) {
    try {
      console.log('📺 Starting hybrid episode upload...');
      
      // Validate service availability
      if (!this.isSupabaseEnabled) {
        throw new Error('Supabase service not available');
      }
      
      if (!this.isAWSEnabled) {
        throw new Error('AWS S3 service not available');
      }
      
      // Step 1: Upload episode file to AWS S3
      console.log('📤 Uploading episode to AWS S3...');
      const s3Result = await awsUploadService.uploadEpisode(
        file,
        metadata.seriesId,
        metadata.seasonNumber,
        metadata.episodeNumber,
        metadata
      );
      
      if (!s3Result.success) {
        throw new Error('Failed to upload episode to S3: ' + s3Result.message);
      }
      
      console.log('✅ Episode uploaded to S3 successfully');
      
      // Step 2: Create or update episode record in Supabase
      console.log('💾 Creating episode record in Supabase...');
      const episodeData = {
        title_id: metadata.seriesId,
        season_number: metadata.seasonNumber,
        episode_number: metadata.episodeNumber,
        title: metadata.title || `Episode ${metadata.episodeNumber}`,
        duration: metadata.duration ? parseInt(metadata.duration) : null,
        playback_url: s3Result.url,
        aws_key: s3Result.key,
        storage_type: 'aws_s3',
        file_size: s3Result.size,
        content_type: s3Result.contentType,
        quality: metadata.quality || '720p',
        language: metadata.language || 'English',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: episode, error: episodeError } = await supabase
        .from('episodes')
        .insert([episodeData])
        .select()
        .single();
      
      if (episodeError) {
        // If episode creation fails, delete the S3 file
        console.log('❌ Episode creation failed, cleaning up S3 file...');
        await awsUploadService.deleteFile(s3Result.key);
        throw new Error('Failed to create episode record: ' + episodeError.message);
      }
      
      console.log('✅ Episode record created in Supabase successfully');
      
      return {
        success: true,
        message: 'Episode uploaded successfully with hybrid storage',
        data: {
          episode: episode,
          s3: s3Result,
          storage: {
            type: 'hybrid',
            database: 'supabase',
            files: 'aws_s3'
          }
        }
      };
      
    } catch (error) {
      console.error('❌ Hybrid episode upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload thumbnail/poster image
   */
  async uploadThumbnail(file, contentType, contentId, metadata = {}) {
    try {
      console.log('🖼️ Starting hybrid thumbnail upload...');
      
      // Validate service availability
      if (!this.isSupabaseEnabled) {
        throw new Error('Supabase service not available');
      }
      
      if (!this.isAWSEnabled) {
        throw new Error('AWS S3 service not available');
      }
      
      // Step 1: Upload image to AWS S3
      console.log('📤 Uploading thumbnail to AWS S3...');
      const s3Result = await awsUploadService.uploadThumbnail(
        file,
        contentType,
        contentId,
        metadata
      );
      
      if (!s3Result.success) {
        throw new Error('Failed to upload thumbnail to S3: ' + s3Result.message);
      }
      
      console.log('✅ Thumbnail uploaded to S3 successfully');
      
      // Step 2: Update title record with poster URL
      if (contentType === 'movie' || contentType === 'series') {
        console.log('💾 Updating title record with poster URL...');
        const { error: updateError } = await supabase
          .from('titles')
          .update({ 
            poster_url: s3Result.url,
            updated_at: new Date().toISOString()
          })
          .eq('id', contentId);
        
        if (updateError) {
          console.log('⚠️ Failed to update title poster URL');
        } else {
          console.log('✅ Title poster URL updated successfully');
        }
      }
      
      return {
        success: true,
        message: 'Thumbnail uploaded successfully with hybrid storage',
        data: {
          s3: s3Result,
          storage: {
            type: 'hybrid',
            database: 'supabase',
            files: 'aws_s3'
          }
        }
      };
      
    } catch (error) {
      console.error('❌ Hybrid thumbnail upload failed:', error);
      throw error;
    }
  }

  /**
   * Get movie with hybrid storage URLs
   */
  async getMovie(id) {
    try {
      if (!this.isSupabaseEnabled) {
        throw new Error('Supabase service not available');
      }
      
      // Get title from Supabase
      const { data: title, error } = await supabase
        .from('titles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !title) {
        throw new Error('Movie not found');
      }
      
      // If it's stored in AWS S3, ensure the URL is accessible
      if (title.storage_type === 'aws_s3' && title.aws_key) {
        // You can add additional S3 validation here if needed
        title.playback_url = title.playback_url || getPublicURL(title.aws_key);
      }
      
      return {
        success: true,
        data: title
      };
      
    } catch (error) {
      console.error('❌ Failed to get movie:', error);
      throw error;
    }
  }

  /**
   * Get series with episodes
   */
  async getSeries(id) {
    try {
      if (!this.isSupabaseEnabled) {
        throw new Error('Supabase service not available');
      }
      
      // Get series title from Supabase
      const { data: title, error: titleError } = await supabase
        .from('titles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (titleError || !title) {
        throw new Error('Series not found');
      }
      
      // Get seasons and episodes
      const { data: seasons, error: seasonsError } = await supabase
        .from('seasons')
        .select('*')
        .eq('title_id', id)
        .order('season_number');
      
      const { data: episodes, error: episodesError } = await supabase
        .from('episodes')
        .select('*')
        .eq('title_id', id)
        .order('season_number, episode_number');
      
      if (seasonsError) console.log('⚠️ Failed to get seasons');
      if (episodesError) console.log('⚠️ Failed to get episodes');
      
      // Ensure AWS S3 URLs are accessible
      if (title.storage_type === 'aws_s3' && title.aws_key) {
        title.poster_url = title.poster_url || getPublicURL(title.aws_key);
      }
      
      // Process episodes to ensure URLs are accessible
      const processedEpisodes = (episodes || []).map(episode => {
        if (episode.storage_type === 'aws_s3' && episode.aws_key) {
          episode.playback_url = episode.playback_url || getPublicURL(episode.aws_key);
        }
        return episode;
      });
      
      return {
        success: true,
        data: {
          ...title,
          seasons: seasons || [],
          episodes: processedEpisodes
        }
      };
      
    } catch (error) {
      console.error('❌ Failed to get series:', error);
      throw error;
    }
  }

  /**
   * Delete movie and clean up S3 files
   */
  async deleteMovie(id) {
    try {
      if (!this.isSupabaseEnabled) {
        throw new Error('Supabase service not available');
      }
      
      // Get title to find S3 keys
      const { data: title, error: titleError } = await supabase
        .from('titles')
        .select('aws_key, poster_url')
        .eq('id', id)
        .single();
      
      if (titleError) {
        throw new Error('Movie not found');
      }
      
      // Delete from S3 if exists and AWS is enabled
      if (title.aws_key && this.isAWSEnabled) {
        console.log('🗑️ Deleting movie file from S3...');
        await awsUploadService.deleteFile(title.aws_key);
      }
      
      // Delete from Supabase
      const { error: deleteError } = await supabase
        .from('titles')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw new Error('Failed to delete from database: ' + deleteError.message);
      }
      
      return {
        success: true,
        message: 'Movie deleted successfully'
      };
      
    } catch (error) {
      console.error('❌ Failed to delete movie:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const stats = {
        storage_type: this.storageType,
        services: {
          supabase: this.isSupabaseEnabled,
          aws: this.isAWSEnabled
        },
        timestamp: new Date().toISOString()
      };
      
      // Get Supabase stats if available
      if (this.isSupabaseEnabled) {
        try {
          const [titleCount, episodeCount] = await Promise.allSettled([
            supabase.from('titles').select('*', { count: 'exact', head: true }),
            supabase.from('episodes').select('*', { count: 'exact', head: true })
          ]);
          
          stats.database = {
            titles: titleCount.status === 'fulfilled' ? (titleCount.value.count || 0) : 0,
            episodes: episodeCount.status === 'fulfilled' ? (episodeCount.value.count || 0) : 0,
            total: (titleCount.status === 'fulfilled' ? (titleCount.value.count || 0) : 0) + 
                   (episodeCount.status === 'fulfilled' ? (episodeCount.value.count || 0) : 0)
          };
        } catch (error) {
          stats.database = { error: error.message };
        }
      }
      
      // Get AWS S3 stats if available
      if (this.isAWSEnabled) {
        try {
          const awsStats = await require('../config/aws').getStorageStats();
          stats.s3 = awsStats;
        } catch (error) {
          stats.s3 = { error: error.message };
        }
      }
      
      return {
        success: true,
        data: stats
      };
      
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      throw error;
    }
  }
}

module.exports = new HybridStorageService();
