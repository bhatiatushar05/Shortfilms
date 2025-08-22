const { createClient } = require('@supabase/supabase-js');
const { config, isSupabaseConfigured } = require('./config');

// Validate Supabase configuration
if (!isSupabaseConfigured()) {
  const error = new Error('Missing Supabase environment variables');
  console.error('❌ Supabase configuration error:', error.message);
  console.error('Required variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('Please check your .env file');
  
  // In development, throw error
  if (config.server.isDevelopment) {
    throw error;
  }
  
  // In production, create fallback client with warnings
  console.warn('⚠️ Creating fallback Supabase client - functionality will be limited');
}

// Create Supabase client with proper configuration
let supabase;

try {
  supabase = createClient(
    config.supabase.url || 'https://placeholder.supabase.co',
    config.supabase.serviceRoleKey || 'placeholder-key',
    config.supabase.options
  );
  
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error);
  
  // Create minimal fallback client
  supabase = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Test database connection
const testConnection = async () => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping connection test');
      return false;
    }
    
    const { data, error } = await supabase
      .from('titles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
};

// Health check function
const healthCheck = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return {
        status: 'warning',
        message: 'Supabase not configured',
        timestamp: new Date().toISOString()
      };
    }
    
    const { data, error } = await supabase
      .from('titles')
      .select('count')
      .limit(1);
    
    if (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      status: 'healthy',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      data: data
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    if (!isSupabaseConfigured()) {
      return {
        status: 'warning',
        message: 'Supabase not configured',
        stats: null
      };
    }
    
    // Get table counts
    const [titlesCount, episodesCount, usersCount] = await Promise.allSettled([
      supabase.from('titles').select('*', { count: 'exact', head: true }),
      supabase.from('episodes').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true })
    ]);
    
    const stats = {
      titles: titlesCount.status === 'fulfilled' ? (titlesCount.value.count || 0) : 0,
      episodes: episodesCount.status === 'fulfilled' ? (episodesCount.value.count || 0) : 0,
      users: usersCount.status === 'fulfilled' ? (usersCount.value.count || 0) : 0,
      timestamp: new Date().toISOString()
    };
    
    return {
      status: 'success',
      message: 'Database statistics retrieved successfully',
      stats
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      stats: null
    };
  }
};

module.exports = {
  supabase,
  testConnection,
  healthCheck,
  getDatabaseStats,
  isConfigured: isSupabaseConfigured
};
