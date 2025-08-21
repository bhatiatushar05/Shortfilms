const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔍 Auth middleware - Token received:', token ? token.substring(0, 20) + '...' : 'No token');

    if (!token) {
      console.log('❌ Auth middleware - No token provided');
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token' 
      });
    }

    // Verify JWT token
    console.log('🔍 Auth middleware - Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Auth middleware - Token decoded successfully');
    console.log('🆔 Auth middleware - Decoded user ID:', decoded.userId);
    console.log('🔍 Auth middleware - Decoded user ID type:', typeof decoded.userId);
    
    // Check if this is our fallback admin user
    console.log('🔍 Auth middleware - Checking if fallback admin user...');
    if (decoded.userId === 'admin-user-12345') {
      console.log('✅ Auth middleware - Fallback admin user detected');
      req.user = {
        id: 'admin-user-12345',
        email: process.env.ADMIN_EMAIL || 'admin@shortcinema.com',
        role: 'admin'
      };
      console.log('✅ Auth middleware - Fallback admin user authenticated');
      next();
      return;
    }

    // Check if user exists in OTT platform (auth.users)
    console.log('🔍 Auth middleware - Looking up user in database...');
    let { data: user, error } = await supabase
      .from('ott_users_admin_view')
      .select('id, email, role')
      .eq('id', decoded.userId)
      .single();

    console.log('🔍 Auth middleware - OTT users view result:', { user, error });

    // If not found in view, check profiles table as fallback
    if (error || !user) {
      console.log('🔍 Auth middleware - User not found in OTT view, checking profiles table...');
      const { data: profileUser, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', decoded.userId)
        .single();

      console.log('🔍 Auth middleware - Profiles table result:', { profileUser, profileError });

      if (profileError || !profileUser) {
        console.log('❌ Auth middleware - User not found in any table');
        return res.status(401).json({ 
          error: 'Invalid token',
          message: 'User not found or token expired' 
        });
      }
      user = profileUser;
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin privileges required' 
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    console.error('❌ Auth middleware error name:', error.name);
    console.error('❌ Auth middleware error message:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Auth middleware - Invalid JWT token format');
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token is malformed or invalid' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('❌ Auth middleware - JWT token expired');
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please login again' 
      });
    }

    console.error('❌ Auth middleware - Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'Internal server error during authentication' 
    });
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = {
  authenticateToken,
  generateToken
};
