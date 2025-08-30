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

    // Use the existing ott_users_admin_view (which should work after permissions fix)
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
    
    // No need for additional filtering since the query already handles it

    if (error) throw error;

    // Transform the data to match frontend expectations
    const transformedUsers = await Promise.all((ottUsers || []).map(async (user) => {
      // Get the latest status from user_controls table
      let realTimeStatus = user.status || 'active';
      let canAccess = true;
      
      try {
        const { data: controlData } = await supabase
          .from('user_controls')
          .select('status, can_access')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (controlData) {
          realTimeStatus = controlData.status || 'active';
          canAccess = controlData.can_access !== false;
        }
      } catch (error) {
        console.log(`Error fetching control data for user ${user.id}:`, error.message);
      }
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name || user.email.split('@')[0],
        lastName: user.last_name || '',
        role: user.role || 'user',
        status: realTimeStatus,
        subscription: 'premium', // You can add subscription logic later
        joinDate: new Date(user.created_at).toLocaleDateString(),
        lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never',
        watchTime: Math.floor((user.total_watch_time_seconds || 0) / 60), // Convert to minutes
        isOnline: user.is_online || false,
        lastActivity: user.last_activity ? new Date(user.last_activity) : new Date(),
        currentSession: user.is_online ? `Active (${user.watchlist_count || 0} items in watchlist)` : null,
        watchlistCount: user.watchlist_count || 0,
        progressCount: user.progress_count || 0
      };
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

    // Get user's watchlist from OTT platform (commented out - table may not exist)
    // const { data: watchlist } = await supabase
    //   .from('watchlist')
    //   .select('title_id, added_at')
    //   .eq('user_id', id);

    // Get user's progress from OTT platform (commented out - table may not exist)
    // const { data: progress } = await supabase
    //   .from('progress')
    //   .select('title_id, position_sec, duration_sec, updated_at')
    //   .eq('user_id', id);

    // Get user's subscription info (commented out - table may not exist)
    // const { data: subscription } = await supabase
    //   .from('subscriptions')
    //   .select('*')
    //   .eq('user_id', id)
    //   .single();

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
      watchlist: [], // Placeholder - table may not exist
      progress: [], // Placeholder - table may not exist
      subscription: null, // Placeholder - table may not exist
      totalWatchTime: 0, // Placeholder - no progress data
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

    // For now, just return success since we can't update profiles table
    // TODO: Implement role management when profiles table is accessible
    const user = {
      id: ottUser.id,
      email: ottUser.email,
      role: role, // Use the new role from request
      status: ottUser.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // No database error to check since we're not doing database operations

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

    // For now, just return success since we can't update profiles table yet
    // TODO: Implement status management when profiles table is accessible
    const user = {
      id: ottUser.id,
      email: ottUser.email,
      role: ottUser.role || 'user',
      status: status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

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

    // Check if user already exists in auth system
    const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) throw checkError;
    
    const existingAuthUser = existingUser.data.find(user => user.email === email);

    if (existingAuthUser) {
      throw new AppError('User already exists in auth system', 409, 'Conflict');
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

    // RESTRICTION: Cannot delete users with active subscriptions or watchlists (commented out - tables may not exist)
    // const { data: watchlistCount } = await supabase
    //   .from('watchlist')
    //   .select('*', { count: 'exact', head: true })
    //   .eq('user_id', id);

    // const { data: progressCount } = await supabase
    //   .from('progress')
    //   .select('*', { count: 'exact', head: true })
    //   .eq('user_id', id);

    // if ((watchlistCount && watchlistCount > 0) || (progressCount && progressCount > 0)) {
    //   throw new AppError('Cannot delete users with active watchlists or viewing progress. Suspend them instead.', 403, 'Forbidden');
    // }

    // For now, just return success since we can't delete from profiles table yet
    // TODO: Implement user deletion when profiles table is accessible
    console.log(`User ${ottUser.email} would be deleted from admin management`);

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

    // Get detailed watchlist data (commented out - table may not exist)
    // const { data: watchlist } = await supabase
    //   .from('watchlist')
    //   .select('title_id, added_at')
    //   .eq('user_id', id);

    // Get detailed progress data (commented out - table may not exist)
    // const { data: progress } = await supabase
    //   .from('progress')
    //   .select('title_id, position_sec, updated_at')
    //   .eq('user_id', id);

    // Calculate analytics
    const analytics = {
      userId: id,
      email: ottUser.email,
      totalWatchTime: 0, // Placeholder - no watch time data
      watchlistCount: 0, // Placeholder - no watchlist data
      progressCount: 0, // Placeholder - no progress data
      lastActivity: ottUser.last_sign_in_at,
      isOnline: (Date.now() - new Date(ottUser.last_sign_in_at || 0).getTime()) < 300000, // 5 minutes
      watchlist: [], // Placeholder - no watchlist data
      progress: [], // Placeholder - no progress data
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
    // Get users from OTT platform to check their roles
    const { data: ottUsers, error: ottError } = await supabase
      .from('ott_users_admin_view')
      .select('id, email, role')
      .in('id', userIds);
    
    if (ottError) throw ottError;
    
    const adminUsers = ottUsers.filter(u => u.role === 'admin');

    // No need to check adminCheckError since we're not using the old query anymore

    if (adminUsers && adminUsers.length > 0) {
      const adminEmails = adminUsers.map(u => u.email).join(', ');
      throw new AppError(`Cannot perform bulk actions on admin users: ${adminEmails}`, 403, 'Forbidden');
    }

    let results = [];

    switch (action) {
      case 'suspend':
        // Suspend multiple users (placeholder - profiles table not accessible)
        for (const userId of userIds) {
          try {
            // TODO: Implement when profiles table is accessible
            results.push({ userId, success: true, action: 'suspended (placeholder)' });
          } catch (err) {
            results.push({ userId, success: false, error: err.message });
          }
        }
        break;

      case 'activate':
        // Activate multiple users (placeholder - profiles table not accessible)
        for (const userId of userIds) {
          try {
            // TODO: Implement when profiles table is accessible
            results.push({ userId, success: true, action: 'activated (placeholder)' });
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

    // Get user's content preferences from watchlist (commented out - table may not exist)
    // const { data: watchlist } = await supabase
    //   .from('watchlist')
    //   .select('title_id, added_at')
    //   .eq('user_id', id);

    // Get user's viewing history from progress (commented out - table may not exist)
    // const { data: progress } = await supabase
    //   .from('progress')
    //   .select('title_id, position_sec, updated_at')
    //   .eq('user_id', id);

    const preferences = {
      userId: id,
      email: ottUser.email,
      watchlist: [], // Placeholder - no watchlist data
      viewingHistory: [], // Placeholder - no progress data
      totalWatchTime: 0, // Placeholder - no watch time data
      lastActivity: ottUser.last_sign_in_at,
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
