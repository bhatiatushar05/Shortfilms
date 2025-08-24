// API Configuration
const API_CONFIG = {
  // Backend server URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // API endpoints
  ENDPOINTS: {
    QR_AUTH: {
      GENERATE_QR: '/api/qr-auth/generate-qr',
      SEND_OTP: '/api/qr-auth/send-otp',
      VERIFY_OTP: '/api/qr-auth/verify-otp',
      QR_STATUS: '/api/qr-auth/qr-status',
      COMPLETE_AUTH: '/api/qr-auth/complete-qr-auth',
      STATS: '/api/qr-auth/qr-stats'
    },
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      VERIFY: '/api/auth/verify',
      PROFILE: '/api/auth/profile'
    }
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export the config
export default API_CONFIG;




