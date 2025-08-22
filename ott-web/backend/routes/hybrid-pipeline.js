const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const hybridStorageService = require('../services/hybridStorageService');
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

// Simple movie upload pipeline
router.post('/upload-movie', authenticateToken, upload.single('movie'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No movie file provided', 400);
    }

    const metadata = {
      title: req.body.title,
      year: req.body.year,
      genre: req.body.genre,
      synopsis: req.body.synopsis,
      duration: req.body.duration,
      quality: req.body.quality,
      language: req.body.language,
      rating: req.body.rating,
      posterUrl: req.body.posterUrl,
      trailerUrl: req.body.trailerUrl
    };

    console.log('🎬 Starting movie upload pipeline...');
    const result = await hybridStorageService.uploadMovie(req.file, metadata);
    
    res.json({
      success: true,
      message: 'Movie uploaded successfully through hybrid pipeline',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Simple episode upload pipeline
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
      seriesId: seriesId,
      seasonNumber: parseInt(seasonNumber),
      episodeNumber: parseInt(episodeNumber),
      title: req.body.title,
      duration: req.body.duration,
      quality: req.body.quality,
      language: req.body.language
    };

    console.log('📺 Starting episode upload pipeline...');
    const result = await hybridStorageService.uploadEpisode(req.file, metadata);
    
    res.json({
      success: true,
      message: 'Episode uploaded successfully through hybrid pipeline',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Upload poster/thumbnail
router.post('/upload-poster', authenticateToken, upload.single('poster'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No poster file provided', 400);
    }

    const { contentType, contentId } = req.body;
    
    if (!contentType || !contentId) {
      throw new AppError('Content type and content ID are required', 400);
    }

    console.log('🖼️ Starting poster upload pipeline...');
    const result = await hybridStorageService.uploadThumbnail(
      req.file, 
      contentType, 
      contentId, 
      { uploadedBy: req.user.id }
    );
    
    res.json({
      success: true,
      message: 'Poster uploaded successfully through hybrid pipeline',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Get movie with hybrid storage
router.get('/movie/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await hybridStorageService.getMovie(id);
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
});

// Get series with episodes
router.get('/series/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await hybridStorageService.getSeries(id);
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
});

// Delete movie and clean up S3
router.delete('/movie/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await hybridStorageService.deleteMovie(id);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

// Get hybrid storage statistics
router.get('/storage-stats', authenticateToken, async (req, res, next) => {
  try {
    const result = await hybridStorageService.getStorageStats();
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
});

// Health check for hybrid pipeline
router.get('/health', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Hybrid pipeline is healthy',
      timestamp: new Date().toISOString(),
      storage: {
        type: 'hybrid',
        database: 'supabase',
        files: 'aws_s3'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Pipeline health check failed',
      error: error.message
    });
  }
});

module.exports = router;
