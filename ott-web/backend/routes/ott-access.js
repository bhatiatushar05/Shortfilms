const express = require('express');
const { supabase } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Check if user can access OTT platform
router.post('/check-access', async (req, res, next) => {
  try {
    const { userId, email } = req.body;

    if (!userId && !email) {
      throw new AppError('User ID or email is required', 400, 'Bad Request');
    }

    let userQuery = {};
    if (userId) {
      userQuery.id = userId;
    } else {
      userQuery.email = email;
    }

    // Check user_controls table for current status
    const { data: controlData, error: controlError } = await supabase
      .from('user_controls')
      .select('status, can_access, access_level, suspension_reason, restriction_reason')
      .eq(userId ? 'user_id' : 'email', userId || email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (controlError && controlError.code !== 'PGRST116') {
      console.error('Error checking user controls:', controlError);
      throw new AppError('Failed to check user access', 500, 'Internal Server Error');
    }

    let canAccess = true;
    let status = 'active';
    let message = 'Access granted';
    let details = {};

    if (controlData) {
      status = controlData.status || 'active';
      canAccess = controlData.can_access !== false;
      
      if (controlData.status === 'suspended') {
        canAccess = false;
        message = 'Access denied: Account suspended';
        details = {
          suspended_at: controlData.suspended_at,
          suspension_reason: controlData.suspension_reason
        };
      } else if (controlData.status === 'restricted') {
        canAccess = true;
        message = 'Access granted with restrictions';
        details = {
          access_level: controlData.access_level,
          restricted_at: controlData.restricted_at,
          restriction_reason: controlData.restriction_reason
        };
      }
    }

    res.json({
      success: true,
      data: {
        canAccess,
        status,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get user access status
router.get('/status/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check user_controls table for current status
    const { data: controlData, error: controlError } = await supabase
      .from('user_controls')
      .select('status, can_access, access_level, suspension_reason, restriction_reason')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (controlError && controlError.code !== 'PGRST116') {
      console.error('Error checking user controls:', controlError);
      throw new AppError('Failed to check user status', 500, 'Internal Server Error');
    }

    let canAccess = true;
    let status = 'active';
    let message = 'Access granted';
    let details = {};

    if (controlData) {
      status = controlData.status || 'active';
      canAccess = controlData.can_access !== false;
      
      if (controlData.status === 'suspended') {
        canAccess = false;
        message = 'Access denied: Account suspended';
        details = {
          suspended_at: controlData.suspended_at,
          suspension_reason: controlData.suspension_reason
        };
      } else if (controlData.status === 'restricted') {
        canAccess = true;
        message = 'Access granted with restrictions';
        details = {
          access_level: controlData.access_level,
          restricted_at: controlData.restricted_at,
          restriction_reason: controlData.restriction_reason
        };
      }
    }

    res.json({
      success: true,
      data: {
        userId,
        canAccess,
        status,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
});

// Block user from OTT platform (alternative to admin control)
router.post('/block', async (req, res, next) => {
  try {
    const { userId, reason } = req.body;

    if (!userId) {
      throw new AppError('User ID is required', 400, 'Bad Request');
    }

    // Update user_controls table
    const { data: controlRecord, error: controlError } = await supabase
      .from('user_controls')
      .upsert({
        user_id: userId,
        status: 'suspended',
        suspended_at: new Date().toISOString(),
        suspension_reason: reason || 'Blocked by system',
        can_access: false,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (controlError) throw controlError;

    res.json({
      success: true,
      message: 'User blocked from OTT platform',
      data: {
        userId,
        control: controlRecord
      }
    });

  } catch (error) {
    next(error);
  }
});

// Unblock user from OTT platform
router.post('/unblock', async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new AppError('User ID is required', 400, 'Bad Request');
    }

    // Update user_controls table
    const { data: controlRecord, error: controlError } = await supabase
      .from('user_controls')
      .upsert({
        user_id: userId,
        status: 'active',
        suspended_at: null,
        suspension_reason: null,
        can_access: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (controlError) throw controlError;

    res.json({
      success: true,
      message: 'User unblocked from OTT platform',
      data: {
        userId,
        control: controlRecord
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;

