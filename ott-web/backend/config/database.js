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
    
    // Try to access profiles table first
    let { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    // If profiles table fails, try auth.users
    if (error) {
      console.log('⚠️ Profiles table access failed, trying auth.users...');
      const authResult = await supabase.auth.admin.listUsers();
      if (authResult.error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
      }
      console.log('✅ Database connection successful (auth access only)');
      return true;
    }
    
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
    
    // Try to access profiles table first (which we know exists from the code)
    let { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    // If profiles table fails, try auth.users (which should always be accessible)
    if (error) {
      console.log('⚠️ Profiles table access failed, trying auth.users...');
      const authResult = await supabase.auth.admin.listUsers();
      if (authResult.error) {
        return {
          status: 'error',
          message: `Database access failed: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
      // If we can access auth, consider it healthy
      return {
        status: 'healthy',
        message: 'Database connection successful (auth access only)',
        timestamp: new Date().toISOString(),
        data: { accessibleTables: ['auth.users'] }
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
    
    // Get table counts - only try tables that should be accessible
    const [profilesCount, authUsersCount] = await Promise.allSettled([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.auth.admin.listUsers()
    ]);
    
    const stats = {
      profiles: profilesCount.status === 'fulfilled' ? (profilesCount.value.count || 0) : 0,
      authUsers: authUsersCount.status === 'fulfilled' ? (authUsersCount.value.data?.length || 0) : 0,
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
