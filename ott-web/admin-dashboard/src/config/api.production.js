// Production API Configuration
export const API_CONFIG = {
  // Backend API base URL - UPDATE THIS WITH YOUR VERCEL BACKEND URL
  BASE_URL: process.env.REACT_APP_API_URL || 'https://your-backend-url.vercel.app/api',
  
  // API endpoints
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
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
    },
    
    // Analytics
    ANALYTICS: {
      OVERVIEW: '/analytics/overview',
      CONTENT: '/analytics/content',
      ENGAGEMENT: '/analytics/engagement',
      GENRES: '/analytics/genres',
      TIMELINE: '/analytics/timeline',
    },
    
    // Media
    MEDIA: {
      UPLOAD_VIDEO: '/media/upload/video',
      UPLOAD_IMAGE: '/media/upload/image',
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
    return endpoint(params);
  }
  return endpoint;
};
