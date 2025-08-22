const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const awsUploadService = require('../services/awsUploadService');
const { testAWSConnection, createS3Bucket, getStorageStats } = require('../config/aws');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Configure multer for memory storage (for AWS uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB limit for movies
  },
  fileFilter: (req, file, cb) => {
    // Allow video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    }
    // Allow image files
    else if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    }
    // Allow audio files
    else if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    }
    else {
      cb(new AppError('Invalid file type. Only video, image, and audio files are allowed.', 400));
    }
  }
});

// Test AWS connection
router.get('/test-connection', authenticateToken, async (req, res, next) => {
  try {
    const isConnected = await testAWSConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'AWS connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'AWS connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    next(error);
  }
});

// Create S3 bucket
router.post('/create-bucket', authenticateToken, async (req, res, next) => {
  try {
    const bucketCreated = await createS3Bucket();
    
    if (bucketCreated) {
      res.json({
        success: true,
        message: 'S3 bucket created/verified successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create S3 bucket',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get storage statistics
router.get('/storage-stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = await getStorageStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Upload movie
router.post('/upload-movie', authenticateToken, upload.single('movie'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No movie file provided', 400);
    }

    const metadata = {
      title: req.body.title,
      year: req.body.year,
      genre: req.body.genre,
      duration: req.body.duration,
      quality: req.body.quality,
      language: req.body.language,
      uploadedBy: req.user.id
    };

    const result = await awsUploadService.uploadMovie(req.file, metadata);
    
    res.json({
      success: true,
      message: 'Movie uploaded successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Upload series episode
router.post('/upload-episode', authenticateToken, upload.single('episode'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No episode file provided', 400);
    }

    const { seriesId, seasonNumber, episodeNumber } = req.body;
    
    if (!seriesId || !seasonNumber || !episodeNumber) {
      throw new AppError('Series ID, season number, and episode number are required', 400);
    }

    const metadata = {
      title: req.body.title,
      seriesId: seriesId,
      seasonNumber: parseInt(seasonNumber),
      episodeNumber: parseInt(episodeNumber),
      duration: req.body.duration,
      quality: req.body.quality,
      language: req.body.language,
      uploadedBy: req.user.id
    };

    const result = await awsUploadService.uploadEpisode(
      req.file, 
      seriesId, 
      parseInt(seasonNumber), 
      parseInt(episodeNumber), 
      metadata
    );
    
    res.json({
      success: true,
      message: 'Episode uploaded successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Upload thumbnail/poster
router.post('/upload-thumbnail', authenticateToken, upload.single('thumbnail'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No thumbnail file provided', 400);
    }

    const { contentType, contentId } = req.body;
    
    if (!contentType || !contentId) {
      throw new AppError('Content type and content ID are required', 400);
    }

    const metadata = {
      contentType: contentType,
      contentId: contentId,
      uploadedBy: req.user.id
    };

    const result = await awsUploadService.uploadThumbnail(
      req.file, 
      contentType, 
      contentId, 
      metadata
    );
    
    res.json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Upload trailer
router.post('/upload-trailer', authenticateToken, upload.single('trailer'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No trailer file provided', 400);
    }

    const { contentId } = req.body;
    
    if (!contentId) {
      throw new AppError('Content ID is required', 400);
    }

    const metadata = {
      contentId: contentId,
      uploadedBy: req.user.id
    };

    const result = await awsUploadService.uploadTrailer(
      req.file, 
      contentId, 
      metadata
    );
    
    res.json({
      success: true,
      message: 'Trailer uploaded successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// List files in a folder
router.get('/list-files', authenticateToken, async (req, res, next) => {
  try {
    const { prefix = '', maxKeys = 1000 } = req.query;
    
    const result = await awsUploadService.listFiles(prefix, parseInt(maxKeys));
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Get file metadata
router.get('/file-metadata/:key(*)', authenticateToken, async (req, res, next) => {
  try {
    const { key } = req.params;
    
    const result = await awsUploadService.getFileMetadata(key);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Delete file
router.delete('/delete-file/:key(*)', authenticateToken, async (req, res, next) => {
  try {
    const { key } = req.params;
    
    const result = await awsUploadService.deleteFile(key);
    
    res.json({
      success: true,
      message: 'File deleted successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Generate presigned upload URL
router.post('/presigned-upload-url', authenticateToken, async (req, res, next) => {
  try {
    const { key, contentType, expiresIn = 3600 } = req.body;
    
    if (!key || !contentType) {
      throw new AppError('Key and content type are required', 400);
    }

    const result = await awsUploadService.generatePresignedUploadUrl(key, contentType, expiresIn);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Check if file exists
router.get('/file-exists/:key(*)', authenticateToken, async (req, res, next) => {
  try {
    const { key } = req.params;
    
    const exists = await awsUploadService.fileExists(key);
    
    res.json({
      success: true,
      data: { exists },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Bulk upload (multiple files)
router.post('/bulk-upload', authenticateToken, upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No files provided', 400);
    }

    const { contentType, contentId } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        let result;
        
        switch (contentType) {
          case 'movie':
            result = await awsUploadService.uploadMovie(file, {
              uploadedBy: req.user.id
            });
            break;
          case 'episode':
            const { seriesId, seasonNumber, episodeNumber } = req.body;
            result = await awsUploadService.uploadEpisode(
              file, 
              seriesId, 
              parseInt(seasonNumber), 
              parseInt(episodeNumber), 
              { uploadedBy: req.user.id }
            );
            break;
          case 'thumbnail':
            result = await awsUploadService.uploadThumbnail(
              file, 
              contentType, 
              contentId, 
              { uploadedBy: req.user.id }
            );
            break;
          case 'trailer':
            result = await awsUploadService.uploadTrailer(
              file, 
              contentId, 
              { uploadedBy: req.user.id }
            );
            break;
          default:
            throw new AppError(`Invalid content type: ${contentType}`, 400);
        }
        
        results.push({ success: true, file: file.originalname, result });
      } catch (fileError) {
        results.push({ 
          success: false, 
          file: file.originalname, 
          error: fileError.message 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `Bulk upload completed. ${successCount} successful, ${failureCount} failed.`,
      data: {
        totalFiles: req.files.length,
        successful: successCount,
        failed: failureCount,
        results
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
