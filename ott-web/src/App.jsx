import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppProviders from './app/AppProviders';
import AppRoutes from './app/routes';

function App() {
  console.log('App component loading...'); // Debug log
  console.log('Environment check:', {
    NODE_ENV: import.meta.env.NODE_ENV,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  });

  return (
    <Router>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </Router>
  );
}

export default App;
