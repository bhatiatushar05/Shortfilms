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
      default: '#0f0f0f', // Dark gray instead of pure black
      paper: '#1a1a1a', // Slightly lighter dark gray
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
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    body1: {
      letterSpacing: '0.01em',
    },
    body2: {
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%)',
          border: '1px solid rgba(220,38,38,0.2)',
          boxShadow: '0 4px 20px rgba(220,38,38,0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(220,38,38,0.25)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%)',
          border: '1px solid rgba(220,38,38,0.2)',
          boxShadow: '0 4px 20px rgba(220,38,38,0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
            boxShadow: '0 6px 20px rgba(220,38,38,0.4)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.1)',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
  },
});

function App() {
  const [currentSection, setCurrentSection] = useState('dashboard');

  const handleNavigation = (section) => {
    setCurrentSection(section);
  };

  const handleLogout = () => {
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

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Login />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
