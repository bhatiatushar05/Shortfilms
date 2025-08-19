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

  // Configure axios base URL from config (without /api since it's already in BASE_URL)
  axios.defaults.baseURL = 'https://backend-cwhjl4t24-tushars-projects-87ac9c27.vercel.app';

  // Remove old functions that are no longer needed
  // const setAuthToken = (token) => {
  //   if (token) {
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //     localStorage.setItem('adminToken', token);
  //   } else {
  //     delete axios.defaults.headers.common['Authorization'];
  //     localStorage.removeItem('adminToken');
  //   }
  // };

  // const verifyToken = async () => {
  //   try {
  //     const response = await axios.get('/auth/verify');
  //     if (response.data.valid) {
  //       setUser(response.data.user);
  //       setIsAuthenticated(true);
  //     }
  //   } catch (error) {
  //     console.error('Token verification failed:', error);
  //     setAuthToken(null);
  //   }
  // };

  // Check for existing token on app startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Try to validate token by making a request
      axios.get(buildApiUrl(getEndpoint('USERS', 'LIST')))
        .then(response => {
          if (response.data.success) {
            // Token is valid, restore user session
            setUser({ id: 'admin', email: 'admin@shortcinema.com', role: 'admin' });
            setIsAuthenticated(true);
            console.log('✅ Restored session from existing token');
          }
        })
        .catch(error => {
          console.log('❌ Token expired, clearing session');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      // Use real backend authentication
      const response = await axios.post(buildApiUrl(getEndpoint('AUTH', 'LOGIN')), {
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Set default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update auth state
        setUser(user);
        setIsAuthenticated(true);
        setLoading(false);
        
        console.log('✅ Login successful with real backend');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.response?.data?.message || error.message || 'Login failed');
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Clear axios authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset auth state
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('✅ Logout successful');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
