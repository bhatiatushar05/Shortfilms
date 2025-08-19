const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { supabase } = require('../config/database');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow video and image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv',
    'video/webm', 'video/mkv', 'image/jpeg', 'image/png', 'image/gif',
    'image/webp', 'image/svg+xml'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video and image files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  }
});

// Test endpoint to check database structure
router.get('/test-schema', authenticateToken, async (req, res) => {
  try {
    // Try to get one title to see what columns exist
    const { data: title, error: titleError } = await supabase
      .from('titles')
      .select('*')
      .limit(1)
      .single();

    // Try to get one media record to see what columns exist
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('*')
      .limit(1)
      .single();

    if (titleError) {
      return res.json({
        success: false,
        error: titleError.message,
        code: titleError.code
      });
    }

    res.json({
      success: true,
      data: {
        title,
        titleColumns: Object.keys(title || {}),
        media,
        mediaColumns: Object.keys(media || {}),
        message: 'Database structure check completed'
      }
    });

  } catch (error) {
    console.error('Schema check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking database schema',
      error: error.message
    });
  }
});

// Fix existing titles with incorrect URLs
router.post('/fix-urls', authenticateToken, async (req, res) => {
  try {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    // Get all titles that have relative URLs
    const { data: titles, error: fetchError } = await supabase
      .from('titles')
      .select('*')
      .or('poster_url.like./uploads/%,hero_url.like./uploads/%,playback_url.like./uploads/%');

    if (fetchError) {
      throw fetchError;
    }

    let updatedCount = 0;
    
    for (const title of titles) {
      const updateData = {};
      
      if (title.poster_url && title.poster_url.startsWith('/uploads/')) {
        updateData.poster_url = `${baseUrl}${title.poster_url}`;
      }
      if (title.hero_url && title.hero_url.startsWith('/uploads/')) {
        updateData.hero_url = `${baseUrl}${title.hero_url}`;
      }
      if (title.playback_url && title.playback_url.startsWith('/uploads/')) {
        updateData.playback_url = `${baseUrl}${title.playback_url}`;
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('titles')
          .update(updateData)
          .eq('id', title.id);
          
        if (!updateError) {
          updatedCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Fixed URLs for ${updatedCount} titles`,
      data: { updatedCount, totalTitles: titles.length }
    });

  } catch (error) {
    console.error('Error fixing URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing URLs',
      error: error.message
    });
  }
});

// Fix THE DOMINATOR title specifically with correct filenames
router.post('/fix-dominator', authenticateToken, async (req, res) => {
  try {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    // Update THE DOMINATOR with the correct uploaded filenames
    const updateData = {
      poster_url: `${baseUrl}/uploads/poster-1755540256492-927607258.jpg`,
      hero_url: `${baseUrl}/uploads/hero-1755540256497-268378670.jpg`,
      playback_url: `${baseUrl}/uploads/video-1755540256497-540941017.mp4`
    };

    const { data: title, error: updateError } = await supabase
      .from('titles')
      .update(updateData)
      .eq('title', 'THE DOMINATOR')
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Fixed THE DOMINATOR URLs with correct filenames',
      data: { title }
    });

  } catch (error) {
    console.error('Error fixing THE DOMINATOR:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing THE DOMINATOR',
      error: error.message
    });
  }
});

// Test endpoint to try inserting into media table
router.get('/test-media-insert', authenticateToken, async (req, res) => {
  try {
    // Try to insert a test media record
    const testMediaData = {
      id: require('crypto').randomUUID(),
      title_id: '7f1be909-a254-4d3e-800b-2f032fe5a2a2', // Use existing title ID
      type: 'image',
      image_type: 'poster',
      original_filename: 'test.png',
      file_path: '/test/path',
      file_size: 1000,
      status: 'processed',
      uploaded_at: new Date().toISOString()
    };

    const { data: insertedMedia, error: insertError } = await supabase
      .from('media')
      .insert([testMediaData])
      .select()
      .single();

    if (insertError) {
      return res.json({
        success: false,
        error: insertError.message,
        code: insertError.code,
        details: insertError.details
      });
    }

    // If successful, delete the test record
    await supabase
      .from('media')
      .delete()
      .eq('id', testMediaData.id);

    res.json({
      success: true,
      data: {
        insertedMedia,
        message: 'Media table insert test successful'
      }
    });

  } catch (error) {
    console.error('Media insert test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing media insert',
      error: error.message
    });
  }
});

// Upload content with media files
router.post('/upload-content', authenticateToken, upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'hero', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    // Get content metadata from request body
    const contentData = {
      id: require('crypto').randomUUID(),
      title: req.body.title,
      synopsis: req.body.description || '',
      kind: req.body.contentType || 'movie',
      year: parseInt(req.body.releaseYear) || new Date().getFullYear(),
      rating: req.body.rating || 'PG',
      genres: req.body.genre ? [req.body.genre] : [],
      tags: [],
      poster_url: '', // Will be updated after media upload
      hero_url: '', // Will be updated after media upload
      trailer_url: null,
      playback_url: '', // Will be updated after video upload
      runtime_sec: req.body.duration ? parseDuration(req.body.duration) : 0,
      season_count: 0,
      episode_count: 0,
      cast_info: [],
      director: '',
      country: '',
      language: 'English',
      awards: [],
      imdb_rating: 0,
      rotten_tomatoes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert content into titles table
    const { data: title, error: titleError } = await supabase
      .from('titles')
      .insert([contentData])
      .select()
      .single();

    if (titleError) {
      throw titleError;
    }

    const titleId = title.id;
    const mediaFiles = [];

    // Handle poster upload
    if (req.files.poster && req.files.poster[0]) {
      const posterFile = req.files.poster[0];
      const posterData = {
        id: require('crypto').randomUUID(),
        title_id: titleId,
        episode_id: null,
        type: 'image',
        image_type: 'poster',
        original_filename: posterFile.originalname,
        file_path: posterFile.path,
        file_size: posterFile.size,
        status: 'processed',
        uploaded_at: new Date().toISOString()
      };

      const { data: poster, error: posterError } = await supabase
        .from('media')
        .insert([posterData])
        .select()
        .single();

      if (posterError) {
        console.error('Error saving poster:', posterError);
      } else {
        mediaFiles.push({ type: 'poster', data: poster });
      }
    }

    // Handle hero image upload
    if (req.files.hero && req.files.hero[0]) {
      const heroFile = req.files.hero[0];
      const heroData = {
        id: require('crypto').randomUUID(),
        title_id: titleId,
        episode_id: null,
        type: 'image',
        image_type: 'hero',
        original_filename: heroFile.originalname,
        file_path: heroFile.path,
        file_size: heroFile.size,
        status: 'processed',
        uploaded_at: new Date().toISOString()
      };

      const { data: hero, error: heroError } = await supabase
        .from('media')
        .insert([heroData])
        .select()
        .single();

      if (heroError) {
        console.error('Error saving hero:', heroError);
      } else {
        mediaFiles.push({ type: 'hero', data: hero });
      }
    }

    // Handle video upload
    if (req.files.video && req.files.video[0]) {
      const videoFile = req.files.video[0];
      const videoData = {
        id: require('crypto').randomUUID(),
        title_id: titleId,
        episode_id: null,
        type: 'video',
        original_filename: videoFile.originalname,
        file_path: videoFile.path,
        file_size: videoFile.size,
        status: 'processed',
        uploaded_at: new Date().toISOString()
      };

      const { data: video, error: videoError } = await supabase
        .from('media')
        .insert([videoData])
        .select()
        .single();

      if (videoError) {
        console.error('Error saving video:', videoError);
      } else {
        mediaFiles.push({ type: 'video', data: video });
      }
    }

    // Update title with poster and hero URLs
    const updateData = {};
    const posterMedia = mediaFiles.find(m => m.type === 'poster');
    const heroMedia = mediaFiles.find(m => m.type === 'hero');
    const videoMedia = mediaFiles.find(m => m.type === 'video');
    
    // Get base URL from environment or use localhost:5001 as fallback
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    if (posterMedia) {
      // Use the actual uploaded filename, not the original filename
      const uploadedFilename = posterMedia.data.file_path.split('/').pop();
      updateData.poster_url = `${baseUrl}/uploads/${uploadedFilename}`;
    }
    if (heroMedia) {
      // Use the actual uploaded filename, not the original filename
      const uploadedFilename = heroMedia.data.file_path.split('/').pop();
      updateData.hero_url = `${baseUrl}/uploads/${uploadedFilename}`;
    }
    if (videoMedia) {
      // Use the actual uploaded filename, not the original filename
      const uploadedFilename = videoMedia.data.file_path.split('/').pop();
      updateData.playback_url = `${baseUrl}/uploads/${uploadedFilename}`;
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('titles')
        .update(updateData)
        .eq('id', titleId);

      if (updateError) {
        console.error('Error updating title with media URLs:', updateError);
      }
    }

    res.json({
      success: true,
      message: 'Content uploaded successfully',
      data: {
        title,
        media: mediaFiles.map(m => m.data)
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading content',
      error: error.message
    });
  }
});

// Helper function to parse duration string (e.g., "2h 15m" to seconds)
function parseDuration(durationStr) {
  const hours = durationStr.match(/(\d+)h/);
  const minutes = durationStr.match(/(\d+)m/);
  
  let totalSeconds = 0;
  if (hours) totalSeconds += parseInt(hours[1]) * 3600;
  if (minutes) totalSeconds += parseInt(minutes[1]) * 60;
  
  return totalSeconds;
}

// Get all media files for a title
router.get('/title/:titleId', authenticateToken, async (req, res) => {
  try {
    const { titleId } = req.params;

    const { data: media, error } = await supabase
      .from('media')
      .select('*')
      .eq('title_id', titleId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { media: media || [] }
    });

  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching media files',
      error: error.message
    });
  }
});

// Get media file by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: media, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.json({
      success: true,
      data: media
    });

  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching media file',
      error: error.message
    });
  }
});

// Delete media file
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get media info
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Delete physical file
    if (fs.existsSync(media.file_path)) {
      fs.unlinkSync(media.file_path);
    }

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting media file',
      error: error.message
    });
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
});

module.exports = router;