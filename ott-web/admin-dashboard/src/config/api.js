// API Configuration
export const API_CONFIG = {
  // Backend API base URL
  BASE_URL: 'http://localhost:3001/api',
  
  // API endpoints
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify', // Added missing VERIFY endpoint
    },
    
    // Users
    USERS: {
      LIST: '/users',
      DETAIL: (id) => `/users/${id}`,
      ROLE: (id) => `/users/${id}/role`,
      STATUS: (id) => `/users/${id}/status`,
      ANALYTICS: (id) => `/users/${id}/analytics`,
      PREFERENCES: (id) => `/users/${id}/preferences`,
    },
    
    // Content
    CONTENT: {
      TITLES: '/content/titles',
      TITLE: (id) => `/content/titles/${id}`,
      CREATE: '/content/titles',
      UPDATE: (id) => `/content/titles/${id}`,
      DELETE: (id) => `/content/titles/${id}`,
    },
    
    // Analytics
    ANALYTICS: {
      OVERVIEW: '/analytics/overview',
      CONTENT: '/analytics/content',
      ENGAGEMENT: '/analytics/engagement',
      GENRES: '/analytics/genres',
      TIMELINE: '/analytics/timeline',
    },
    
    // AWS S3 Media (Updated for proper integration)
    AWS_MEDIA: {
      UPLOAD_MOVIE: '/aws-media/upload-movie',
      UPLOAD_THUMBNAIL: '/aws-media/upload-thumbnail',
      UPLOAD_EPISODE: '/aws-media/upload-episode',
      LIST_FILES: '/aws-media/list-files',
      DELETE_FILE: (key) => `/aws-media/delete-file/${key}`,
      STORAGE_STATS: '/aws-media/storage-stats',
      TEST_CONNECTION: '/aws-media/test-connection',
      CREATE_BUCKET: '/aws-media/create-bucket',
    },
    
    // Legacy Media (for backward compatibility)
    MEDIA: {
      UPLOAD_VIDEO: '/media/upload/video',
      UPLOAD_IMAGE: '/media/upload/image',
      UPLOAD_CONTENT: '/media/upload-content',
    },
    
    // Admin Control
    ADMIN_CONTROL: {
      OTT_USER_CONTROL: '/admin/ott-user/control',
      OTT_USER_SUBSCRIPTION: '/admin/ott-user/subscription',
    },
  },
  
  // Request configuration
  REQUEST_CONFIG: {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint URL
export const getEndpoint = (category, action, params = {}) => {
  const endpoint = API_CONFIG.ENDPOINTS[category]?.[action];
  if (typeof endpoint === 'function') {
    // Handle different parameter patterns
    if (action === 'TITLE' && params.id) {
      return endpoint(params.id);
    } else if (action === 'DETAIL' && params.id) {
      return endpoint(params.id);
    } else if (action === 'ROLE' && params.id) {
      return endpoint(params.id);
    } else if (action === 'STATUS' && params.id) {
      return endpoint(params.id);
    } else if (action === 'ANALYTICS' && params.id) {
      return endpoint(params.id);
    } else if (action === 'PREFERENCES' && params.id) {
      return endpoint(params.id);
    } else if (action === 'UPDATE' && params.id) {
      return endpoint(params.id);
    } else if (action === 'DELETE' && params.id) {
      return endpoint(params.id);
    } else if (action === 'DELETE_FILE' && params.key) {
      return endpoint(params.key);
    } else {
      // For other functions, pass the params object
      return endpoint(params);
    }
  }
  return endpoint;
};
