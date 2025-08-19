// Debug utility for admin dashboard
export const debug = {
  // Log API calls
  logApiCall: (endpoint, method, data = null) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log(`🔗 API ${method}: ${endpoint}`, data);
    }
  },

  // Log API responses
  logApiResponse: (endpoint, response) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log(`✅ API Response ${endpoint}:`, response);
    }
  },

  // Log API errors
  logApiError: (endpoint, error) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.error(`❌ API Error ${endpoint}:`, error);
    }
  },

  // Test API connectivity
  testApiConnection: async () => {
    try {
      const response = await fetch('https://backend-cwhjl4t24-tushars-projects-87ac9c27.vercel.app/health');
      const data = await response.json();
      console.log('✅ Backend health check passed:', data);
      return true;
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      return false;
    }
  },

  // Test API endpoints
  testApiEndpoints: async () => {
    const endpoints = [
              'https://backend-cwhjl4t24-tushars-projects-87ac9c27.vercel.app/api/users',
        'https://backend-cwhjl4t24-tushars-projects-87ac9c27.vercel.app/api/analytics/overview',
        'https://backend-cwhjl4t24-tushars-projects-87ac9c27.vercel.app/api/content/titles'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.error(`❌ ${endpoint}: ${error.message}`);
      }
    }
  },

  // Get environment info
  getEnvironmentInfo: () => {
    return {
      nodeEnv: process.env.NODE_ENV,
      apiUrl: process.env.REACT_APP_API_URL,
      debug: process.env.REACT_APP_DEBUG,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  }
};

// Auto-run tests if debug is enabled
if (process.env.REACT_APP_DEBUG === 'true') {
  console.log('🐛 Debug mode enabled');
  console.log('🌍 Environment:', debug.getEnvironmentInfo());
  
  // Test backend connection
  setTimeout(() => {
    debug.testApiConnection();
    debug.testApiEndpoints();
  }, 2000);
}
