const express = require('express');
const { supabase } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Get all titles with pagination and filters
router.get('/titles', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      kind, 
      genre, 
      year, 
      rating,
      search 
    } = req.query;

    let query = supabase
      .from('titles')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (kind) query = query.eq('kind', kind);
    if (genre) query = query.contains('genres', [genre]);
    if (year) query = query.eq('year', year);
    if (rating) query = query.eq('rating', rating);
    if (search) query = query.ilike('title', `%${search}%`);

    // Get total count for pagination
    const { count } = await supabase
      .from('titles')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: titles, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: {
        titles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get single title by ID
router.get('/titles/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: title, error } = await supabase
      .from('titles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !title) {
      throw new AppError('Title not found', 404, 'Not Found');
    }

    // If it's a series, get seasons and episodes
    if (title.kind === 'series') {
      const { data: seasons } = await supabase
        .from('seasons')
        .select('*')
        .eq('title_id', id)
        .order('season_number');

      const { data: episodes } = await supabase
        .from('episodes')
        .select('*')
        .eq('title_id', id)
        .order('season_number, episode_number');

      title.seasons = seasons || [];
      title.episodes = episodes || [];
    }

    res.json({
      success: true,
      data: { title }
    });

  } catch (error) {
    next(error);
  }
});

// Create new title
router.post('/titles', async (req, res, next) => {
  try {
    const titleData = req.body;

    // Validate required fields
    const requiredFields = ['id', 'kind', 'slug', 'title', 'synopsis', 'year', 'rating', 'genres', 'poster_url', 'hero_url'];
    for (const field of requiredFields) {
      if (!titleData[field]) {
        throw new AppError(`${field} is required`, 400, 'Validation Error');
      }
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('titles')
      .select('id')
      .eq('slug', titleData.slug)
      .single();

    if (existing) {
      throw new AppError('Slug already exists', 409, 'Duplicate Error');
    }

    // Insert title
    const { data: title, error } = await supabase
      .from('titles')
      .insert([titleData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Title created successfully',
      data: { title }
    });

  } catch (error) {
    next(error);
  }
});

// Update title
router.put('/titles/:id', async (req, res, next) => {
  try {
    // Test database connection first
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('titles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection test failed:', testError);
      throw new AppError('Database connection failed', 500, 'Database Connection Error');
    }
    
    console.log('✅ Database connection test successful');
    
    // Test table structure
    console.log('🔍 Testing table structure...');
    const { data: structureData, error: structureError } = await supabase
      .from('titles')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Table structure test failed:', structureError);
      throw new AppError('Table structure test failed', 500, 'Table Structure Error');
    }
    
    if (structureData && structureData.length > 0) {
      console.log('✅ Table structure test successful');
      console.log('📋 Available columns:', Object.keys(structureData[0]));
      console.log('🔍 Sample data:', structureData[0]);
      
      // Check if required columns exist
      const requiredColumns = ['id', 'title', 'synopsis', 'kind', 'genre', 'year', 'rating', 'status', 'is_featured'];
      const missingColumns = requiredColumns.filter(col => !(col in structureData[0]));
      
      if (missingColumns.length > 0) {
        console.warn('⚠️ Missing columns:', missingColumns);
        console.warn('⚠️ This might cause update issues');
      } else {
        console.log('✅ All required columns exist');
      }
    }
    
    const { id } = req.params;
    const updateData = req.body;

    console.log('🔄 PUT /titles/:id - Update request received');
    console.log('🆔 Title ID:', id);
    console.log('📤 Update data:', updateData);
    
    // Validate required fields
    if (!updateData.title || typeof updateData.title !== 'string') {
      throw new AppError('Title is required and must be a string', 400, 'Validation Error');
    }
    
    // Clean and validate the data
    const cleanedData = {};
    
    console.log('🧹 Cleaning and validating data...');
    console.log('📤 Raw update data:', JSON.stringify(updateData, null, 2));
    
    // Only include fields that exist in the database schema
    const allowedFields = ['title', 'synopsis', 'kind', 'genre', 'year', 'rating', 'status', 'is_featured', 'runtime_sec'];
    
    if (updateData.title && allowedFields.includes('title')) cleanedData.title = updateData.title.trim();
    if (updateData.synopsis !== undefined && allowedFields.includes('synopsis')) cleanedData.synopsis = updateData.synopsis || '';
    if (updateData.kind && allowedFields.includes('kind')) cleanedData.kind = updateData.kind;
    if (updateData.genre !== undefined && allowedFields.includes('genre')) cleanedData.genre = updateData.genre || '';
    if (updateData.year !== undefined && allowedFields.includes('year')) {
      cleanedData.year = updateData.year ? parseInt(updateData.year) : null;
      if (updateData.year && isNaN(cleanedData.year)) {
        throw new AppError('Year must be a valid number', 400, 'Validation Error');
      }
    }
    if (updateData.rating && allowedFields.includes('rating')) cleanedData.rating = updateData.rating;
    if (updateData.status && allowedFields.includes('status')) cleanedData.status = updateData.status;
    if (updateData.is_featured !== undefined && allowedFields.includes('is_featured')) cleanedData.is_featured = Boolean(updateData.is_featured);
    if (updateData.runtime_sec !== undefined && allowedFields.includes('runtime_sec')) {
      cleanedData.runtime_sec = updateData.runtime_sec ? parseInt(updateData.runtime_sec) : null;
      if (updateData.runtime_sec && isNaN(cleanedData.runtime_sec)) {
        throw new AppError('Runtime must be a valid number', 400, 'Validation Error');
      }
    }
    
    console.log('🧹 Data cleaning completed');
    console.log('📋 Cleaned data keys:', Object.keys(cleanedData));
    console.log('📋 Cleaned data values:', Object.values(cleanedData));
    
    // Additional validation for required fields
    if (!cleanedData.title || cleanedData.title.length === 0) {
      throw new AppError('Title cannot be empty', 400, 'Validation Error');
    }
    
    if (cleanedData.title && cleanedData.title.length > 255) {
      throw new AppError('Title is too long (max 255 characters)', 400, 'Validation Error');
    }
    
    if (cleanedData.synopsis && cleanedData.synopsis.length > 1000) {
      throw new AppError('Synopsis is too long (max 1000 characters)', 400, 'Validation Error');
    }
    
    // Log the final cleaned data
    console.log('🧹 Final cleaned data:', JSON.stringify(cleanedData, null, 2));
    console.log('📋 Final cleaned data keys:', Object.keys(cleanedData));
    console.log('📋 Final cleaned data values:', Object.values(cleanedData));
    


    // Check if title exists
    try {
      const { data: existing, error: checkError } = await supabase
        .from('titles')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('❌ Error checking title existence:', checkError);
        throw new AppError(`Database error: ${checkError.message}`, 500, 'Database Error');
      }

      if (!existing) {
        console.log('❌ Title not found:', id);
        throw new AppError('Title not found', 404, 'Not Found');
      }

      console.log('✅ Title exists, proceeding with update');
    } catch (error) {
      if (error.statusCode) {
        // This is our custom AppError, re-throw it
        throw error;
      }
      // This is a database connection or other error
      console.error('❌ Database connection error:', error);
      throw new AppError('Database connection failed', 500, 'Database Connection Error');
    }



    // Update title
    console.log('🔄 Attempting to update title with data:', JSON.stringify(cleanedData, null, 2));
    console.log('🆔 Updating title with ID:', id);
    console.log('📋 Fields being updated:', Object.keys(cleanedData));
    
    const { data: title, error: updateError } = await supabase
      .from('titles')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating title:', updateError);
      console.error('❌ Error details:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
      console.error('❌ Update data that caused error:', JSON.stringify(cleanedData, null, 2));
      console.error('❌ Error occurred while updating title with ID:', id);
      
      // Handle specific database errors
      if (updateError.code === '23505') {
        throw new AppError('A title with this name already exists', 400, 'Duplicate Error');
      } else if (updateError.code === '23503') {
        throw new AppError('Referenced data not found', 400, 'Reference Error');
      } else if (updateError.code === '23514') {
        throw new AppError('Data validation failed', 400, 'Validation Error');
      } else if (updateError.code === '42703') {
        throw new AppError('Invalid column name', 400, 'Schema Error');
      } else if (updateError.code === '42P01') {
        throw new AppError('Table not found', 500, 'Schema Error');
      } else {
        throw new AppError(`Update failed: ${updateError.message}`, 500, 'Update Error');
      }
    }

    console.log('✅ Title updated successfully:', title);
    console.log('📋 Updated title data:', JSON.stringify(title, null, 2));

    res.json({
      success: true,
      message: 'Title updated successfully',
      data: { title }
    });

  } catch (error) {
    console.error('❌ PUT /titles/:id - Error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // If it's our custom error, pass it to the error handler
    if (error.statusCode) {
      next(error);
    } else {
      // If it's an unexpected error, create a generic error
      const genericError = new AppError(
        'An unexpected error occurred while updating the title',
        500,
        'Unexpected Error'
      );
      next(genericError);
    }
  }
});

