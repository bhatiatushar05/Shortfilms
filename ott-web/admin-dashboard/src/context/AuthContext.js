import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG, buildApiUrl, getEndpoint } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenVerified, setTokenVerified] = useState(false);

  // Function to set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      // Set token in axios headers for ALL future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      console.log('🔐 Token set in axios headers:', token.substring(0, 20) + '...');
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      console.log('🗑️ Token removed from axios headers');
    }
  };

  // Set up axios interceptor to handle 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && isAuthenticated) {
          console.log('🔄 Received 401 error, clearing authentication...');
          logout();
          alert('Your session has expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticated]);

  // Function to verify token validity
  const verifyToken = async (token) => {
    try {
      console.log('🔍 Verifying token...');
      setAuthToken(token);
      
      // Try to verify token by making a request to a protected endpoint
      const response = await axios.get(buildApiUrl(getEndpoint('USERS', 'LIST')));
      
      if (response.data.success) {
        // Token is valid, restore user session
        setUser({ id: 'admin', email: 'admin@shortcinema.com', role: 'admin' });
        setIsAuthenticated(true);
        setTokenVerified(true);
        console.log('✅ Token verified successfully');
        return true;
      }
    } catch (error) {
      console.log('❌ Token verification failed:', error.response?.status, error.response?.data?.message);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log('🔄 Token appears to be expired or invalid, clearing session...');
        // Clear invalid token and redirect to login
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setTokenVerified(false);
        // Show user-friendly message
        alert('Your session has expired. Please log in again.');
        return false;
      }
      
      // For other errors, still clear the session but don't show alert
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setTokenVerified(false);
      return false;
    }
  };

  // Check for existing token on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          console.log('🔄 Found existing token, verifying...');
          const isValid = await verifyToken(token);
          
          if (!isValid) {
            console.log('❌ Existing token is invalid, user needs to login again');
          }
        } else {
          console.log('ℹ️ No existing token found');
        }
      } catch (error) {
        console.error('❌ Error during auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔐 Attempting login with:', email);
      
      // Use real backend authentication
      const response = await axios.post(buildApiUrl(getEndpoint('AUTH', 'LOGIN')), {
        email,
        password
      });

      console.log('📡 Login response:', response.data);

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        console.log('✅ Login successful, setting token and user data');
        console.log('🎫 Token received:', token.substring(0, 20) + '...');
        
        // Set token and update auth state
        setAuthToken(token);
        setUser(user);
        setIsAuthenticated(true);
        setTokenVerified(true);
        setLoading(false);
        
        // Verify the token is working by making a test request
        try {
          console.log('🧪 Testing token with a protected request...');
          const testResponse = await axios.get(buildApiUrl(getEndpoint('USERS', 'LIST')));
          console.log('✅ Token test successful:', testResponse.data.success);
        } catch (testError) {
          console.error('❌ Token test failed:', testError.response?.status, testError.response?.data?.message);
        }
        
        console.log('✅ Login successful with real backend');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      setLoading(false);
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    
    // Clear token and reset auth state
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setTokenVerified(false);
    
    console.log('✅ Logout successful');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    tokenVerified,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
