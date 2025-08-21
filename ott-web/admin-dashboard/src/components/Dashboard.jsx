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
  Skeleton,
  Avatar,
  Button,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People as PeopleIcon,
  Movie as MovieIcon,
  PlayCircle as PlayIcon,
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as OrdersIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Message as MessageIcon,
  AccountCircle as AccountIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  Area,
  AreaChart,
  ComposedChart,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl, getEndpoint } from '../config/api';
import axios from 'axios';

const Dashboard = () => {
  const { isAuthenticated, tokenVerified } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    activeUsers: 0,
    totalWatchTime: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openContentModal, setOpenContentModal] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenContentModal = () => {
    setOpenContentModal(true);
  };

  const handleCloseContentModal = () => {
    setOpenContentModal(false);
  };

  // Only fetch data when both authenticated AND token is verified
  useEffect(() => {
    if (isAuthenticated && tokenVerified) {
      console.log('✅ Dashboard: Authentication and token verified, fetching data...');
      fetchDashboardData();
    } else if (isAuthenticated && !tokenVerified) {
      console.log('⏳ Dashboard: Authenticated but token not yet verified, waiting...');
    } else {
      console.log('❌ Dashboard: Not authenticated, cannot fetch data');
    }
  }, [isAuthenticated, tokenVerified]);

  const fetchDashboardData = async () => {
    try {
      console.log('📡 Dashboard: Starting API calls...');
      setLoading(true);
      setError('');
      
      const [usersResponse, contentResponse, analyticsResponse] = await Promise.all([
        axios.get(buildApiUrl(getEndpoint('USERS', 'LIST'))),
        axios.get(buildApiUrl(getEndpoint('CONTENT', 'TITLES'))),
        axios.get(buildApiUrl(getEndpoint('ANALYTICS', 'OVERVIEW')))
      ]);

      console.log('✅ Dashboard: All API calls successful');
      console.log('👥 Users response:', usersResponse.data);
      console.log('🎬 Content response:', contentResponse.data);
      console.log('📊 Analytics response:', analyticsResponse.data);

      setStats({
        totalUsers: usersResponse.data.data.users?.length || 0,
        totalContent: contentResponse.data.data.titles?.length || 0,
        activeUsers: analyticsResponse.data.data.overview?.users?.total || 0,
        totalWatchTime: analyticsResponse.data.data.overview?.engagement?.progressEntries || 0,
      });
      
    } catch (error) {
      console.error('❌ Dashboard: Error fetching dashboard data:', error);
      console.error('❌ Dashboard: Error response:', error.response?.data);
      console.error('❌ Dashboard: Error status:', error.response?.status);
      
      if (error.code === 'ECONNREFUSED') {
        setError('Backend server not accessible. Please check if backend is running.');
      } else if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
      
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

  // Generate comprehensive chart data
  const getGrowthData = () => {
    const baseValue = Math.max(stats.totalUsers, 1);
    const contentValue = Math.max(stats.totalContent, 1);
    
    return [
      { month: 'Jan', users: Math.floor(baseValue * 0.6), content: Math.floor(contentValue * 0.5), views: Math.floor(baseValue * 0.7), revenue: Math.floor(baseValue * 0.3) },
      { month: 'Feb', users: Math.floor(baseValue * 0.7), content: Math.floor(contentValue * 0.6), views: Math.floor(baseValue * 0.8), revenue: Math.floor(baseValue * 0.4) },
      { month: 'Mar', users: Math.floor(baseValue * 0.8), content: Math.floor(contentValue * 0.7), views: Math.floor(baseValue * 0.85), revenue: Math.floor(baseValue * 0.5) },
      { month: 'Apr', users: Math.floor(baseValue * 0.85), content: Math.floor(contentValue * 0.8), views: Math.floor(baseValue * 0.9), revenue: Math.floor(baseValue * 0.6) },
      { month: 'May', users: Math.floor(baseValue * 0.9), content: Math.floor(contentValue * 0.9), views: Math.floor(baseValue * 0.95), revenue: Math.floor(baseValue * 0.7) },
      { month: 'Jun', users: baseValue, content: contentValue, views: baseValue, revenue: Math.floor(baseValue * 0.8) },
    ];
  };

  const getContentDistribution = () => {
    const total = Math.max(stats.totalContent, 3);
    const movies = Math.max(Math.floor(total * 0.4), 1);
    const series = Math.max(Math.floor(total * 0.35), 1);
    const shorts = Math.max(total - movies - series, 1);
    
    return [
      { name: 'Movies', value: movies, color: '#dc2626', percentage: Math.round((movies / total) * 100) },
      { name: 'Series', value: series, color: '#b91c1b', percentage: Math.round((series / total) * 100) },
      { name: 'Shorts', value: shorts, color: '#991b1b', percentage: Math.round((shorts / total) * 100) },
    ];
  };

  const getPerformanceMetrics = () => {
    return [
      { name: 'Content Delivery', value: 82, color: '#10b981', status: 'Good', icon: '📦' },
      { name: 'User Engagement', value: 75, color: '#f59e0b', status: 'Average', icon: '👥' },
      { name: 'System Performance', value: 78, color: '#dc2626', status: 'Good', icon: '⚡' },
      { name: 'Data Security', value: 95, color: '#3b82f6', status: 'Excellent', icon: '🔒' },
      { name: 'Network Uptime', value: 99, color: '#8b5cf6', status: 'Excellent', icon: '🌐' },
      { name: 'API Response', value: 87, color: '#06b6d4', status: 'Good', icon: '🔌' },
    ];
  };

  const getRevenueData = () => {
    const baseValue = Math.max(stats.totalUsers, 1);
    return [
      { month: 'Jan', revenue: Math.floor(baseValue * 0.3), subscriptions: Math.floor(baseValue * 0.2) },
      { month: 'Feb', revenue: Math.floor(baseValue * 0.4), subscriptions: Math.floor(baseValue * 0.25) },
      { month: 'Mar', revenue: Math.floor(baseValue * 0.5), subscriptions: Math.floor(baseValue * 0.3) },
      { month: 'Apr', revenue: Math.floor(baseValue * 0.6), subscriptions: Math.floor(baseValue * 0.35) },
      { month: 'May', revenue: Math.floor(baseValue * 0.7), subscriptions: Math.floor(baseValue * 0.4) },
      { month: 'Jun', revenue: Math.floor(baseValue * 0.8), subscriptions: Math.floor(baseValue * 0.45) },
    ];
  };

  const getTopContent = () => {
    const content = [
      { 
        title: 'Wednesday S1', 
        views: 16647, 
        rating: 4.5, 
        genre: 'Comedy',
        thumbnail: 'https://example.com/wednesday.jpg',
        change: '+15%',
        duration: '45m per episode',
        totalEpisodes: 8
      },
      { 
        title: 'Avengers: Endgame', 
        views: 12484, 
        rating: 4.8, 
        genre: 'Action',
        thumbnail: 'https://example.com/endgame.jpg',
        change: '+12%',
        duration: '3h 2m',
        releaseYear: 2019
      },
      { 
        title: 'Stranger Things S4', 
        views: 10633, 
        rating: 4.7, 
        genre: 'Sci-Fi',
        thumbnail: 'https://example.com/stranger-things.jpg',
        change: '+10%',
        duration: '1h per episode',
        totalEpisodes: 9
      },
      { 
        title: 'Breaking Bad S5', 
        views: 9547, 
        rating: 4.9, 
        genre: 'Drama',
        thumbnail: 'https://example.com/breaking-bad.jpg',
        change: '+8%',
        duration: '45m per episode',
        totalEpisodes: 16
      },
      { 
        title: 'The Crown S6', 
        views: 8932, 
        rating: 4.6, 
        genre: 'Drama',
        thumbnail: 'https://example.com/the-crown.jpg',
        change: '+7%',
        duration: '1h per episode',
        totalEpisodes: 10
      },
      { 
        title: 'Black Mirror S6', 
        views: 8245, 
        rating: 4.4, 
        genre: 'Sci-Fi',
        thumbnail: 'https://example.com/black-mirror.jpg',
        change: '+6%',
        duration: '1h per episode',
        totalEpisodes: 6
      },
      { 
        title: 'The Witcher S3', 
        views: 7856, 
        rating: 4.3, 
        genre: 'Fantasy',
        thumbnail: 'https://example.com/witcher.jpg',
        change: '+5%',
        duration: '1h per episode',
        totalEpisodes: 8
      },
      { 
        title: 'Inception', 
        views: 7234, 
        rating: 4.8, 
        genre: 'Sci-Fi',
        thumbnail: 'https://example.com/inception.jpg',
        change: '+4%',
        duration: '2h 28m',
        releaseYear: 2010
      },
      { 
        title: 'Dark S3', 
        views: 6789, 
        rating: 4.7, 
        genre: 'Mystery',
        thumbnail: 'https://example.com/dark.jpg',
        change: '+3%',
        duration: '1h per episode',
        totalEpisodes: 8
      },
      { 
        title: 'Peaky Blinders S6', 
        views: 6543, 
        rating: 4.8, 
        genre: 'Crime',
        thumbnail: 'https://example.com/peaky-blinders.jpg',
        change: '+2%',
        duration: '1h per episode',
        totalEpisodes: 6
      }
    ];
    return content.sort((a, b) => b.views - a.views);
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend, change }) => (
    <Card sx={{ 
      height: '100%', 
      background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.8) 100%)', 
      backdropFilter: 'blur(10px)',
      border: `1px solid ${color}40`,
      boxShadow: `0 4px 20px ${color}20`,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 30px ${color}30`,
        '&::before': {
          opacity: 1,
        }
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(145deg, ${color}10 0%, transparent 100%)`,
        opacity: 0,
        transition: 'opacity 0.3s ease',
      }
    }}>
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: `linear-gradient(145deg, ${color}30 0%, ${color}10 100%)`,
              color: color,
              border: `1px solid ${color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 15px ${color}20`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 6px 20px ${color}30`,
              }
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 28 } })}
          </Box>
          {trend && (
            <Chip 
              label={`${change > 0 ? '+' : ''}${change}%`}
              size="small"
              sx={{ 
                backgroundColor: change > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: change > 0 ? '#10b981' : '#ef4444',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: `1px solid ${change > 0 ? '#10b98140' : '#ef444440'}`,
                height: 28,
                backdropFilter: 'blur(5px)',
                '&:hover': {
                  backgroundColor: change > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                }
              }}
            />
          )}
        </Box>
        <Box sx={{ position: 'relative' }}>
          <Typography variant="h3" component="div" 
            sx={{ 
              fontWeight: 700, 
              mb: 1.5, 
              color: color, 
              fontSize: '2.75rem',
              textShadow: `0 2px 10px ${color}40`,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'baseline',
              gap: 1
            }}>
          {value.toLocaleString()}
            <Typography 
              component="span" 
              sx={{ 
                fontSize: '1rem', 
                color: 'rgba(255,255,255,0.6)', 
                fontWeight: 500,
                letterSpacing: 0
              }}>
              {trend && 'this month'}
        </Typography>
          </Typography>
          <Typography variant="h6" sx={{ 
            mb: 1.5, 
            color: 'white', 
            fontWeight: 600,
            letterSpacing: '0.01em',
            fontSize: '1.1rem'
          }}>
          {title}
        </Typography>
          <Typography variant="body2" sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            letterSpacing: '0.02em'
          }}>
          {subtitle}
        </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const ChartCard = ({ title, children, height = 400, subtitle }) => (
    <Paper sx={{ 
      p: 3.5, 
      height: height,
      background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.8) 100%)', 
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(220,38,38,0.3)',
      boxShadow: '0 4px 20px rgba(220,38,38,0.15)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 30px rgba(220,38,38,0.2)',
        '&::before': {
          opacity: 1,
        }
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(145deg, rgba(220,38,38,0.05) 0%, transparent 100%)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          mb: 3.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            color: '#dc2626', 
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(220,38,38,0.2)'
          }}>
            {title}
          </Typography>
        {subtitle && (
          typeof subtitle === 'string' ? (
            <Typography 
              variant="body2" 
              sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                letterSpacing: '0.02em'
              }}
            >
              {subtitle}
            </Typography>
          ) : (
            subtitle
          )
        )}
      </Box>
      {children}
      </Box>
    </Paper>
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
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" width="60%" height={60} sx={{ mb: 4 }} />
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rectangular" height={500} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rectangular" height={500} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 3, sm: 4, md: 5 }, 
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)', 
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        mb: { xs: 4, sm: 5, md: 6 }, 
        flexWrap: 'wrap', 
        gap: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -40,
          left: -40,
          right: -40,
          height: '200%',
          background: 'radial-gradient(circle at top right, rgba(220,38,38,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              color: '#dc2626', 
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(220,38,38,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            Dashboard Overview
          <Chip 
            label="Live" 
            color="success" 
              size="small" 
            icon={<TrendingIcon />}
            sx={{ 
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)',
                color: '#10b981',
              fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
                border: '1px solid rgba(16,185,129,0.3)',
                backdropFilter: 'blur(5px)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(5,150,105,0.3) 100%)',
                }
              }}
            />
          </Typography>
          <Typography 
            variant="body1" 
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              maxWidth: '600px',
              lineHeight: 1.6,
              letterSpacing: '0.01em'
            }}
          >
            Welcome back! Here's a comprehensive overview of your platform's performance metrics, user engagement, and content analytics.
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          position: 'relative',
          zIndex: 1
        }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            sx={{
              background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(185,28,28,0.1) 100%)',
              color: '#dc2626',
              border: '1px solid rgba(220,38,38,0.3)',
              backdropFilter: 'blur(10px)',
              px: 3,
              py: 1.2,
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(220,38,38,0.2) 0%, rgba(185,28,28,0.2) 100%)',
                borderColor: 'rgba(220,38,38,0.4)',
              }
            }}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 4, backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <Typography variant="body2">
            {error} This is normal in development mode.
          </Typography>
        </Alert>
      )}

      {/* Top Stats Cards */}
      <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color="#2563eb"
            subtitle="Total registered users across all regions"
            trend={true}
            change={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Content"
            value={stats.totalContent}
            icon={<MovieIcon />}
            color="#dc2626"
            subtitle="Combined library of movies, series & shorts"
            trend={true}
            change={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<PlayIcon />}
            color="#10b981"
            subtitle="Users currently streaming content"
            trend={true}
            change={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Watch Time"
            value={stats.totalWatchTime}
            icon={<TrendingIcon />}
            color="#f59e0b"
            subtitle="Total hours of content streamed"
            trend={true}
            change={15}
          />
        </Grid>
      </Grid>

      {/* Main Charts Section */}
      <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
        {/* Platform Growth Trends */}
        <Grid item xs={12} lg={8}>
          <ChartCard title="Platform Growth Trends" subtitle="Comprehensive monthly performance analysis" height={500}>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={getGrowthData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                  tickMargin={10}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                  tickMargin={10}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    background: 'rgba(17, 17, 17, 0.95)', 
                    border: '1px solid rgba(220,38,38,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    padding: '12px 16px',
                    color: 'white'
                  }}
                  cursor={{ stroke: 'rgba(220,38,38,0.3)', strokeWidth: 1 }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#2563eb" 
                  fill="#2563eb" 
                  fillOpacity={0.1} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#dc2626" 
                  strokeWidth={2.5} 
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 4, strokeDasharray: '' }}
                  activeDot={{ r: 6, stroke: '#dc2626', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="content" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4, strokeDasharray: '' }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#f59e0b" 
                  strokeWidth={2.5} 
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4, strokeDasharray: '' }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Content Distribution */}
        <Grid item xs={12} lg={4}>
          <ChartCard title="Content Distribution" subtitle="Detailed breakdown by content categories" height={500}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <Pie
                  data={getContentDistribution()}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {getContentDistribution().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    background: 'rgba(17, 17, 17, 0.95)', 
                    border: '1px solid rgba(220,38,38,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    padding: '12px 16px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 4 }}>
              {getContentDistribution().map((item, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2, 
                  p: 2.5, 
                  borderRadius: 2,
                  background: `linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateX(4px)',
                    background: `linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)`,
                    borderColor: 'rgba(255,255,255,0.15)',
                  }
                }}>
                  <Box sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    bgcolor: item.color,
                    mr: 3,
                    border: '2px solid rgba(255,255,255,0.1)',
                    boxShadow: `0 2px 8px ${item.color}40`
                  }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ 
                      color: 'white', 
                      fontWeight: 600,
                      mb: 0.5,
                      fontSize: '0.95rem'
                    }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.8rem'
                    }}>
                      {item.percentage}% of total content
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: item.color,
                    textShadow: `0 2px 8px ${item.color}40`
                  }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Performance & Revenue Section */}
      <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
        {/* Platform Performance */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Platform Performance" subtitle="Real-time system health and performance metrics" height={500}>
            <Box sx={{ mb: 3 }}>
              {getPerformanceMetrics().map((item, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: index < getPerformanceMetrics().length - 1 ? 3 : 0,
                    p: 2.5,
                    borderRadius: 2,
                    background: `linear-gradient(145deg, ${item.color}10 0%, transparent 100%)`,
                    border: `1px solid ${item.color}20`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      background: `linear-gradient(145deg, ${item.color}15 0%, ${item.color}05 100%)`,
                      borderColor: `${item.color}30`,
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2.5 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(145deg, ${item.color}20 0%, ${item.color}10 100%)`,
                        border: `1px solid ${item.color}30`,
                        boxShadow: `0 4px 12px ${item.color}20`,
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: item.color,
                          textShadow: `0 2px 8px ${item.color}40`
                        }}>
                          {item.icon}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ 
                          color: 'white', 
                          fontWeight: 600,
                          mb: 0.5,
                          fontSize: '0.95rem'
                        }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: '0.8rem'
                        }}>
                          Last updated 5 mins ago
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h5" sx={{ 
                        color: item.color, 
                        fontWeight: 700,
                        textShadow: `0 2px 8px ${item.color}40`
                      }}>
                        {item.value}%
                      </Typography>
                      <Chip 
                        label={item.status} 
                        size="small" 
                        sx={{ 
                          backgroundColor: `${item.color}15`, 
                          color: item.color,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                          border: `1px solid ${item.color}30`,
                          backdropFilter: 'blur(5px)',
                          '&:hover': {
                            backgroundColor: `${item.color}20`,
                          }
                        }} 
                      />
                    </Box>
                  </Box>
                  <Box sx={{ position: 'relative' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.value} 
                    sx={{ 
                        height: 10, 
                        borderRadius: 5, 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${item.color}90 0%, ${item.color} 100%)`,
                          borderRadius: 5,
                          boxShadow: `0 2px 8px ${item.color}40`,
                        }
                      }} 
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: `${item.value}%`,
                        transform: 'translate(-50%, -50%)',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: item.color,
                        border: '3px solid rgba(255,255,255,0.2)',
                        boxShadow: `0 2px 8px ${item.color}60`,
                        zIndex: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translate(-50%, -50%) scale(1.2)',
                          boxShadow: `0 4px 12px ${item.color}80`,
                      }
                    }} 
                  />
                  </Box>
                </Box>
              ))}
            </Box>
          </ChartCard>
        </Grid>

        {/* Revenue Analytics */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Revenue Analytics" subtitle="Monthly revenue and subscription growth analysis" height={500}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getRevenueData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                  tickMargin={10}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                  tickMargin={10}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    background: 'rgba(17, 17, 17, 0.95)', 
                    border: '1px solid rgba(220,38,38,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    padding: '12px 16px',
                    color: 'white'
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#dc2626" 
                  radius={[6, 6, 0, 0]}
                  background={{ fill: 'rgba(220,38,38,0.1)' }}
                >
                  {getRevenueData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={`url(#revenueGradient-${index})`}
                    />
                  ))}
                  <defs>
                    {getRevenueData().map((entry, index) => (
                      <linearGradient
                        key={`gradient-${index}`}
                        id={`revenueGradient-${index}`}
                        x1="0" y1="0" x2="0" y2="1"
                      >
                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.4}/>
                      </linearGradient>
                    ))}
                  </defs>
                </Bar>
                <Bar 
                  dataKey="subscriptions" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]}
                  background={{ fill: 'rgba(16,185,129,0.1)' }}
                >
                  {getRevenueData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={`url(#subscriptionGradient-${index})`}
                    />
                  ))}
                  <defs>
                    {getRevenueData().map((entry, index) => (
                      <linearGradient
                        key={`gradient-${index}`}
                        id={`subscriptionGradient-${index}`}
                        x1="0" y1="0" x2="0" y2="1"
                      >
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                      </linearGradient>
                    ))}
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Bottom Section - Top Content & Admin Profile */}
      <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
        {/* Top Performing Content */}
        <Grid item xs={12} md={6}>
          <ChartCard 
            title="Top Performing Content" 
            subtitle={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Most engaging content based on viewer metrics
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleOpenContentModal}
                  sx={{
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(220,38,38,0.1)',
                    }
                  }}
                >
                  View All
                </Button>
              </Box>
            } 
            height={500}
          >
            <Box sx={{ mt: 2 }}>
              {getTopContent().slice(0, 3).map((item, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                    mb: index < 2 ? 1.5 : 0,
                  p: 2,
                  borderRadius: 2,
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  '&:hover': {
                      transform: 'translateX(4px)',
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      '& .rank-badge': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 8px 24px rgba(220,38,38,0.4)',
                      },
                      '& .content-title': {
                        color: '#dc2626',
                      },
                      '& .views-count': {
                        transform: 'scale(1.05)',
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(145deg, rgba(220,38,38,0.1) 0%, transparent 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover::before': {
                      opacity: 1,
                    }
                  }}
                >
                  <Box 
                    className="rank-badge"
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 2, 
                      background: 'linear-gradient(145deg, #dc2626 0%, #b91c1c 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 3,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 20px rgba(220,38,38,0.3)',
                      border: '2px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    #{index + 1}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      className="content-title"
                      variant="h6" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 600, 
                        mb: 1,
                        transition: 'color 0.3s ease',
                        fontSize: '1rem',
                        letterSpacing: '0.01em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {item.title}
                      <Chip 
                        label={item.change} 
                        size="small" 
                        sx={{ 
                          height: 20,
                          backgroundColor: 'rgba(16,185,129,0.1)',
                          color: '#10b981',
                          border: '1px solid rgba(16,185,129,0.2)',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={item.genre} 
                        size="small" 
                        sx={{ 
                          fontSize: '0.75rem', 
                          height: 24,
                          backgroundColor: 'rgba(220,38,38,0.1)',
                          color: '#dc2626',
                          border: '1px solid rgba(220,38,38,0.2)',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'rgba(220,38,38,0.15)',
                          }
                        }} 
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5,
                        color: '#f59e0b',
                        background: 'rgba(245,158,11,0.1)',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        border: '1px solid rgba(245,158,11,0.2)'
                      }}>
                        <Typography sx={{ fontSize: '1rem' }}>⭐</Typography>
                        <Typography 
                          sx={{ 
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#f59e0b'
                          }}
                        >
                          {item.rating}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="caption" 
                        sx={{
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: '0.75rem'
                        }}
                      >
                        {item.duration}
                      </Typography>
                    </Box>
                  </Box>
                  <Box 
                    className="views-count"
                    sx={{ 
                      textAlign: 'right',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#dc2626', 
                        fontWeight: 700,
                        textShadow: '0 2px 8px rgba(220,38,38,0.2)',
                        mb: 0.5,
                        fontSize: '1.25rem'
                      }}
                    >
                      {item.views.toLocaleString()}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Total Views
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </ChartCard>

          {/* Top Content Modal */}
          <Dialog
            fullScreen={fullScreen}
            open={openContentModal}
            onClose={handleCloseContentModal}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.8) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(220,38,38,0.3)',
                borderRadius: 3,
              }
            }}
          >
            <DialogTitle sx={{ 
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              p: 3
            }}>
              <Typography variant="h5" sx={{ 
                color: '#dc2626', 
                fontWeight: 700,
                mb: 1
              }}>
                Top Performing Content
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Detailed view of top 10 most engaging content
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mt: 2 }}>
              {getTopContent().map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                      mb: 3,
                      p: 3,
                  borderRadius: 2,
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                  '&:hover': {
                        transform: 'translateX(4px)',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                        borderColor: 'rgba(255,255,255,0.15)',
                  }
                    }}
                  >
                  <Box sx={{ 
                      width: 48, 
                      height: 48, 
                    borderRadius: 2, 
                      background: 'linear-gradient(145deg, #dc2626 0%, #b91c1c 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 3,
                    color: 'white',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                  }}>
                    #{index + 1}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" sx={{ 
                          color: 'white', 
                          fontWeight: 600,
                          fontSize: '1.1rem'
                        }}>
                      {item.title}
                    </Typography>
                        <Chip 
                          label={item.change} 
                          size="small" 
                          sx={{ 
                            height: 20,
                            backgroundColor: 'rgba(16,185,129,0.1)',
                            color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.2)',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={item.genre} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.75rem', 
                            height: 24,
                            backgroundColor: 'rgba(220,38,38,0.1)',
                            color: '#dc2626',
                            border: '1px solid rgba(220,38,38,0.2)',
                            fontWeight: 600
                          }} 
                        />
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          color: '#f59e0b',
                          background: 'rgba(245,158,11,0.1)',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          border: '1px solid rgba(245,158,11,0.2)'
                        }}>
                          <Typography sx={{ fontSize: '1rem' }}>⭐</Typography>
                          <Typography sx={{ 
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#f59e0b'
                          }}>
                            {item.rating}
                      </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {item.duration}
                        </Typography>
                        {item.totalEpisodes && (
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            {item.totalEpisodes} Episodes
                          </Typography>
                        )}
                        {item.releaseYear && (
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Released {item.releaseYear}
                          </Typography>
                        )}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" sx={{ 
                        color: '#dc2626', 
                        fontWeight: 700,
                        mb: 0.5
                      }}>
                      {item.views.toLocaleString()}
                    </Typography>
                      <Typography variant="caption" sx={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Total Views
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            </DialogContent>
            <DialogActions sx={{ 
              p: 3, 
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Button 
                onClick={handleCloseContentModal}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(185,28,28,0.1) 100%)',
                  color: '#dc2626',
                  border: '1px solid rgba(220,38,38,0.3)',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(220,38,38,0.2) 0%, rgba(185,28,28,0.2) 100%)',
                    borderColor: 'rgba(220,38,38,0.4)',
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>

        {/* Admin Profile */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Admin Profile" subtitle="Platform administrator dashboard" height={500}>
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -20,
                left: -20,
                right: -20,
                height: '150%',
                background: 'radial-gradient(circle at top right, rgba(220,38,38,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  position: 'relative', 
                  width: 120, 
                  height: 120, 
                  mx: 'auto',
                  mb: 4
                }}>
              <Avatar 
                sx={{ 
                      width: '100%', 
                      height: '100%', 
                  bgcolor: '#dc2626', 
                  border: '4px solid rgba(220,38,38,0.3)',
                  boxShadow: '0 8px 32px rgba(220,38,38,0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 12px 40px rgba(220,38,38,0.4)',
                      }
                }}
              >
                    <AccountIcon sx={{ fontSize: 60 }} />
              </Avatar>
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '3px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    ✓
                  </Box>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: '1.75rem',
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}
                >
                Admin User
              </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.6)',
                    mb: 4,
                    fontSize: '0.95rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  Senior Platform Administrator
              </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mb: 4,
                  justifyContent: 'center'
                }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(185,28,28,0.1) 100%)',
                      color: '#dc2626',
                      px: 3,
                      py: 1.2,
                      border: '1px solid rgba(220,38,38,0.3)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(220,38,38,0.2) 0%, rgba(185,28,28,0.2) 100%)',
                        borderColor: 'rgba(220,38,38,0.4)',
                      }
                    }}
                  >
                    View Profile
                  </Button>
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                      px: 3,
                      py: 1.2,
                      boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                        boxShadow: '0 6px 20px rgba(220,38,38,0.4)',
                  }
                }}
              >
                    Edit Settings
              </Button>
                </Box>
                <Divider sx={{ 
                  my: 4, 
                  borderColor: 'rgba(255,255,255,0.1)',
                  '&::before, &::after': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  }
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.5)',
                      px: 2,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                  >
                    Overview
                  </Typography>
                </Divider>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
                  gap: 2,
                  px: 2
                }}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    flex: 1,
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: '#dc2626', 
                        fontWeight: 700,
                        fontSize: '2rem',
                        mb: 1,
                        textShadow: '0 2px 10px rgba(220,38,38,0.2)'
                      }}
                    >
                    {stats.totalUsers}
                  </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        lineHeight: 1.4
                      }}
                    >
                      Active Users<br/>Managed
                  </Typography>
                </Box>
                <Box sx={{ mt: 3, textAlign: 'left', px: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                    Account Details
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Email: admin@shortcinema.com</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Phone: +1 555-0123</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Last Login: 2 hours ago</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Location: San Francisco, USA</Typography>
                  </Box>
                </Box>
                  <Box sx={{ 
                    textAlign: 'center', 
                    flex: 1,
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      transform: 'translateY(-2px)',
                    }
                  }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: '#dc2626', 
                        fontWeight: 700,
                        fontSize: '2rem',
                        mb: 1,
                        textShadow: '0 2px 10px rgba(220,38,38,0.2)'
                      }}
                    >
                    {stats.totalContent}
                  </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        lineHeight: 1.4
                      }}
                    >
                      Content Items<br/>Published
                  </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', 
        border: '1px solid rgba(220,38,38,0.2)',
        boxShadow: '0 4px 20px rgba(220,38,38,0.15)'
      }}>
        <Typography variant="h6" sx={{ mb: 4, fontWeight: 600, color: '#dc2626' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={4}>
          {[
            { icon: <MovieIcon />, title: 'Add Content', color: '#dc2626', action: 'Add Content' },
            { icon: <PlayIcon />, title: 'Upload Media', color: '#b91c1b', action: 'Upload Media' },
            { icon: <TrendingIcon />, title: 'View Analytics', color: '#991b1b', action: 'View Analytics' },
            { icon: <PeopleIcon />, title: 'Manage Users', color: '#7f1d1d', action: 'Manage Users' },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Tooltip title={item.title}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    height: '100%',
                    '&:hover': { 
                      transform: 'translateY(-4px)', 
                      transition: 'transform 0.2s',
                      boxShadow: '0 8px 30px rgba(220,38,38,0.25)',
                    }, 
                    background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}05 100%)`, 
                    border: `1px solid ${item.color}30`,
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => alert(`Quick Action: ${item.action} - This feature will be implemented next!`)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `${item.color}20`,
                        color: item.color,
                        mx: 'auto',
                        mb: 3,
                        width: 'fit-content',
                        border: `1px solid ${item.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {React.cloneElement(item.icon, { sx: { fontSize: 32 } })}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 500, color: 'white' }}>
                      {item.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
