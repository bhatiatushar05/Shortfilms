const express = require('express');
const { supabase } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Control OTT platform user access (suspend/activate)
router.post('/ott-user/control', async (req, res, next) => {
  try {
    const { userId, action, reason } = req.body;

    if (!userId || !action) {
      throw new AppError('User ID and action are required', 400, 'Bad Request');
    }

    if (!['suspend', 'activate', 'restrict'].includes(action)) {
      throw new AppError('Invalid action. Use: suspend, activate, or restrict', 400, 'Bad Request');
    }

    // Check if user exists in OTT platform
    const { data: ottUser, error: ottError } = await supabase
      .from('ott_users_admin_view')
      .select('id, email, role')
      .eq('id', userId)
      .single();

    if (ottError || !ottUser) {
      throw new AppError('User not found in OTT platform', 404, 'Not Found');
    }

    // Cannot control admin users
    if (ottUser.role === 'admin') {
      throw new AppError('Cannot control admin users', 403, 'Forbidden');
    }

    let controlData = {};
    let message = '';

    switch (action) {
      case 'suspend':
        // Suspend user in OTT platform
        controlData = {
          status: 'suspended',
          suspended_at: new Date().toISOString(),
          suspension_reason: reason || 'Suspended by admin',
          can_access: false
        };
        message = 'User suspended from OTT platform';
        
        // Also update Supabase auth metadata to block access
        try {
          const { error: supabaseError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              status: 'suspended',
              suspended_at: new Date().toISOString(),
              suspension_reason: reason || 'Suspended by admin',
              can_access: false
            }
          });
          
          if (supabaseError) {
            console.log('⚠️ Warning: Could not update Supabase user metadata:', supabaseError.message);
          } else {
            console.log('✅ Supabase user metadata updated for suspension');
          }
        } catch (supabaseErr) {
          console.log('⚠️ Warning: Supabase integration failed:', supabaseErr.message);
        }
        break;

      case 'activate':
        // Activate user in OTT platform
        controlData = {
          status: 'active',
          suspended_at: null,
          suspension_reason: null,
          can_access: true
        };
        message = 'User activated in OTT platform';
        
        // Also update Supabase auth metadata to restore access
        try {
          const { error: supabaseError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              status: 'active',
              suspended_at: null,
              suspension_reason: null,
              can_access: true
            }
          });
          
          if (supabaseError) {
            console.log('⚠️ Warning: Could not update Supabase user metadata:', supabaseError.message);
          } else {
            console.log('✅ Supabase user metadata updated for activation');
          }
        } catch (supabaseErr) {
          console.log('⚠️ Warning: Supabase integration failed:', supabaseErr.message);
        }
        break;

      case 'restrict':
        // Restrict user access (limited functionality)
        controlData = {
          status: 'restricted',
          restricted_at: new Date().toISOString(),
          restriction_reason: reason || 'Restricted by admin',
          can_access: true,
          access_level: 'limited'
        };
        message = 'User access restricted in OTT platform';
        
        // Also update Supabase auth metadata for restriction
        try {
          const { error: supabaseError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              status: 'restricted',
              restricted_at: new Date().toISOString(),
              restriction_reason: reason || 'Restricted by admin',
              can_access: true,
              access_level: 'limited'
            }
          });
          
          if (supabaseError) {
            console.log('⚠️ Warning: Could not update Supabase user metadata:', supabaseError.message);
          } else {
            console.log('✅ Supabase user metadata updated for restriction');
          }
        } catch (supabaseErr) {
          console.log('⚠️ Warning: Supabase integration failed:', supabaseErr.message);
        }
        break;
    }

    // Update user control in a new table for OTT platform control
    const { data: controlRecord, error: controlError } = await supabase
      .from('user_controls')
      .upsert({
        user_id: userId,
        email: ottUser.email,
        ...controlData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (controlError) throw controlError;

    // Also update the profiles table for admin dashboard consistency
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: ottUser.email,
        status: controlData.status,
        updated_at: new Date().toISOString()
      });

    res.json({
      success: true,
      message,
      data: {
        userId,
        email: ottUser.email,
        action,
        control: controlRecord
      }
    });

  } catch (error) {
    next(error);
  }
});

