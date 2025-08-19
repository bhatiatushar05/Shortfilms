import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Badge,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  OnlinePrediction as OnlineIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  Star as CrownIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl, getEndpoint } from '../config/api';
import axios from 'axios';

const UserManagement = () => {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user',
    status: 'active',
    subscription: 'premium'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      // Refresh user data every 30 seconds to show real-time online status
      const interval = setInterval(fetchUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      console.log('🔄 Fetching users...');
      setLoading(true);
      setError(null); // Clear previous errors
      
      console.log('📡 Making API call to:', buildApiUrl(getEndpoint('USERS', 'LIST')));
      
      // Fetch real users from backend API
      const response = await axios.get(buildApiUrl(getEndpoint('USERS', 'LIST')));
      
      console.log('✅ API response:', response.data);
      
      if (response.data.success && response.data.data.users) {
        // Transform backend data to match our frontend structure
        const transformedUsers = response.data.data.users.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName || user.email.split('@')[0],
          lastName: user.lastName || '',
          role: user.role || 'user',
          status: user.status || 'active',
          subscription: user.subscription || 'free',
          joinDate: user.joinDate || new Date().toLocaleDateString(),
          lastLogin: user.lastLogin || 'Never',
          watchTime: user.watchTime || 0,
          isOnline: user.isOnline || false,
          lastActivity: user.lastActivity ? new Date(user.lastActivity) : new Date(),
          currentSession: user.currentSession || null
        }));
        
        console.log('🔄 Setting users state:', transformedUsers);
        setUsers(transformedUsers);
        console.log('✅ Users state updated');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      console.error('❌ Error response:', error.response?.data);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'user',
      status: 'active',
      subscription: 'free'
    });
    setAddDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      subscription: user.subscription
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editDialogOpen && selectedUser) {
        // Update existing user
        await axios.patch(buildApiUrl(getEndpoint('USERS', 'ROLE', selectedUser.id)), { 
          role: formData.role 
        });
        await axios.patch(buildApiUrl(getEndpoint('USERS', 'STATUS', selectedUser.id)), { 
          status: formData.status 
        });
        showSnackbar('User updated successfully!', 'success');
      } else {
        // Add new user - this would need to be implemented in your backend
        showSnackbar('User creation not implemented in backend yet', 'warning');
      }
      
      fetchUsers();
      setAddDialogOpen(false);
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar(error.response?.data?.message || 'Error saving user. Please try again.', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    // Find the user to show in confirmation
    const user = users.find(u => u.id === id);
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    console.log('🗑️ Deleting user:', userToDelete);
    console.log('🔑 Current auth header:', axios.defaults.headers.common['Authorization']);
    console.log('🔑 localStorage token:', localStorage.getItem('token')?.substring(0, 50) + '...');
    
    setLoading(true);
    try {
      console.log('📡 Making delete API call to:', buildApiUrl(getEndpoint('USERS', 'DETAIL', userToDelete.id)));
      
      const response = await axios.delete(buildApiUrl(getEndpoint('USERS', 'DETAIL', userToDelete.id)));
      
      console.log('✅ Delete API response:', response.data);
      showSnackbar('User removed from admin management successfully!', 'success');
      
      console.log('🔄 Refreshing user list...');
      await fetchUsers();
      console.log('✅ User list refreshed');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error removing user. Please try again.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      console.log('🔄 Toggling user status:', { id, currentStatus });
      console.log('🔑 Current auth header:', axios.defaults.headers.common['Authorization']);
      console.log('🔑 localStorage token:', localStorage.getItem('token')?.substring(0, 50) + '...');
      
      setLoading(true);
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      console.log('�� Making API call to admin control API...');
      console.log('📤 Request payload:', { userId: id, action: newStatus === 'active' ? 'activate' : 'suspend' });
      
      // Use the new admin control API that affects OTT platform
      const response = await axios.post('http://localhost:5001/api/admin-control/ott-user/control', {
        userId: id,
        action: newStatus === 'active' ? 'activate' : 'suspend',
        reason: newStatus === 'suspended' ? 'Suspended by admin' : 'Activated by admin'
      });
      
      console.log('✅ Admin control API response:', response.data);
      showSnackbar(`User ${newStatus === 'active' ? 'activated' : 'suspended'} in OTT platform`, 'success');
      
      console.log('🔄 Refreshing user list...');
      await fetchUsers(); // Refresh the user list
      console.log('✅ User list refreshed');
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error updating user status. Please try again.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const changeUserSubscription = async (userId, newSubscription) => {
    try {
      console.log('🔄 Changing user subscription:', { userId, newSubscription });
      setLoading(true);
      
      const response = await axios.post('http://localhost:5001/api/admin-control/ott-user/subscription', {
        userId,
        subscription: newSubscription,
        planDetails: {
          plan: newSubscription,
          changedBy: 'admin',
          changedAt: new Date().toISOString()
        }
      });
      
      console.log('✅ Subscription change response:', response.data);
      showSnackbar(`User subscription updated to ${newSubscription}`, 'success');
      
      // Refresh user list to show updated subscription
      await fetchUsers();
    } catch (error) {
      console.error('❌ Error changing subscription:', error);
      const errorMessage = error.response?.data?.message || 'Error changing subscription. Please try again.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineUsers = users.filter(user => user.isOnline);
  const totalUsers = users.length;

  const getTimeAgo = (date) => {
    if (!date || isNaN(date.getTime())) return 'Unknown';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Please log in to view user management.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>
          User Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
            sx={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
              }
            }}
          >
            Add New User
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(0,0,0,0.8) 100%)',
            border: '1px solid rgba(220,38,38,0.3)',
            boxShadow: '0 8px 32px rgba(220,38,38,0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>
                    {totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: '#dc2626' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0.8) 100%)',
            border: '1px solid rgba(16,185,129,0.3)',
            boxShadow: '0 8px 32px rgba(16,185,129,0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                    {onlineUsers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Online Now
                  </Typography>
                </Box>
                <OnlineIcon sx={{ fontSize: 40, color: '#10b981' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(0,0,0,0.8) 100%)',
            border: '1px solid rgba(245,158,11,0.3)',
            boxShadow: '0 8px 32px rgba(245,158,11,0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                    {users.filter(u => u.subscription === 'premium').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Premium Users
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(220,38,38,0.1) 0%, rgba(0,0,0,0.8) 100%)',
            border: '1px solid rgba(220,38,38,0.3)',
            boxShadow: '0 8px 32px rgba(220,38,38,0.2)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>
                    {users.filter(u => u.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#dc2626' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 100%)', 
        border: '1px solid rgba(220,38,38,0.2)',
        boxShadow: '0 8px 32px rgba(220,38,38,0.1)'
      }}>
        <TextField
          fullWidth
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#dc2626' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(220,38,38,0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(220,38,38,0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#dc2626',
              },
            },
          }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No users found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error ? 'Failed to load users. Please try again.' : 'No users have been added yet.'}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Users Table */}
          <Paper sx={{ 
            background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.8) 100%)', 
            border: '1px solid rgba(220,38,38,0.2)',
            boxShadow: '0 8px 32px rgba(220,38,38,0.1)'
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(220,38,38,0.1)' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#dc2626' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#dc2626' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#dc2626' }}>Online</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#dc2626' }}>Current Activity</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#dc2626' }}>Last Activity</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#dc2626' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#dc2626' }}>Subscription</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#dc2626' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover sx={{ 
                      '&:hover': { 
                        background: 'rgba(220,38,38,0.05)' 
                      } 
                    }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              user.isOnline ? (
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    border: '2px solid #000',
                                  }}
                                />
                              ) : null
                            }
                          >
                            <Avatar sx={{ 
                              bgcolor: user.isOnline ? '#10b981' : '#6b7280',
                              border: user.isOnline ? '2px solid #10b981' : 'none'
                            }}>
                              <PersonIcon />
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          color={user.status === 'active' ? 'success' : 'error'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.isOnline ? <OnlineIcon /> : <TimeIcon />}
                          label={user.isOnline ? 'Online' : 'Offline'}
                          size="small"
                          color={user.isOnline ? 'success' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {user.currentSession ? (
                          <Tooltip title={user.currentSession}>
                            <Typography variant="body2" sx={{ 
                              color: '#10b981', 
                              fontWeight: 500,
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {user.currentSession}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No activity
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {getTimeAgo(user.lastActivity)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === 'admin' ? 'error' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.subscription}
                          size="small"
                          color={user.subscription === 'premium' ? 'warning' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            sx={{ color: '#dc2626' }}
                            title="Edit User"
                            disabled={loading}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{ color: '#dc2626' }}
                            title="Remove User"
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => toggleUserStatus(user.id, user.status)}
                            sx={{ color: '#dc2626' }}
                            title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                            disabled={loading}
                          >
                            {loading ? (
                              <CircularProgress size={16} sx={{ color: '#dc2626' }} />
                            ) : (
                              user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newSub = user.subscription === 'premium' ? 'free' : 'premium';
                              changeUserSubscription(user.id, newSub);
                            }}
                            sx={{ color: '#dc2626' }}
                            title={`Change subscription to ${user.subscription === 'premium' ? 'free' : 'premium'}`}
                            disabled={loading}
                          >
                            <CrownIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={addDialogOpen || editDialogOpen} 
        onClose={() => {
          setAddDialogOpen(false);
          setEditDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.95) 100%)',
            border: '1px solid rgba(220,38,38,0.2)',
            boxShadow: '0 8px 32px rgba(220,38,38,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#dc2626', fontWeight: 600 }}>
          {editDialogOpen ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(220,38,38,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(220,38,38,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc2626',
                  },
                },
              }}
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(220,38,38,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(220,38,38,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc2626',
                  },
                },
              }}
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              type="email"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(220,38,38,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(220,38,38,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc2626',
                  },
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Role"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(220,38,38,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(220,38,38,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#dc2626',
                  },
                }}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(220,38,38,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(220,38,38,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#dc2626',
                  },
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="banned">Banned</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Subscription</InputLabel>
              <Select
                value={formData.subscription}
                onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
                label="Subscription"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(220,38,38,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(220,38,38,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#dc2626',
                  },
                }}
              >
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="pro">Pro</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddDialogOpen(false);
            setEditDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
              }
            }}
          >
            {editDialogOpen ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(0,0,0,0.95) 100%)',
            border: '1px solid rgba(220,38,38,0.2)',
            boxShadow: '0 8px 32px rgba(220,38,38,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#dc2626', fontWeight: 600 }}>
          Confirm User Removal
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to remove <strong>{userToDelete?.email}</strong> from admin management?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will remove the user from admin management but keep their OTT platform account intact.
            They can still access the platform but won't appear in the admin dashboard.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteUser}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
              }
            }}
          >
            {loading ? 'Removing...' : 'Remove User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
