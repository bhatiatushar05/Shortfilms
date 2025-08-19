import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ContentManagement from './components/ContentManagement';
import UserManagement from './components/UserManagement';
import Analytics from './components/Analytics';
import MediaUpload from './components/MediaUpload';
import Login from './components/Login';
import TestConnection from './components/TestConnection';
import { Box, Typography } from '@mui/material';
import './utils/debug'; // Import debug utility

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#dc2626', // Red-600
      light: '#ef4444', // Red-500
      dark: '#b91c1c', // Red-700
    },
    secondary: {
      main: '#991b1b', // Red-800
      light: '#dc2626', // Red-600
      dark: '#7f1d1d', // Red-900
    },
    background: {
      default: '#000000', // Pure black
      paper: '#0f0f0f', // Very dark gray
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
      main: '#dc2626', // Red-600
    },
    warning: {
      main: '#f59e0b', // Amber-500
    },
    success: {
      main: '#10b981', // Emerald-500
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 100%)',
          border: '1px solid rgba(220,38,38,0.2)',
          boxShadow: '0 8px 32px rgba(220,38,38,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 100%)',
          border: '1px solid rgba(220,38,38,0.2)',
          boxShadow: '0 8px 32px rgba(220,38,38,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
          },
        },
      },
    },
  },
});

function App() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleNavigation = (section) => {
    setCurrentSection(section);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentSection('dashboard');
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'content':
        return <ContentManagement />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'media':
        return <MediaUpload />;
      case 'drm':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              DRM & Security
            </Typography>
            <Typography variant="body1" color="text.secondary">
              DRM and security features will be implemented here.
            </Typography>
          </Box>
        );
      case 'monetization':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Monetization
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monetization features will be implemented here.
            </Typography>
          </Box>
        );
      case 'settings':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Settings and configuration will be implemented here.
            </Typography>
          </Box>
        );
      case 'test':
        return <TestConnection />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AuthProvider>
          <Login onLogin={handleLogin} />
        </AuthProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Layout onNavigate={handleNavigation} onLogout={handleLogout}>
          {renderContent()}
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
