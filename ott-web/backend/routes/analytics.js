const express = require('express');
const { supabase } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Get platform overview statistics
router.get('/overview', async (req, res, next) => {
  try {
    console.log('📊 Analytics: Overview request received');
    const { period = '30' } = req.query; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    console.log('📊 Analytics: Fetching user statistics...');
    
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('❌ Analytics: Error fetching total users:', usersError);
    }

    // Get new users in period
    const { count: newUsers, error: newUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    if (newUsersError) {
      console.error('❌ Analytics: Error fetching new users:', newUsersError);
    }

    console.log('📊 Analytics: Fetching content statistics...');
    
    // Get total titles
    const { count: totalTitles, error: titlesError } = await supabase
      .from('titles')
      .select('*', { count: 'exact', head: true });

    if (titlesError) {
      console.error('❌ Analytics: Error fetching total titles:', titlesError);
    }

    // Get total movies vs series
    const { count: totalMovies, error: moviesError } = await supabase
      .from('titles')
      .select('*', { count: 'exact', head: true })
      .eq('kind', 'movie');

    if (moviesError) {
      console.error('❌ Analytics: Error fetching movies:', moviesError);
    }

    const { count: totalSeries, error: seriesError } = await supabase
      .from('titles')
      .select('*', { count: 'exact', head: true })
      .eq('kind', 'series');

    if (seriesError) {
      console.error('❌ Analytics: Error fetching series:', seriesError);
    }

    console.log('📊 Analytics: Fetching engagement statistics...');
    
    // Get total watchlist items
    const { count: totalWatchlist, error: watchlistError } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true });

    if (watchlistError) {
      console.error('❌ Analytics: Error fetching watchlist:', watchlistError);
    }

    // Get total progress entries
    const { count: totalProgress, error: progressError } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true });

    if (progressError) {
      console.error('❌ Analytics: Error fetching progress:', progressError);
    }

    const overview = {
      period: parseInt(period),
      users: {
        total: totalUsers || 0,
        new: newUsers || 0,
        growth: totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0
      },
      content: {
        total: totalTitles || 0,
        movies: totalMovies || 0,
        series: totalSeries || 0
      },
      engagement: {
        watchlistItems: totalWatchlist || 0,
        progressEntries: totalProgress || 0
      }
    };

    console.log('✅ Analytics: Overview data prepared successfully:', overview);

    res.json({
      success: true,
      data: { overview }
    });

  } catch (error) {
    console.error('❌ Analytics: Overview endpoint error:', error);
    next(error);
  }
});

// Get content performance analytics
router.get('/content', async (req, res, next) => {
  try {
    const { period = '30', limit = 10 } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get most watched titles
    const { data: mostWatched } = await supabase
      .from('progress')
      .select(`
        title_id,
        titles!inner(
          id,
          title,
          kind,
          poster_url
        )
      `)
      .gte('updated_at', startDate.toISOString())
      .order('updated_at', { ascending: false });

    // Count watch frequency per title
    const watchCounts = {};
    if (mostWatched) {
      mostWatched.forEach(item => {
        const titleId = item.title_id;
        watchCounts[titleId] = watchCounts[titleId] || {
          title: item.titles,
          watchCount: 0
        };
        watchCounts[titleId].watchCount++;
      });
    }

    // Sort by watch count and get top titles
    const topTitles = Object.values(watchCounts)
      .sort((a, b) => b.watchCount - a.watchCount)
      .slice(0, parseInt(limit));

    // Get most added to watchlist
    const { data: mostWatchlisted } = await supabase
      .from('watchlist')
      .select(`
        title_id,
        titles!inner(
          id,
          title,
          kind,
          poster_url
        )
      `)
      .gte('added_at', startDate.toISOString());

    // Count watchlist frequency per title
    const watchlistCounts = {};
    if (mostWatchlisted) {
      mostWatchlisted.forEach(item => {
        const titleId = item.title_id;
        watchlistCounts[titleId] = watchlistCounts[titleId] || {
          title: item.titles,
          watchlistCount: 0
        };
        watchlistCounts[titleId].watchlistCount++;
      });
    }

    // Sort by watchlist count and get top titles
    const topWatchlisted = Object.values(watchlistCounts)
      .sort((a, b) => b.watchlistCount - a.watchlistCount)
      .slice(0, parseInt(limit));

    const contentAnalytics = {
      period: parseInt(period),
      mostWatched: topTitles,
      mostWatchlisted: topWatchlisted
    };

    res.json({
      success: true,
      data: { contentAnalytics }
    });

  } catch (error) {
    next(error);
  }
});