// Patch title (for partial updates like featured status)
router.patch('/titles/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('🔄 PATCH /titles/:id - Patch request received');
    console.log('🆔 Title ID:', id);
    console.log('📤 Patch data:', updateData);

    // Check if title exists
    const { data: existing, error: checkError } = await supabase
      .from('titles')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('❌ Error checking title existence:', checkError);
      throw new AppError(`Database error: ${checkError.message}`, 500, 'Database Error');
    }

    if (!existing) {
      console.log('❌ Title not found:', id);
      throw new AppError('Title not found', 404, 'Not Found');
    }

    console.log('✅ Title exists, proceeding with patch update');

    // Update title with patch data
    const { data: title, error: updateError } = await supabase
      .from('titles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error patching title:', updateError);
      console.error('❌ Patch data that caused error:', updateData);
      throw new AppError(`Patch failed: ${updateError.message}`, 500, 'Update Error');
    }

    console.log('✅ Title patched successfully:', title);

    res.json({
      success: true,
      message: 'Title patched successfully',
      data: { title }
    });

  } catch (error) {
    console.error('❌ PATCH /titles/:id - Error:', error);
    next(error);
  }
});

// Delete title
router.delete('/titles/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if title exists
    const { data: existing } = await supabase
      .from('titles')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new AppError('Title not found', 404, 'Not Found');
    }

    // Delete title (cascading will handle seasons/episodes)
    const { error } = await supabase
      .from('titles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Title deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Episode management routes
router.post('/episodes', async (req, res, next) => {
  try {
    const episodeData = req.body;

    // Validate required fields
    const requiredFields = ['id', 'title_id', 'season_number', 'episode_number', 'title', 'synopsis', 'runtime_sec', 'playback_url'];
    for (const field of requiredFields) {
      if (!episodeData[field]) {
        throw new AppError(`${field} is required`, 400, 'Validation Error');
      }
    }

    // Check if episode already exists
    const { data: existing } = await supabase
      .from('episodes')
      .select('id')
      .eq('title_id', episodeData.title_id)
      .eq('season_number', episodeData.season_number)
      .eq('episode_number', episodeData.episode_number)
      .single();

    if (existing) {
      throw new AppError('Episode already exists for this season and episode number', 409, 'Duplicate Error');
    }

    // Insert episode
    const { data: episode, error } = await supabase
      .from('episodes')
      .insert([episodeData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Episode created successfully',
      data: { episode }
    });

  } catch (error) {
    next(error);
  }
});

// Get episodes for a title
router.get('/titles/:titleId/episodes', async (req, res, next) => {
  try {
    const { titleId } = req.params;
    const { season_number } = req.query;

    let query = supabase
      .from('episodes')
      .select('*')
      .eq('title_id', titleId)
      .order('season_number, episode_number');

    if (season_number) {
      query = query.eq('season_number', season_number);
    }

    const { data: episodes, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: { episodes: episodes || [] }
    });

  } catch (error) {
    next(error);
  }
});

// Bulk operations
router.post('/titles/bulk', async (req, res, next) => {
  try {
    const { titles } = req.body;

    if (!Array.isArray(titles) || titles.length === 0) {
      throw new AppError('Titles array is required', 400, 'Validation Error');
    }

    const { data, error } = await supabase
      .from('titles')
      .insert(titles)
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: `${titles.length} titles created successfully`,
      data: { titles: data }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
