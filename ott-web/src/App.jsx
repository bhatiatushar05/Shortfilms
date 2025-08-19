import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Suspended Account Component
function SuspendedAccount() {
  const navigate = useNavigate();

  const handleTryDifferentAccount = () => {
    // Clear any stored session data
    localStorage.removeItem('ott-auth');
    sessionStorage.clear();
    
    // Navigate to sign-in page
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">
            Your account is currently suspended. Please contact the administrator for assistance.
          </p>
          
          <button
            onClick={handleTryDifferentAccount}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Try Different Account
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [isSuspended, setIsSuspended] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is suspended
    const checkSuspension = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check user profile for suspension status
          const { data: profile } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.status === 'suspended') {
            setIsSuspended(true);
          }
        }
      } catch (error) {
        console.log('No active session or error checking profile');
      } finally {
        setLoading(false);
      }
    };

    checkSuspension();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (isSuspended) {
    return <SuspendedAccount />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-4">ShortCinema</h1>
        <p className="text-gray-400 mb-6">Welcome to ShortCinema</p>
        
        <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700">
          <h2 className="text-xl font-semibold text-white mb-4">Account Status</h2>
          <p className="text-gray-300 text-sm">
            Your account is active and ready to use.
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrapper with Router
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
