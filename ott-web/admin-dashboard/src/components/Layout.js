import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Movie as MovieIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  CloudUpload as UploadIcon,
  Security as SecurityIcon,
  MonetizationOn as MonetizationIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;
const mobileDrawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, action: 'dashboard' },
  { text: 'Content Management', icon: <MovieIcon />, action: 'content' },
  { text: 'User Management', icon: <PeopleIcon />, action: 'users' },
  { text: 'Analytics', icon: <AnalyticsIcon />, action: 'analytics' },
  { text: 'Media Upload', icon: <UploadIcon />, action: 'media' },
  { text: 'DRM & Security', icon: <SecurityIcon />, action: 'drm' },
  { text: 'Monetization', icon: <MonetizationIcon />, action: 'monetization' },
  { text: 'Settings', icon: <SettingsIcon />, action: 'settings' },
  { text: 'Test Connection', icon: <AnalyticsIcon />, action: 'test' },
];

const Layout = ({ children, onNavigate, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    if (onLogout) {
      onLogout();
    }
  };

  const handleNavigation = (action) => {
    setActiveSection(action);
    if (onNavigate) {
      onNavigate(action);
    }
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 2px 10px rgba(220,38,38,0.3)',
        }}
      >
        <MovieIcon sx={{ fontSize: 40, mb: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '0.5px' }}>
          ShortCinema
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
          Admin Portal
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      
      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ pt: 2, pb: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.action)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  minHeight: 48,
                  backgroundColor: activeSection === item.action ? 'rgba(220, 38, 38, 0.2)' : 'transparent',
                  border: activeSection === item.action ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderColor: 'rgba(220, 38, 38, 0.2)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ 
                  color: activeSection === item.action ? '#dc2626' : 'rgba(255,255,255,0.7)', 
                  minWidth: 40,
                  transition: 'color 0.2s ease',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: activeSection === item.action ? 600 : 400,
                    color: activeSection === item.action ? 'white' : 'rgba(255,255,255,0.9)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', display: 'block' }}>
          v1.0.0 • Admin Portal
        </Typography>
      </Box>
    </Box>
  );

  return (
          <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(220, 38, 38, 0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            ShortCinema Admin
          </Typography>
          
          {/* Search Bar */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', mr: 2 }}>
            <Tooltip title="Search">
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Right Side Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Messages */}
            <Tooltip title="Messages">
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <Badge badgeContent={3} color="error">
                  <MessageIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <Badge badgeContent={7} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* User Profile */}
            <Tooltip title="User Profile">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ 
                  color: 'inherit',
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(220,38,38,0.1)',
                  }
                }}
              >
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: '#dc2626',
                  border: '2px solid rgba(220,38,38,0.3)',
                }}>
                  <AccountIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: mobileDrawerWidth,
              background: 'linear-gradient(180deg, #000000 0%, #0f0f0f 100%)',
              borderRight: '1px solid rgba(220, 38, 38, 0.3)',
              boxShadow: '4px 0 20px rgba(0,0,0,0.5)',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(180deg, #000000 0%, #0f0f0f 100%)',
              borderRight: '1px solid rgba(220, 38, 38, 0.3)',
              boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          background: '#0f0f0f',
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: 2,
            mt: 1,
            minWidth: 200,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <AccountIcon fontSize="small" sx={{ color: '#dc2626' }} />
          </ListItemIcon>
          <Typography variant="body2">Profile</Typography>
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#dc2626' }} />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;
