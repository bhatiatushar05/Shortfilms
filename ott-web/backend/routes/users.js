const express = require('express');
const { supabase } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Get all users from OTT platform with real data
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search,
      status,
      role 
    } = req.query;

    // Use the new view to get real OTT platform users
    let query = supabase
      .from('ott_users_admin_view')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) query = query.ilike('email', `%${search}%`);
    if (status) query = query.eq('status', status);
    if (role) query = query.eq('role', role);

    // Get total count for pagination
    const { count } = await supabase
      .from('ott_users_admin_view')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: ottUsers, error } = await query;

    if (error) throw error;

    // Transform the data to match frontend expectations
    const transformedUsers = (ottUsers || []).map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name || user.email.split('@')[0],
      lastName: user.last_name || '',
      role: user.role || 'user',
      status: user.status || 'active',
      subscription: 'premium', // You can add subscription logic later
      joinDate: new Date(user.created_at).toLocaleDateString(),
      lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never',
      watchTime: Math.floor((user.total_watch_time_seconds || 0) / 60), // Convert to minutes
      isOnline: user.is_online || false,
      lastActivity: user.last_activity ? new Date(user.last_activity) : new Date(),
      currentSession: user.is_online ? `Active (${user.watchlist_count || 0} items in watchlist)` : null,
      watchlistCount: user.watchlist_count || 0,
      progressCount: user.progress_count || 0
    }));

    res.json({
      success: true,
      data: {
        users: transformedUsers,
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

// Get user by ID with detailed OTT platform information
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get user profile
    const { data: user, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError || !user) {
      throw new AppError('User not found', 404, 'Not Found');
    }

    // Get user's watchlist from OTT platform
    const { data: watchlist } = await supabase
      .from('watchlist')
      .select('title_id, added_at')
      .eq('user_id', id);

    // Get user's progress from OTT platform
    const { data: progress } = await supabase
      .from('progress')
      .select('title_id, position_sec, duration_sec, updated_at')
      .eq('user_id', id);

    // Get user's subscription info (if you have a subscriptions table)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', id)
      .single();

    // Enrich user data with OTT platform information
    const enrichedUser = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      status: user.status || 'active',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      first_name: user.first_name,
      last_name: user.last_name,
      watchlist: watchlist || [],
      progress: progress || [],
      subscription: subscription || null,
      totalWatchTime: progress ? progress.reduce((total, p) => total + p.position_sec, 0) : 0,
      isOnline: user.last_sign_in_at ? (Date.now() - new Date(user.last_sign_in_at).getTime()) < 300000 : false
    };

    res.json({
      success: true,
      data: { user: enrichedUser }
    });

  } catch (error) {
    next(error);
  }
});

// Update user role (admin action)
router.patch('/:id/role', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin', 'moderator'].includes(role)) {
      throw new AppError('Invalid role', 400, 'Bad Request');
    }

    // Check if user exists in OTT platform
    const { data: ottUser, error: ottError } = await supabase
      .from('ott_users_admin_view')
      .select('id, email, role')
      .eq('id', id)
      .single();

    if (ottError || !ottUser) {
      throw new AppError('User not found in OTT platform', 404, 'Not Found');
    }

    // Update or insert into profiles table for admin management
    const { data: user, error } = await supabase
      .from('profiles')
      .upsert({ 
        id, 
        email: ottUser.email, 
        role,
        status: ottUser.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
});

// Update user status (admin action)
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'suspended', 'banned'].includes(status)) {
      throw new AppError('Invalid status', 400, 'Bad Request');
    }

    // Check if user exists in OTT platform
    const { data: ottUser, error: ottError } = await supabase
      .from('ott_users_admin_view')
      .select('id, email, role')
      .eq('id', id)
      .single();

    if (ottError || !ottUser) {
      throw new AppError('User not found in OTT platform', 404, 'Not Found');
    }

    // Update or insert into profiles table for admin management
    const { data: user, error } = await supabase
      .from('profiles')
      .upsert({ 
        id, 
        email: ottUser.email, 
        role: ottUser.role || 'user',
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
});

// Add new user (admin action) - RESTRICTED
router.post('/', async (req, res, next) => {
  try {
    const { email, role = 'user', status = 'active' } = req.body;

    // Validate input
    if (!email || !email.includes('@')) {
      throw new AppError('Valid email is required', 400, 'Bad Request');
    }

    // Check if user already exists in OTT platform
    const { data: existingUser, error: checkError } = await supabase
      .from('ott_users_admin_view')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new AppError('User already exists in OTT platform', 409, 'Conflict');
    }

    // For now, we'll only allow creating profiles for existing OTT users
    // Creating actual OTT users requires Supabase Auth which should be done through the OTT platform
    throw new AppError('Cannot create new OTT users from admin panel. Users must register through the OTT platform first.', 403, 'Forbidden');

  } catch (error) {
    next(error);
  }
});

