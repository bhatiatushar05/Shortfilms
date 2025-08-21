import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  PlayCircle as PlayIcon,
  Visibility as ViewsIcon,
  WatchLater as TimeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const Analytics = () => {
  const { isAuthenticated, tokenVerified } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    content: [],
    engagement: [],
    genres: [],
    timeline: []
  });
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  // Only fetch analytics when both authenticated AND token is verified
  useEffect(() => {
    if (isAuthenticated && tokenVerified) {
      console.log('✅ Analytics: Authentication and token verified, fetching analytics...');
      fetchAnalytics();
    } else if (isAuthenticated && !tokenVerified) {
      console.log('⏳ Analytics: Authenticated but token not yet verified, waiting...');
    } else {
      console.log('❌ Analytics: Not authenticated, cannot fetch analytics');
    }
  }, [isAuthenticated, tokenVerified, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${buildApiUrl(getEndpoint('ANALYTICS', 'OVERVIEW'))}?range=${timeRange}`);
      setAnalyticsData(response.data.data.overview);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to mock data
      setAnalyticsData({
        users: {
          total: 1247,
          active: 342,
          new: 89,
          growth: 12.5
        },
        content: {
          total: 89,
          movies: 45,
          series: 35,
          shorts: 20,
          views: 45620
        },
        engagement: {
          avgWatchTime: 45,
          completionRate: 78,
          bounceRate: 22,
          retention: 85
        },
        revenue: {
          total: 15420,
          subscriptions: 12340,
          ads: 3080,
          growth: 8.3
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Mon', users: 400, views: 2400, revenue: 2400 },
    { name: 'Tue', users: 300, views: 1398, revenue: 2210 },
    { name: 'Wed', users: 200, views: 9800, revenue: 2290 },
    { name: 'Thu', users: 278, views: 3908, revenue: 2000 },
    { name: 'Fri', users: 189, views: 4800, revenue: 2181 },
    { name: 'Sat', users: 239, views: 3800, revenue: 2500 },
    { name: 'Sun', users: 349, views: 4300, revenue: 2100 },
  ];

  const pieData = [
    { name: 'Movies', value: 45, color: '#8884d8' },
    { name: 'Series', value: 35, color: '#82ca9d' },
    { name: 'Shorts', value: 20, color: '#ffc658' },
  ];

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
          {trend && (
            <Chip
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              size="small"
              color={trend > 0 ? 'success' : 'error'}
            />
          )}
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
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
        <Typography>Please log in to view analytics.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Analytics Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={analyticsData?.users?.total || 0}
            icon={<PeopleIcon />}
            color="#1976d2"
            subtitle="Registered users"
            trend={analyticsData?.users?.growth}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={analyticsData?.users?.active || 0}
            icon={<PlayIcon />}
            color="#2e7d32"
            subtitle="Currently online"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Views"
            value={analyticsData?.content?.views || 0}
            icon={<ViewsIcon />}
            color="#ed6c02"
            subtitle="Content views"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={`$${analyticsData?.revenue?.total || 0}`}
            icon={<StarIcon />}
            color="#9c27b0"
            subtitle="Total revenue"
            trend={analyticsData?.revenue?.growth}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              User Growth & Engagement
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
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
                <Area type="monotone" dataKey="users" stackId="1" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
                <Area type="monotone" dataKey="views" stackId="2" stroke="#2e7d32" fill="#2e7d32" fillOpacity={0.6} />
                <Area type="monotone" dataKey="revenue" stackId="3" stroke="#ed6c02" fill="#ed6c02" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Content Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
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

        {/* Engagement Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Engagement Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StatCard
                  title="Avg Watch Time"
                  value={`${analyticsData?.engagement?.avgWatchTime || 0}m`}
                  icon={<TimeIcon />}
                  color="#1976d2"
                  subtitle="Per session"
                />
              </Grid>
              <Grid item xs={6}>
                <StatCard
                  title="Completion Rate"
                  value={`${analyticsData?.engagement?.completionRate || 0}%`}
                  icon={<PlayIcon />}
                  color="#2e7d32"
                  subtitle="Content completion"
                />
              </Grid>
              <Grid item xs={6}>
                <StatCard
                  title="Bounce Rate"
                  value={`${analyticsData?.engagement?.bounceRate || 0}%`}
                  icon={<TrendingIcon />}
                  color="#ed6c02"
                  subtitle="Session bounce"
                />
              </Grid>
              <Grid item xs={6}>
                <StatCard
                  title="Retention"
                  value={`${analyticsData?.engagement?.retention || 0}%`}
                  icon={<StarIcon />}
                  color="#9c27b0"
                  subtitle="User retention"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Revenue Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Revenue Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Subscriptions', value: analyticsData?.revenue?.subscriptions || 0 },
                { name: 'Ads', value: analyticsData?.revenue?.ads || 0 }
              ]}>
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
                <Bar dataKey="value" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
