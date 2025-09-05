const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import centralized configuration
const { config, isConfigValid } = require('./config/config');

// Import routes
const authRoutes = require('./routes/auth');
const qrAuthRoutes = require('./routes/qr-auth');
const contentRoutes = require('./routes/content');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const mediaRoutes = require('./routes/media');
const adminControlRoutes = require('./routes/admin-control');
const awsMediaRoutes = require('./routes/aws-media');
const hybridPipelineRoutes = require('./routes/hybrid-pipeline');
const healthRoutes = require('./routes/health');
const ottAccessRoutes = require('./routes/ott-access');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Validate configuration on startup
if (!isConfigValid()) {
  console.warn('⚠️ Configuration validation failed - some features may not work properly');
}

// Security middleware with configuration
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: config.security.helmet.contentSecurityPolicy
}));

// CORS configuration
app.use(cors({
  origin: config.server.cors.origin,
  credentials: config.server.cors.credentials
}));

// Handle CORS preflight requests
app.options('*', cors());

// Rate limiting with configuration - Apply only to content and media routes
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting only to specific routes that need it
app.use('/api/content', limiter);
app.use('/api/media', limiter);
app.use('/api/users', limiter);
app.use('/api/analytics', limiter);
app.use('/api/admin', limiter);
app.use('/api/aws-media', limiter);
app.use('/api/hybrid-pipeline', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression and logging with configuration
if (config.security.compression.enabled) {
  app.use(compression({ level: config.security.compression.level }));
}

if (config.logging.enableRequestLogging) {
  app.use(morgan(config.logging.format));
}

// Health check endpoint (legacy)
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
      environment: config.server.nodeEnv,
      database: dbStatus,
      uptime: process.uptime(),
      version: config.app?.version || '1.0.0'
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/qr-auth', qrAuthRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/admin', adminControlRoutes);
app.use('/api/aws-media', awsMediaRoutes);
app.use('/api/hybrid-pipeline', hybridPipelineRoutes);
app.use('/api/ott-access', ottAccessRoutes);

// Health check routes (new comprehensive system)
app.use('/api/health', healthRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ShortCinema OTT Platform API',
    version: config.app?.version || '1.0.0',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/docs'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/',
      '/health',
      '/api/auth',
      '/api/content',
      '/api/users',
      '/api/analytics',
      '/api/media',
      '/api/admin',
      '/api/aws-media',
      '/api/hybrid-pipeline',
      '/api/health'
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log('🚀 ShortCinema OTT Platform Backend Server');
  console.log('==========================================');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.server.nodeEnv}`);
  console.log(`📦 Version: ${config.app?.version || '1.0.0'}`);
  console.log(`🗄️ Database: ${config.supabase?.url ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`☁️ AWS Storage: ${config.features?.awsStorage ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🌐 CORS Origin: ${config.server.cors.origin.join(', ')}`);
  console.log(`📊 Rate Limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 1000 / 60} minutes`);
  console.log('==========================================');
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔗 System Health: http://localhost:${PORT}/api/health`);
  console.log('==========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
