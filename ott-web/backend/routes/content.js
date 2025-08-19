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
    const { id } = req.params;
    const updateData = req.body;

    // Check if title exists
    const { data: existing } = await supabase
      .from('titles')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new AppError('Title not found', 404, 'Not Found');
    }

    // Update title
    const { data: title, error } = await supabase
      .from('titles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Title updated successfully',
      data: { title }
    });

  } catch (error) {
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