// Debug endpoint to check user_controls table
router.get('/debug/user-controls/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    console.log('🔍 Debug: Checking user_controls for userId:', userId);
    
    // Check user_controls table directly
    const { data: control, error: controlError } = await supabase
      .from('user_controls')
      .select('*')
      .eq('user_id', userId);

    console.log('🔍 Debug: Control query result:', { control, controlError });
    
    if (controlError) {
      return res.json({ error: controlError.message, controlError });
    }

    // Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    console.log('🔍 Debug: Profile query result:', { profile, profileError });

    res.json({
      success: true,
      debug: {
        userId,
        userControls: control,
        profile: profile,
        controlError: controlError?.message,
        profileError: profileError?.message
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get OTT platform user control status
router.get('/ott-user/:userId/status', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Get user control status from user_controls table (get the latest record)
    console.log('🔍 Querying user_controls for userId:', userId);
    const { data: control, error: controlError } = await supabase
      .from('user_controls')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    console.log('🔍 Control query result:', { control, controlError });

    // Get user status from profiles table (this is where admin dashboard updates it)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('🔍 Status check - Control data:', control);
    console.log('🔍 Status check - Profile data:', profile);
    console.log('🔍 Status check - Control error:', controlError);
    console.log('🔍 Status check - Profile error:', profileError);

    if (controlError && controlError.code !== 'PGRST116') {
      console.log('❌ Control error:', controlError);
    }
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.log('❌ Profile error:', profileError);
    }

    // Get user info from OTT platform
    const { data: ottUser, error: ottError } = await supabase
      .from('ott_users_admin_view')
      .select('*')
      .eq('id', userId)
      .single();

    if (ottError || !ottUser) {
      throw new AppError('User not found in OTT platform', 404, 'Not Found');
    }

    // Debug logging
    console.log('Status check for user:', userId);
    console.log('Control data:', control);
    console.log('can_access value:', control?.can_access);
    console.log('can_access type:', typeof control?.can_access);
    console.log('can_access !== false:', control?.can_access !== false);

    // Determine status and access - prioritize user_controls table since that's what admin control API updates
    let status = 'active';
    let canAccess = true;
    
    if (control) {
      status = control.status || 'active';
      canAccess = control.can_access !== false;
      console.log(`🔍 User ${userId}: Using control status=${status}, can_access=${control.can_access}, canAccess=${canAccess}`);
    } else if (profile && profile.status) {
      status = profile.status;
      canAccess = profile.status !== 'suspended';
      console.log(`🔍 User ${userId}: Using profile status=${status}, canAccess=${canAccess}`);
    } else {
      console.log(`🔍 User ${userId}: No status records found, using defaults`);
    }

    const userStatus = {
      userId,
      email: ottUser.email,
      status: status,
      canAccess: canAccess,
      accessLevel: control?.access_level || 'full',
      suspendedAt: control?.suspended_at,
      suspensionReason: control?.suspension_reason,
      restrictedAt: control?.restricted_at,
      restrictionReason: control?.restriction_reason,
      lastActivity: ottUser.last_activity,
      isOnline: ottUser.is_online
    };

    console.log('Final userStatus:', userStatus);

    res.json({
      success: true,
      data: userStatus
    });

  } catch (error) {
    next(error);
  }
});

// Update user subscription in OTT platform
router.post('/ott-user/subscription', async (req, res, next) => {
  try {
    const { userId, subscription, planDetails } = req.body;

    if (!userId || !subscription) {
      throw new AppError('User ID and subscription are required', 400, 'Bad Request');
    }

    if (!['free', 'basic', 'premium', 'pro'].includes(subscription)) {
      throw new AppError('Invalid subscription type', 400, 'Bad Request');
    }

    // Check if user exists in OTT platform
    const { data: ottUser, error: ottError } = await supabase
      .from('ott_users_admin_view')
      .select('id, email, role')
      .eq('id', userId)
      .single();

    if (ottError || !ottUser) {
      throw new AppError('User not found in OTT platform', 404, 'Not Found');
    }

    // Update subscription in profiles table
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: ottUser.email,
        subscription,
        subscription_details: planDetails || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Also update a subscriptions table for OTT platform
    const { data: subscriptionRecord, error: subError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        email: ottUser.email,
        subscription_type: subscription,
        plan_details: planDetails || {},
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (subError) throw subError;

    res.json({
      success: true,
      message: `User subscription updated to ${subscription}`,
      data: {
        userId,
        email: ottUser.email,
        subscription,
        planDetails,
        profile: updatedProfile,
        subscriptionRecord
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
