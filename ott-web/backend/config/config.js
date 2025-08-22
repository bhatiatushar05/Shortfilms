/**
 * Backend Configuration Management
 * Centralized configuration with validation and fallbacks
 */

require('dotenv').config();

// Configuration validation
const validateConfig = () => {
  const requiredVars = {
    // Server
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    
    // Supabase
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // AWS (required for file storage)
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please check your .env file and ensure all required variables are set.');
    
    // In development, throw error
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    // In production, log warning but continue
    console.warn('⚠️ Continuing with missing configuration - some features may not work');
  }

  return true;
};

// Configuration object
const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: '7d',
  },

  // Admin Configuration
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@shortcinema.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  },

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    options: {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  },

  // AWS Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3: {
      bucketName: process.env.AWS_S3_BUCKET || 'shortcinema-ott-content',
      region: process.env.AWS_REGION || 'us-east-1',
    },
    cloudFront: {
      distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
      domain: process.env.AWS_CLOUDFRONT_DOMAIN,
      keyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID,
      privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
    },
    mediaConvert: {
      endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT,
      pipelineId: process.env.AWS_TRANSCODER_PIPELINE_ID,
    },
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    type: 'supabase', // or 'postgres', 'mysql', etc.
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'fallback-session-secret',
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24 hours
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
    enableErrorLogging: process.env.ENABLE_ERROR_LOGGING !== 'false',
  },

  // Feature Flags
  features: {
    awsStorage: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
    cloudFront: !!process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
    mediaConvert: !!process.env.AWS_MEDIACONVERT_ENDPOINT,
    qrAuth: true,
    analytics: true,
  },

  // Security Configuration
  security: {
    helmet: {
      enabled: true,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:"],
        },
      },
    },
    compression: {
      enabled: true,
      level: 6,
    },
  },
};

// Validate configuration on import
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error.message);
  
  // In production, continue with fallbacks
  if (process.env.NODE_ENV === 'production') {
    console.warn('Continuing with fallback configuration in production mode');
  }
}

// Configuration getters with validation
const getConfig = (key) => {
  const keys = key.split('.');
  let value = config;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Configuration key '${key}' not found`);
      return undefined;
    }
  }
  
  return value;
};

// Check if configuration is valid
const isConfigValid = () => {
  try {
    validateConfig();
    return true;
  } catch {
    return false;
  }
};

// Get all configuration
const getAllConfig = () => ({ ...config });

// Check if AWS is properly configured
const isAWSConfigured = () => {
  return !!(config.aws.accessKeyId && config.aws.secretAccessKey && config.aws.s3.bucketName);
};

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return !!(config.supabase.url && config.supabase.serviceRoleKey);
};

// Export configuration
module.exports = {
  config,
  getConfig,
  isConfigValid,
  getAllConfig,
  isAWSConfigured,
  isSupabaseConfigured,
};
