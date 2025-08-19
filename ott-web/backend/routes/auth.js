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

    // Find user in Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !user) {
      throw new AppError('Invalid credentials', 401, 'Authentication Error');
    }

    // Check if user has admin role (you'll need to add this to your auth.users table)
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== 'admin') {
      throw new AppError('Access denied. Admin privileges required.', 403, 'Authorization Error');
    }

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