// Delete user (admin action) - RESTRICTED
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists in OTT platform
    const { data: ottUser, error: ottError } = await supabase
      .from('ott_users_admin_view')
      .select('id, email, role')
      .eq('id', id)
      .single();

    if (ottError || !ottUser) {
      throw new AppError('User not found in OTT platform', 404, 'Not Found');
    }

    // RESTRICTION: Cannot delete admin users
    if (ottUser.role === 'admin') {
      throw new AppError('Cannot delete admin users', 403, 'Forbidden');
    }

    // RESTRICTION: Cannot delete users with active subscriptions or watchlists
    const { data: watchlistCount } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    const { data: progressCount } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    if ((watchlistCount && watchlistCount > 0) || (progressCount && progressCount > 0)) {
      throw new AppError('Cannot delete users with active watchlists or viewing progress. Suspend them instead.', 403, 'Forbidden');
    }

    // Only delete from profiles table (admin management)
    // Keep OTT platform user data intact
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({
      success: true,
      message: 'User removed from admin management successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Get user analytics (admin action) - RESTRICTED
router.get('/:id/analytics', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists in OTT platform
    const { data: ottUser, error: ottError } = await supabase
      .from('ott_users_admin_view')
      .select('*')
      .eq('id', id)
      .single();

    if (ottError || !ottUser) {
      throw new AppError('User not found in OTT platform', 404, 'Not Found');
    }

    // Get detailed watchlist data
    const { data: watchlist } = await supabase
      .from('watchlist')
      .select('title_id, added_at')
      .eq('user_id', id);

    // Get detailed progress data
    const { data: progress } = await supabase
      .from('progress')
      .select('title_id, position_sec, updated_at')
      .eq('user_id', id);

    // Calculate analytics
    const analytics = {
      userId: id,
      email: ottUser.email,
      totalWatchTime: Math.floor((ottUser.total_watch_time_seconds || 0) / 60), // minutes
      watchlistCount: ottUser.watchlist_count || 0,
      progressCount: ottUser.progress_count || 0,
      lastActivity: ottUser.last_activity,
      isOnline: ottUser.is_online,
      watchlist: watchlist || [],
      progress: progress || [],
      joinDate: ottUser.created_at,
      lastLogin: ottUser.last_sign_in_at
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    next(error);
  }
});

// Bulk user actions (admin action) - RESTRICTED
router.post('/bulk-action', async (req, res, next) => {
  try {
    const { action, userIds, data } = req.body;

    if (!action || !userIds || !Array.isArray(userIds)) {
      throw new AppError('Invalid bulk action parameters', 400, 'Bad Request');
    }

    // RESTRICTION: Cannot perform bulk actions on admin users
    const { data: adminUsers, error: adminCheckError } = await supabase
      .from('ott_users_admin_view')
      .select('id, email, role')
      .in('id', userIds)
      .eq('role', 'admin');

    if (adminCheckError) throw adminCheckError;

    if (adminUsers && adminUsers.length > 0) {
      const adminEmails = adminUsers.map(u => u.email).join(', ');
      throw new AppError(`Cannot perform bulk actions on admin users: ${adminEmails}`, 403, 'Forbidden');
    }

    let results = [];

    switch (action) {
      case 'suspend':
        // Suspend multiple users
        for (const userId of userIds) {
          try {
            const { data: user, error } = await supabase
              .from('profiles')
              .upsert({ 
                id: userId, 
                status: 'suspended',
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (!error && user) {
              results.push({ userId, success: true, action: 'suspended' });
            } else {
              results.push({ userId, success: false, error: error?.message });
            }
          } catch (err) {
            results.push({ userId, success: false, error: err.message });
          }
        }
        break;

      case 'activate':
        // Activate multiple users
        for (const userId of userIds) {
          try {
            const { data: user, error } = await supabase
              .from('profiles')
              .upsert({ 
                id: userId, 
                status: 'active',
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (!error && user) {
              results.push({ userId, success: true, action: 'activated' });
            } else {
              results.push({ userId, success: false, error: error?.message });
            }
          } catch (err) {
            results.push({ userId, success: false, error: err.message });
          }
        }
        break;

      default:
        throw new AppError('Invalid bulk action', 400, 'Bad Request');
    }

    res.json({
      success: true,
      message: `Bulk action '${action}' completed`,
      data: { results }
    });

  } catch (error) {
    next(error);
  }
});

// Get user preferences (admin action) - RESTRICTED
router.get('/:id/preferences', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists in OTT platform
    const { data: ottUser, error: ottError } = await supabase
      .from('ott_users_admin_view')
      .select('*')
      .eq('id', id)
      .single();

    if (ottError || !ottUser) {
      throw new AppError('User not found in OTT platform', 404, 'Not Found');
    }

    // Get user's content preferences from watchlist
    const { data: watchlist } = await supabase
      .from('watchlist')
      .select('title_id, added_at')
      .eq('user_id', id);

    // Get user's viewing history from progress
    const { data: progress } = await supabase
      .from('progress')
      .select('title_id, position_sec, updated_at')
      .eq('user_id', id);

    const preferences = {
      userId: id,
      email: ottUser.email,
      watchlist: watchlist || [],
      viewingHistory: progress || [],
      totalWatchTime: Math.floor((ottUser.total_watch_time_seconds || 0) / 60),
      lastActivity: ottUser.last_activity,
      subscription: 'premium' // You can add real subscription logic later
    };

    res.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
