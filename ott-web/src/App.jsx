import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { supabase } from './lib/supabase';

function App() {
  useEffect(() => {
    // Debug: Test Supabase connection
    console.log('🔍 Debug: Testing Supabase connection...');
    console.log('Environment variables:', {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length
    });

    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Supabase connection error:', error);
        } else {
          console.log('✅ Supabase connected successfully');
          console.log('Session data:', data);
        }
      } catch (err) {
        console.error('❌ Supabase connection failed:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-white mb-4">ShortCinema</h1>
          <p className="text-gray-400 mb-6">Check browser console for debug info</p>
          
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700">
            <h2 className="text-xl font-semibold text-white mb-4">Debug Mode</h2>
            <p className="text-gray-300 text-sm">
              Open Developer Tools (F12) and check the Console tab for connection status.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              If you see errors, please share them so I can help fix the issue.
            </p>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
