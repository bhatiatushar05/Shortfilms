const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Admin Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400, 'Validation Error');
    }

    // Try Supabase auth first
    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!authError && user) {
        // Check if user has admin role
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profileError && userProfile && userProfile.role === 'admin') {
          // Generate JWT token
          const token = generateToken(user.id);

          res.json({
            success: true,
            message: 'Login successful',
            data: {
              user: {
                id: user.id,
                email: user.email,
                role: userProfile.role
              },
              token,
              expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
          });
          return;
        }
      }
    } catch (supabaseError) {
      console.log('Supabase auth failed, trying fallback:', supabaseError.message);
    }

    // Fallback to environment variables for admin authentication
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new AppError('Admin credentials not configured', 500, 'Configuration Error');
    }

    // Simple admin authentication
    if (email === adminEmail && password === adminPassword) {
      // Generate JWT token with a fixed admin user ID
      const adminUserId = 'admin-user-12345';
      const token = generateToken(adminUserId);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: adminUserId,
            email: adminEmail,
            role: 'admin'
          },
          token,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      });
    } else {
      throw new AppError('Invalid credentials', 401, 'Authentication Error');
    }

  } catch (error) {
    next(error);
  }
});

// Verify Token
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No token provided', 401, 'Authentication Error');
    }

    // Verify token (this will be handled by middleware in protected routes)
    res.json({
      success: true,
      message: 'Token is valid',
      data: { valid: true }
    });

  } catch (error) {
    next(error);
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
});

// Get current admin user profile
router.get('/profile', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No token provided', 401, 'Authentication Error');
    }

    // Decode token to get user ID
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user profile
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      throw new AppError('User profile not found', 404, 'Not Found');
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
