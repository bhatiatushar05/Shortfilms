const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('../backend/routes/auth');
const contentRoutes = require('../backend/routes/content');
const userRoutes = require('../backend/routes/users');
const analyticsRoutes = require('../backend/routes/analytics');
const mediaRoutes = require('../backend/routes/media');
const { errorHandler } = require('../backend/middleware/errorHandler');
const { authenticateToken } = require('../backend/middleware/auth');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://shortfilms-hcse.vercel.app"],
      mediaSrc: ["'self'", "https://shortfilms-hcse.vercel.app"],
      connectSrc: ["'self'", "https://shortfilms-hcse.vercel.app"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://shortfilms-hcse.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.path.startsWith('/auth');
  }
});
app.use('/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/content', authenticateToken, contentRoutes);
app.use('/users', authenticateToken, userRoutes);
app.use('/analytics', authenticateToken, analyticsRoutes);
app.use('/media', authenticateToken, mediaRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