// Get user engagement analytics
router.get('/engagement', async (req, res, next) => {
  try {
    const { period = '30' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get daily active users (users with activity in the period)
    const { data: activeUsers } = await supabase
      .from('progress')
      .select('user_id')
      .gte('updated_at', startDate.toISOString())
      .distinct();

    const dailyActiveUsers = activeUsers?.length || 0;

    // Get total watch time in period
    const { data: watchTimeData } = await supabase
      .from('progress')
      .select('position_sec')
      .gte('updated_at', startDate.toISOString());

    const totalWatchTime = watchTimeData?.reduce((total, item) => {
      return total + (item.position_sec || 0);
    }, 0) || 0;

    // Get average session duration
    const { data: sessions } = await supabase
      .from('progress')
      .select('user_id, updated_at')
      .gte('updated_at', startDate.toISOString())
      .order('user_id, updated_at');

    // Group by user and calculate session duration
    const userSessions = {};
    if (sessions) {
      sessions.forEach(session => {
        if (!userSessions[session.user_id]) {
          userSessions[session.user_id] = [];
        }
        userSessions[session.user_id].push(new Date(session.updated_at));
      });
    }

    // Calculate average session duration
    let totalSessionDuration = 0;
    let sessionCount = 0;

    Object.values(userSessions).forEach(userSession => {
      if (userSession.length > 1) {
        // Sort by time and calculate duration between first and last activity
        userSession.sort((a, b) => a - b);
        const duration = (userSession[userSession.length - 1] - userSession[0]) / 1000 / 60; // in minutes
        totalSessionDuration += duration;
        sessionCount++;
      }
    });

    const averageSessionDuration = sessionCount > 0 ? Math.round(totalSessionDuration / sessionCount) : 0;

    // Get retention rate (users who returned within the period)
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, created_at')
      .lt('created_at', startDate.toISOString());

    const existingUsers = allUsers?.length || 0;
    const retentionRate = existingUsers > 0 ? Math.round((dailyActiveUsers / existingUsers) * 100) : 0;

    const engagementAnalytics = {
      period: parseInt(period),
      dailyActiveUsers,
      totalWatchTime: Math.round(totalWatchTime / 60), // in minutes
      averageSessionDuration, // in minutes
      retentionRate,
      totalSessions: sessionCount
    };

    res.json({
      success: true,
      data: { engagementAnalytics }
    });

  } catch (error) {
    next(error);
  }
});

// Get genre performance analytics
router.get('/genres', async (req, res, next) => {
  try {
    const { period = '30' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get all genres from titles
    const { data: titles } = await supabase
      .from('titles')
      .select('genres');

    // Count genre occurrences
    const genreCounts = {};
    if (titles) {
      titles.forEach(title => {
        if (title.genres) {
          title.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        }
      });
    }

    // Get genre engagement (watchlist + progress)
    const { data: watchlistData } = await supabase
      .from('watchlist')
      .select(`
        title_id,
        titles!inner(genres)
      `)
      .gte('added_at', startDate.toISOString());

    const { data: progressData } = await supabase
      .from('progress')
      .select(`
        title_id,
        titles!inner(genres)
      `)
      .gte('updated_at', startDate.toISOString());

    // Count genre engagement
    const genreEngagement = {};
    
    const processGenreData = (data) => {
      if (data) {
        data.forEach(item => {
          if (item.titles?.genres) {
            item.titles.genres.forEach(genre => {
              if (!genreEngagement[genre]) {
                genreEngagement[genre] = { watchlist: 0, progress: 0 };
              }
            });
          }
        });
      }
    };

    processGenreData(watchlistData);
    processGenreData(progressData);

    // Count watchlist engagement per genre
    if (watchlistData) {
      watchlistData.forEach(item => {
        if (item.titles?.genres) {
          item.titles.genres.forEach(genre => {
            genreEngagement[genre].watchlist++;
          });
        }
      });
    }

    // Count progress engagement per genre
    if (progressData) {
      progressData.forEach(item => {
        if (item.titles?.genres) {
          item.titles.genres.forEach(genre => {
            genreEngagement[genre].progress++;
          });
        }
      });
    }

    // Calculate total engagement and sort
    const genreAnalytics = Object.entries(genreEngagement).map(([genre, data]) => ({
      genre,
      totalContent: genreCounts[genre] || 0,
      watchlistEngagement: data.watchlist,
      progressEngagement: data.progress,
      totalEngagement: data.watchlist + data.progress
    })).sort((a, b) => b.totalEngagement - a.totalEngagement);

    res.json({
      success: true,
      data: { 
        genreAnalytics,
        period: parseInt(period)
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get time-based analytics
router.get('/timeline', async (req, res, next) => {
  try {
    const { period = '30', interval = 'day' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user registrations over time
    const { data: registrations } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    // Get watchlist additions over time
    const { data: watchlistAdditions } = await supabase
      .from('watchlist')
      .select('added_at')
      .gte('added_at', startDate.toISOString())
      .order('added_at');

    // Get progress updates over time
    const { data: progressUpdates } = await supabase
      .from('progress')
      .select('updated_at')
      .gte('updated_at', startDate.toISOString())
      .order('updated_at');

    // Group data by time intervals
    const timelineData = {};
    
    const addToTimeline = (date, type) => {
      const key = date.toISOString().split('T')[0]; // Group by date
      if (!timelineData[key]) {
        timelineData[key] = { date: key, registrations: 0, watchlist: 0, progress: 0 };
      }
      timelineData[key][type]++;
    };

    // Process registrations
    if (registrations) {
      registrations.forEach(reg => {
        addToTimeline(new Date(reg.created_at), 'registrations');
      });
    }

    // Process watchlist additions
    if (watchlistAdditions) {
      watchlistAdditions.forEach(item => {
        addToTimeline(new Date(item.added_at), 'watchlist');
      });
    }

    // Process progress updates
    if (progressUpdates) {
      progressUpdates.forEach(item => {
        addToTimeline(new Date(item.updated_at), 'progress');
      });
    }

    // Convert to array and sort by date
    const timeline = Object.values(timelineData)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: { 
        timeline,
        period: parseInt(period),
        interval
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
