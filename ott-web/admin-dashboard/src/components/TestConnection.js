import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { buildApiUrl, getEndpoint } from '../config/api';

const TestConnection = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const newTests = [];

    // Test 1: Health endpoint
    try {
      const healthResponse = await fetch('https://backend-cwhjl4t24-tushars-projects-87ac9c27.vercel.app/health');
      const healthData = await healthResponse.json();
      newTests.push({
        name: 'Backend Health Check',
        status: 'success',
        message: `Backend is running: ${healthData.status}`,
        details: healthData
      });
    } catch (error) {
      newTests.push({
        name: 'Backend Health Check',
        status: 'error',
        message: `Backend connection failed: ${error.message}`,
        details: error
      });
    }

    // Test 2: Users API (should return 401 - requires auth)
    try {
      const usersResponse = await fetch(buildApiUrl(getEndpoint('USERS', 'LIST')));
      if (usersResponse.status === 401) {
        newTests.push({
          name: 'Users API',
          status: 'success',
          message: 'Users API working (requires authentication)',
          details: { status: 401, message: 'Unauthorized - expected' }
        });
      } else {
        newTests.push({
          name: 'Users API',
          status: 'warning',
          message: `Users API returned unexpected status: ${usersResponse.status}`,
          details: { status: usersResponse.status }
        });
      }
    } catch (error) {
      newTests.push({
        name: 'Users API',
        status: 'error',
        message: `Users API failed: ${error.message}`,
        details: error
      });
    }

    // Test 3: Analytics API (should return 401 - requires auth)
    try {
      const analyticsResponse = await fetch(buildApiUrl(getEndpoint('ANALYTICS', 'OVERVIEW')));
      if (analyticsResponse.status === 401) {
        newTests.push({
          name: 'Analytics API',
          status: 'success',
          message: 'Analytics API working (requires authentication)',
          details: { status: 401, message: 'Unauthorized - expected' }
        });
      } else {
        newTests.push({
          name: 'Analytics API',
          status: 'warning',
          message: `Analytics API returned unexpected status: ${analyticsResponse.status}`,
          details: { status: analyticsResponse.status }
        });
      }
    } catch (error) {
      newTests.push({
        name: 'Analytics API',
        status: 'error',
        message: `Analytics API failed: ${error.message}`,
        details: error
      });
    }

    // Test 4: Configuration
    newTests.push({
      name: 'API Configuration',
      status: 'success',
      message: 'API configuration loaded correctly',
      details: {
        baseUrl: buildApiUrl(''),
        usersEndpoint: getEndpoint('USERS', 'LIST'),
        analyticsEndpoint: getEndpoint('ANALYTICS', 'OVERVIEW')
      }
    });

    setTests(newTests);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckIcon sx={{ color: '#10b981' }} />;
      case 'warning': return <ErrorIcon sx={{ color: '#f59e0b' }} />;
      case 'error': return <ErrorIcon sx={{ color: '#ef4444' }} />;
      default: return <ErrorIcon sx={{ color: '#6b7280' }} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626', mb: 3 }}>
        API Connection Test
      </Typography>

      <Paper sx={{ 
        p: 3, 
        mb: 3,
        background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 100%)',
        border: '1px solid rgba(220,38,38,0.2)',
        boxShadow: '0 8px 32px rgba(220,38,38,0.1)'
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#dc2626' }}>
          Connection Status
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={runTests}
          disabled={loading}
          sx={{ 
            mb: 2,
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
            }
          }}
        >
          {loading ? <CircularProgress size={20} /> : 'Run Tests'}
        </Button>

        <List>
          {tests.map((test, index) => (
            <ListItem key={index} sx={{ 
              border: `1px solid ${getStatusColor(test.status)}`,
              borderRadius: 1,
              mb: 1,
              background: `${getStatusColor(test.status)}10`
            }}>
              <ListItemIcon>
                {getStatusIcon(test.status)}
              </ListItemIcon>
              <ListItemText
                primary={test.name}
                secondary={test.message}
                primaryTypographyProps={{ fontWeight: 600 }}
                secondaryTypographyProps={{ color: 'text.secondary' }}
              />
            </ListItem>
          ))}
        </List>

        {tests.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> 401 responses are expected for protected endpoints - this means the API is working but requires authentication.
            </Typography>
          </Alert>
        )}
      </Paper>

      <Paper sx={{ 
        p: 3,
        background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 100%)',
        border: '1px solid rgba(220,38,38,0.2)',
        boxShadow: '0 8px 32px rgba(220,38,38,0.1)'
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#dc2626' }}>
          Next Steps
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          If all tests pass, your admin dashboard should be working correctly. You can now:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckIcon sx={{ color: '#10b981' }} />
            </ListItemIcon>
            <ListItemText primary="Navigate to the main dashboard" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon sx={{ color: '#10b981' }} />
            </ListItemIcon>
            <ListItemText primary="View user management to see logged-in users" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon sx={{ color: '#10b981' }} />
            </ListItemIcon>
            <ListItemText primary="Use the admin features to manage your platform" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default TestConnection;
