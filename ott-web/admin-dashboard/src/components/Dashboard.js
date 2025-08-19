import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Movie as MovieIcon,
  PlayCircle as PlayIcon,
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl, getEndpoint } from '../config/api';
import axios from 'axios';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    activeUsers: 0,
    totalWatchTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch real data from backend API
      const [usersResponse, contentResponse, analyticsResponse] = await Promise.all([
        axios.get(buildApiUrl(getEndpoint('USERS', 'LIST'))),
        axios.get(buildApiUrl(getEndpoint('CONTENT', 'TITLES'))),
        axios.get(buildApiUrl(getEndpoint('ANALYTICS', 'OVERVIEW')))
      ]);

      setStats({
        totalUsers: usersResponse.data.data.users?.length || 0,
        totalContent: contentResponse.data.data.titles?.length || 0,
        activeUsers: analyticsResponse.data.data.overview?.users?.total || 0,
        totalWatchTime: analyticsResponse.data.data.overview?.engagement?.progressEntries || 0,
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Show a more helpful error message
      if (error.code === 'ECONNREFUSED') {
        setError('Backend server not accessible. Please check if backend is running.');
      } else if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
      
      // Don't show fallback data - let user see the error
      setStats({
        totalUsers: 0,
        totalContent: 0,
        activeUsers: 0,
        totalWatchTime: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    // For now, show an alert. Later this will navigate to different components
    if (action === 'Add Content') {
      alert('Go to "Media Upload" section to add new content with poster, hero, and video files!');
    } else {
      alert(`Quick Action: ${action} - This feature will be implemented next!`);
    }
  };

  const chartData = [
    { name: 'Jan', users: 400, content: 240, views: 2400 },
    { name: 'Feb', users: 300, content: 139, views: 2210 },
    { name: 'Mar', users: 200, content: 980, views: 2290 },
    { name: 'Apr', users: 278, content: 390, views: 2000 },
    { name: 'May', users: 189, content: 480, views: 2181 },
    { name: 'Jun', users: 239, content: 380, views: 2500 },
  ];

  const pieData = [
    { name: 'Movies', value: 45, color: '#8884d8' },
    { name: 'Series', value: 35, color: '#82ca9d' },
    { name: 'Shorts', value: 20, color: '#ffc658' },
  ];

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
      height: '100%', 
      background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 100%)', 
      border: '1px solid rgba(220,38,38,0.2)',
      boxShadow: '0 8px 32px rgba(220,38,38,0.1)'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              color: color,
            }}
          >
            {icon}
          </Box>
          <IconButton size="small" onClick={fetchDashboardData} sx={{ color: '#dc2626' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1, color: color }}>
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Please log in to view the dashboard.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>
          Dashboard Overview
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label="Live" 
            color="success" 
            size="small" 
            icon={<TrendingIcon />}
            sx={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontWeight: 600
            }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {error} This is normal in development mode.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color="#1976d2"
            subtitle="+12% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Content"
            value={stats.totalContent}
            icon={<MovieIcon />}
            color="#dc004e"
            subtitle="+5 new this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<PlayIcon />}
            color="#2e7d32"
            subtitle="Currently online"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Watch Time (hrs)"
            value={stats.totalWatchTime}
            icon={<TrendingIcon />}
            color="#ed6c02"
            subtitle="+8% from last week"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 100%)', 
            border: '1px solid rgba(220,38,38,0.2)',
            boxShadow: '0 8px 32px rgba(220,38,38,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#dc2626' }}>
              Platform Growth
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <RechartsTooltip 
                  contentStyle={{ 
                    background: 'rgba(26, 26, 26, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#dc2626" strokeWidth={3} dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="content" stroke="#b91c1c" strokeWidth={3} dot={{ fill: '#b91c1c', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="views" stroke="#991b1b" strokeWidth={3} dot={{ fill: '#991b1b', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Content Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 100%)', 
            border: '1px solid rgba(220,38,38,0.2)',
            boxShadow: '0 8px 32px rgba(220,38,38,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#dc2626' }}>
              Content Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    background: 'rgba(26, 26, 26, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {pieData.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color, mr: 1 }} />
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ 
        p: 3, 
        mt: 3, 
        background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 100%)', 
        border: '1px solid rgba(220,38,38,0.2)',
        boxShadow: '0 8px 32px rgba(220,38,38,0.1)'
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#dc2626' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Add new content">
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }, 
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(220,38,38,0.05) 100%)', 
                  border: '1px solid rgba(220,38,38,0.2)' 
                }}
                onClick={() => handleQuickAction('Add Content')}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <MovieIcon sx={{ fontSize: 40, color: '#dc2626', mb: 1 }} />
                  <Typography variant="body2">Add Content</Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Upload media files">
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }, 
                  background: 'linear-gradient(135deg, rgba(185,28,28,0.1) 0%, rgba(185,28,28,0.05) 100%)', 
                  border: '1px solid rgba(185,28,28,0.2)' 
                }}
                onClick={() => handleQuickAction('Upload Media')}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <PlayIcon sx={{ fontSize: 40, color: '#b91c1c', mb: 1 }} />
                  <Typography variant="body2">Upload Media</Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="View user analytics">
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }, 
                  background: 'linear-gradient(135deg, rgba(153,27,27,0.1) 0%, rgba(153,27,27,0.05) 100%)', 
                  border: '1px solid rgba(153,27,27,0.2)' 
                }}
                onClick={() => handleQuickAction('View Analytics')}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <TrendingIcon sx={{ fontSize: 40, color: '#991b1b', mb: 1 }} />
                  <Typography variant="body2">View Analytics</Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Manage users">
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }, 
                  background: 'linear-gradient(135deg, rgba(127,29,29,0.1) 0%, rgba(127,29,29,0.05) 100%)', 
                  border: '1px solid rgba(127,29,29,0.2)' 
                }}
                onClick={() => handleQuickAction('Manage Users')}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#7f1d1d', mb: 1 }} />
                  <Typography variant="body2">Manage Users</Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
