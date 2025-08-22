const { s3, awsConfig, getPublicURL, generateSignedURL } = require('../config/aws');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class AWSUploadService {
  constructor() {
    this.bucketName = awsConfig.s3.bucketName;
    this.uploadFolder = 'uploads';
    this.moviesFolder = 'movies';
    this.seriesFolder = 'series';
    this.thumbnailsFolder = 'thumbnails';
    this.trailersFolder = 'trailers';
  }

  /**
   * Upload a movie file to S3
   */
  async uploadMovie(file, metadata = {}) {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const key = `${this.moviesFolder}/${fileName}`;
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          fileSize: file.size.toString(),
          uploadDate: new Date().toISOString(),
          contentType: file.mimetype,
          ...metadata
        },
        ACL: 'public-read' // Make movie files publicly accessible
      };

      const result = await s3.upload(uploadParams).promise();
      
      console.log(`✅ Movie uploaded successfully: ${key}`);
      
      return {
        success: true,
        key: key,
        url: getPublicURL(key),
        signedUrl: generateSignedURL(key, 24 * 3600), // 24 hours
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        contentType: file.mimetype,
        location: result.Location,
        etag: result.ETag
      };
    } catch (error) {
      console.error('❌ Error uploading movie:', error);
      throw new Error(`Failed to upload movie: ${error.message}`);
    }
  }

  /**
   * Upload a series episode to S3
   */
  async uploadEpisode(file, seriesId, seasonNumber, episodeNumber, metadata = {}) {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const key = `${this.seriesFolder}/${seriesId}/season-${seasonNumber}/episode-${episodeNumber}/${fileName}`;
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          fileSize: file.size.toString(),
          uploadDate: new Date().toISOString(),
          contentType: file.mimetype,
          seriesId: seriesId,
          seasonNumber: seasonNumber.toString(),
          episodeNumber: episodeNumber.toString(),
          ...metadata
        },
        ACL: 'public-read'
      };

      const result = await s3.upload(uploadParams).promise();
      
      console.log(`✅ Episode uploaded successfully: ${key}`);
      
      return {
        success: true,
        key: key,
        url: getPublicURL(key),
        signedUrl: generateSignedURL(key, 24 * 3600),
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        contentType: file.mimetype,
        location: result.Location,
        etag: result.ETag,
        seriesId,
        seasonNumber,
        episodeNumber
      };
    } catch (error) {
      console.error('❌ Error uploading episode:', error);
      throw new Error(`Failed to upload episode: ${error.message}`);
    }
  }

  /**
   * Upload thumbnail/poster image
   */
  async uploadThumbnail(file, contentType, contentId, metadata = {}) {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const key = `${this.thumbnailsFolder}/${contentType}/${contentId}/${fileName}`;
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          fileSize: file.size.toString(),
          uploadDate: new Date().toISOString(),
          contentType: file.mimetype,
          contentId: contentId,
          ...metadata
        },
        ACL: 'public-read'
      };

      const result = await s3.upload(uploadParams).promise();
      
      console.log(`✅ Thumbnail uploaded successfully: ${key}`);
      
      return {
        success: true,
        key: key,
        url: getPublicURL(key),
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        contentType: file.mimetype,
        location: result.Location,
        etag: result.ETAG
      };
    } catch (error) {
      console.error('❌ Error uploading thumbnail:', error);
      throw new Error(`Failed to upload thumbnail: ${error.message}`);
    }
  }

  /**
   * Upload trailer video
   */
  async uploadTrailer(file, contentId, metadata = {}) {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const key = `${this.trailersFolder}/${contentId}/${fileName}`;
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          fileSize: file.size.toString(),
          uploadDate: new Date().toISOString(),
          contentType: file.mimetype,
          contentId: contentId,
          ...metadata
        },
        ACL: 'public-read'
      };

      const result = await s3.upload(uploadParams).promise();
      
      console.log(`✅ Trailer uploaded successfully: ${key}`);
      
      return {
        success: true,
        key: key,
        url: getPublicURL(key),
        signedUrl: generateSignedURL(key, 24 * 3600),
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        contentType: file.mimetype,
        location: result.Location,
        etag: result.ETag
      };
    } catch (error) {
      console.error('❌ Error uploading trailer:', error);
      throw new Error(`Failed to upload trailer: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await s3.deleteObject(params).promise();
      console.log(`✅ File deleted successfully: ${key}`);
      
      return {
        success: true,
        message: `File ${key} deleted successfully`
      };
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * List all files in a folder
   */
  async listFiles(prefix = '', maxKeys = 1000) {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      };

      const result = await s3.listObjectsV2(params).promise();
      
      return {
        success: true,
        files: result.Contents || [],
        count: result.Contents ? result.Contents.length : 0,
        isTruncated: result.IsTruncated
      };
    } catch (error) {
      console.error('❌ Error listing files:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      const result = await s3.headObject(params).promise();
      
      return {
        success: true,
        metadata: result.Metadata,
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag
      };
    } catch (error) {
      console.error('❌ Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for upload (for direct browser uploads)
   */
  async generatePresignedUploadUrl(key, contentType, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        Expires: expiresIn,
        ACL: 'public-read'
      };

      const presignedUrl = await s3.getSignedUrl('putObject', params);
      
      return {
        success: true,
        presignedUrl,
        key,
        expiresIn,
        method: 'PUT'
      };
    } catch (error) {
      console.error('❌ Error generating presigned URL:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key) {
    try {
      await s3.headObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();
      return true;
    } catch (error) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats() {
    try {
      const result = await this.listFiles('', 10000);
      let totalSize = 0;
      let fileCount = 0;
      const folderStats = {};

      for (const file of result.files) {
        totalSize += file.Size;
        fileCount++;
        
        const folder = file.Key.split('/')[0];
        if (!folderStats[folder]) {
          folderStats[folder] = { count: 0, size: 0 };
        }
        folderStats[folder].count++;
        folderStats[folder].size += file.Size;
      }

      return {
        success: true,
        totalSize,
        totalSizeGB: (totalSize / (1024 * 1024 * 1024)).toFixed(2),
        fileCount,
        folderStats
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      throw new Error(`Failed to get storage stats: ${error.message}`);
    }
  }
}

module.exports = new AWSUploadService();
