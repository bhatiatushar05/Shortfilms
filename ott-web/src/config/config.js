/**
 * Centralized Configuration Management
 * Handles all environment variables with validation and fallbacks
 */

// Environment validation
const validateEnvironment = () => {
  const requiredVars = {
    // Frontend required
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  console.log('🔍 Environment variables check:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
  });

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please check your .env.local file and ensure all required variables are set.');
    console.error('Current values:', requiredVars);
    
    // In development, show helpful error
    if (import.meta.env.DEV) {
      console.warn('⚠️ Continuing without Supabase configuration - authentication will not work');
      return false; // Don't throw error, just warn
    }
  }

  return true;
};

// Configuration object
const config = {
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'ShortCinema',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENV || 'development',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },

  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    options: {
      persistSession: true,
      storageKey: 'ott-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      auth: {
        persistSession: true,
      },
    },
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
    retries: 3,
  },

  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    enabled: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  },

  // Feature Flags
  features: {
    qrLogin: import.meta.env.VITE_ENABLE_QR_LOGIN === 'true',
    stripeBilling: import.meta.env.VITE_ENABLE_STRIPE_BILLING === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },

  // Storage Configuration
  storage: {
    prefix: 'shortcinema',
    version: 'v1',
  },

  // Error Handling
  errors: {
    showDetails: import.meta.env.DEV,
    logToConsole: true,
    reportToService: import.meta.env.PROD,
  },
};

// Validate environment on import
try {
  validateEnvironment();
} catch (error) {
  console.error('Configuration validation failed:', error.message);
  
  // In production, continue with fallbacks
  if (import.meta.env.PROD) {
    console.warn('Continuing with fallback configuration in production mode');
  }
}

// Configuration getters with validation
export const getConfig = (key) => {
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
export const isConfigValid = () => {
  try {
    validateEnvironment();
    return true;
  } catch {
    return false;
  }
};

// Get all configuration
export const getAllConfig = () => ({ ...config });

// Default export
export default config;
