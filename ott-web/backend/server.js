const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path'); // Added for serving static files

const authRoutes = require('./routes/auth');
const qrAuthRoutes = require('./routes/qr-auth');
const contentRoutes = require('./routes/content');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const mediaRoutes = require('./routes/media');
const adminControlRoutes = require('./routes/admin-control');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:5001", "https://localhost:5001"],
      mediaSrc: ["'self'", "http://localhost:5001", "https://localhost:5001"],
      connectSrc: ["'self'", "http://localhost:5001", "https://localhost:5001"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"]
    }
  }
}));
app.use(cors({
  origin: true, // Allow ALL origins in production
  credentials: true
}));

// Handle CORS preflight requests
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased from 100 to 1000
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and admin dashboard
    return req.path === '/health' || req.path.startsWith('/api/auth');
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connectivity
    let dbStatus = 'unknown';
    try {
      const { data, error } = await require('./config/database').supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        dbStatus = 'error';
        console.error('❌ Health check - Database error:', error);
      } else {
        dbStatus = 'connected';
        console.log('✅ Health check - Database connected');
      }
    } catch (dbError) {
      dbStatus = 'unreachable';
      console.error('❌ Health check - Database unreachable:', dbError);
    }

    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/qr-auth', qrAuthRoutes);
app.use('/api/content', authenticateToken, contentRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/media', authenticateToken, mediaRoutes);
app.use('/api/admin-control', authenticateToken, adminControlRoutes);

// Serve uploaded files (public access, no authentication required)
app.use('/uploads', (req, res, next) => {
  // Add CORS headers for uploads
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Fix Cross-Origin Resource Policy issues
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  next();
}, express.static(path.join(__dirname, 'uploads')));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Admin Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
