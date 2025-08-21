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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const ContentManagement = () => {
  const { isAuthenticated, tokenVerified } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'movie',
    genre: '',
    duration: '',
    releaseYear: '',
    rating: 'PG',
    status: 'active',
    is_featured: false
  });

  // Only fetch content when both authenticated AND token is verified
  useEffect(() => {
    if (isAuthenticated && tokenVerified) {
      console.log('✅ ContentManagement: Authentication and token verified, fetching content...');
      fetchContent();
    } else if (isAuthenticated && !tokenVerified) {
      console.log('⏳ ContentManagement: Authenticated but token not yet verified, waiting...');
    } else {
      console.log('❌ ContentManagement: Not authenticated, cannot fetch content');
    }
  }, [isAuthenticated, tokenVerified]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl(getEndpoint('CONTENT', 'TITLES')));
      console.log('📡 Content API response:', response.data);
      const titles = response.data.data.titles || [];
      console.log('📋 Titles data:', titles);
      if (titles.length > 0) {
        console.log('🔍 First title structure:', titles[0]);
        console.log('🆔 First title ID:', titles[0].id);
        console.log('🔍 All available fields:', Object.keys(titles[0]));
        console.log('🔍 First title values:', Object.values(titles[0]));
      }
      
      // Map backend data to frontend format if needed
      const mappedTitles = titles.map((title, index) => {
        console.log(`📝 Mapping title ${index + 1}:`, title);
        console.log(`🆔 Title ${index + 1} ID:`, title.id);
        console.log(`🔍 Title ${index + 1} ID type:`, typeof title.id);
        
        // Validate and map rating to allowed values
        let validRating = 'PG'; // default
        if (title.rating) {
          const rating = title.rating.toString().toUpperCase();
          if (['G', 'PG', 'PG-13', 'R', 'TV-MA'].includes(rating)) {
            validRating = rating;
          } else if (rating.includes('UA')) {
            validRating = 'PG-13'; // Map UA ratings to PG-13
          } else if (rating.includes('A')) {
            validRating = 'R'; // Map A ratings to R
          }
        }
        
        // Validate and map status to allowed values
        let validStatus = 'active'; // default
        if (title.status) {
          const status = title.status.toString().toLowerCase();
          if (['active', 'inactive', 'draft'].includes(status)) {
            validStatus = status;
          }
        }
        
        // Validate and map type to allowed values
        let validType = 'movie'; // default
        if (title.kind || title.type) {
          const type = (title.kind || title.type).toString().toLowerCase();
          if (['movie', 'series', 'short'].includes(type)) {
            validType = type;
          }
        }
        
        const mappedTitle = {
          id: title.id,
          title: title.title,
          description: title.synopsis || title.description || '',
          type: validType,
          genre: Array.isArray(title.genres) ? title.genres[0] : title.genre || '',
          duration: title.runtime_sec ? `${Math.floor(title.runtime_sec / 60)}m` : title.duration || '',
          releaseYear: title.year || title.releaseYear || '',
          rating: validRating,
          status: validStatus,
          is_featured: title.is_featured || false
        };
        
        console.log(`✅ Mapped title ${index + 1}:`, mappedTitle);
        console.log(`✅ Mapped title ${index + 1} ID:`, mappedTitle.id);
        console.log(`✅ Mapped title ${index + 1} ID type:`, typeof mappedTitle.id);
        
        return mappedTitle;
      });
      
      console.log('🔄 Final mapped titles:', mappedTitles);
      console.log('🔄 Final mapped titles IDs:', mappedTitles.map(t => ({ id: t.id, type: typeof t.id })));
      setContent(mappedTitles);
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
      // Fallback to mock data
      setContent([
        {
          id: 1,
          title: 'The Great Adventure',
          type: 'movie',
          genre: 'Action',
          duration: '2h 15m',
          releaseYear: 2024,
          rating: 'PG-13',
          status: 'active',
          views: 15420
        },
        {
          id: 2,
          title: 'Mystery Island',
          type: 'series',
          genre: 'Thriller',
          duration: '45m',
          releaseYear: 2024,
          rating: 'TV-MA',
          status: 'active',
          views: 8920
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = () => {
    setFormData({
      title: '',
      description: '',
      type: 'movie',
      genre: '',
      duration: '',
      releaseYear: '',
      rating: 'PG',
      status: 'active',
      is_featured: false
    });
    setAddDialogOpen(true);
  };

  const handleEditContent = (item) => {
    console.log('✏️ Editing content item:', item);
    console.log('🆔 Item ID:', item.id);
    console.log('🎬 Item type:', item.type);
    console.log('📊 Item rating:', item.rating);
    console.log('📈 Item status:', item.status);
    console.log('🔍 Item object keys:', Object.keys(item));
    console.log('🔍 Item object values:', Object.values(item));
    
    // Ensure we have a stable copy of the item with all properties
    const stableItem = { ...item };
    console.log('🔒 Stable item copy:', stableItem);
    console.log('🔒 Stable item ID:', stableItem.id);
    
    setSelectedContent(stableItem);
    setFormData({
      title: stableItem.title,
      description: stableItem.description || '',
      type: stableItem.type,
      genre: stableItem.genre,
      duration: stableItem.duration,
      releaseYear: stableItem.releaseYear,
      rating: stableItem.rating,
      status: stableItem.status,
      is_featured: stableItem.is_featured || false
    });
    setEditDialogOpen(true);
  };

  const handleSaveContent = async () => {
    try {
      console.log('💾 Saving content...');
      console.log('📝 Edit dialog open:', editDialogOpen);
      console.log('🎯 Selected content:', selectedContent);
      console.log('🆔 Selected content ID:', selectedContent?.id);
      console.log('🔍 Selected content type:', typeof selectedContent?.id);
      console.log('📋 Form data:', formData);
      
      // Validate form data before sending
      if (!formData.title || formData.title.trim() === '') {
        alert('Title is required');
        return;
      }
      
      if (!formData.type || formData.type.trim() === '') {
        alert('Type is required');
        return;
      }
      
      if (!formData.genre || formData.genre.trim() === '') {
        alert('Genre is required');
        return;
      }
      
      if (editDialogOpen && selectedContent && selectedContent.id) {
        // Update existing content
        const contentId = selectedContent.id;
        console.log('✅ Valid content ID found:', contentId);
        console.log('✅ Content ID type:', typeof contentId);
        
        // Ensure contentId is a string and not an object
        if (typeof contentId === 'object') {
          console.error('❌ Error: Content ID is an object, cannot use for URL');
          alert('Error: Invalid content ID. Please re-select the item.');
          return;
        }
        
        const url = buildApiUrl(getEndpoint('CONTENT', 'TITLE', { id: contentId }));
        console.log('🔗 PUT URL:', url);
        console.log('🔗 URL construction debug:');
        console.log('  - contentId:', contentId);
        console.log('  - contentId type:', typeof contentId);
        console.log('  - getEndpoint result:', getEndpoint('CONTENT', 'TITLE', { id: contentId }));
        console.log('  - buildApiUrl result:', url);
        console.log('📤 Sending data:', formData);
        
        // Transform form data to match database schema
        const updateData = {
          title: formData.title || '',
          synopsis: formData.description || '',
          kind: formData.type || 'movie',
          genre: formData.genre || '',
          year: formData.releaseYear ? parseInt(formData.releaseYear) : null,
          rating: formData.rating || 'PG-13',
          status: formData.status || 'active',
          is_featured: Boolean(formData.is_featured)
        };
        
        // Log the transformation process
        console.log('🔄 Data transformation process:');
        console.log('  - Original title:', formData.title);
        console.log('  - Transformed title:', updateData.title);
        console.log('  - Original description:', formData.description);
        console.log('  - Transformed synopsis:', updateData.synopsis);
        console.log('  - Original type:', formData.type);
        console.log('  - Transformed kind:', updateData.kind);
        console.log('  - Original genre:', formData.genre);
        console.log('  - Transformed genre:', updateData.genre);
        console.log('  - Original releaseYear:', formData.releaseYear);
        console.log('  - Transformed year:', updateData.year);
        console.log('  - Original rating:', formData.rating);
        console.log('  - Transformed rating:', updateData.rating);
        console.log('  - Original status:', formData.status);
        console.log('  - Transformed status:', updateData.status);
        console.log('  - Original is_featured:', formData.is_featured);
        console.log('  - Transformed is_featured:', updateData.is_featured);
        
        // Convert duration from "150m" format to runtime_sec if possible
        if (formData.duration) {
          const durationMatch = formData.duration.match(/(\d+)m/);
          if (durationMatch) {
            updateData.runtime_sec = parseInt(durationMatch[1]) * 60;
          }
        }
        
        // Remove any undefined or null values that might cause database errors
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined || updateData[key] === null) {
            delete updateData[key];
          }
        });
        
        console.log('🔄 Transformed update data:', updateData);
        
        // Add request timeout and retry logic
        console.log('🔐 Sending request with headers:', {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')?.substring(0, 20)}...`
        });
        
        const response = await axios.put(url, updateData, {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json'
          },
          validateStatus: function (status) {
            return status < 500; // Resolve only if status is less than 500
          }
        });
        console.log('✅ Update response:', response.data);
      } else if (editDialogOpen && (!selectedContent || !selectedContent.id)) {
        console.error('❌ Error: Cannot save content. Content ID is missing for update operation.');
        console.error('❌ Selected content:', selectedContent);
        console.error('❌ Selected content ID:', selectedContent?.id);
        alert('Error: Content ID is missing for update. Please re-select the item.');
        return;
      } else {
        // Add new content
        console.log('➕ Adding new content...');
        const response = await axios.post(buildApiUrl(getEndpoint('CONTENT', 'TITLES')), formData);
        console.log('✅ Create response:', response.data);
      }
      
      fetchContent();
      setAddDialogOpen(false);
      setEditDialogOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('❌ Error saving content:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
      let errorMessage = 'An error occurred while saving content.';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please check the console for details and try again.';
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.error === 'Duplicate Error') {
          errorMessage = 'A title with this name already exists. Please use a different title.';
        } else if (errorData?.error === 'Reference Error') {
          errorMessage = 'Referenced data not found. Please check your selection.';
        } else if (errorData?.error === 'Validation Error') {
          errorMessage = `Validation error: ${errorData?.message || 'Invalid data provided'}`;
        } else if (errorData?.error === 'Schema Error') {
          errorMessage = 'Database schema error. Please contact support.';
        } else {
          errorMessage = `Validation error: ${errorData?.message || 'Invalid data provided'}`;
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'Content not found. Please refresh and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Log additional error details for debugging
      console.error('❌ Full error object:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error code:', error.code);
      
      alert(errorMessage);
    }
  };

  const handleDeleteContent = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        console.log('🗑️ Deleting content...');
        console.log('🆔 Content ID:', id);
        console.log('🔍 Content ID type:', typeof id);
        
        if (!id) {
          console.error('❌ Error: Content ID is missing for delete operation');
          alert('Error: Content ID is missing. Please try again.');
          return;
        }
        
        const url = buildApiUrl(getEndpoint('CONTENT', 'TITLE', { id }));
        console.log('🔗 DELETE URL:', url);
        
        const response = await axios.delete(url);
        console.log('✅ Delete response:', response.data);
        
        // Refresh content to show updated list
        fetchContent();
      } catch (error) {
        console.error('❌ Error deleting content:', error);
        console.error('❌ Error response:', error.response);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        alert(`Error deleting content: ${error.response?.data?.message || error.message}. Please try again.`);
      }
    }
  };

  const toggleContentStatus = async (id, currentStatus) => {
    try {
      console.log('🔄 Toggling content status...');
      console.log('🆔 Content ID:', id);
      console.log('🔍 Content ID type:', typeof id);
      console.log('📊 Current status:', currentStatus);
      console.log('🔄 New status:', currentStatus === 'active' ? 'inactive' : 'active');
      
      if (!id) {
        console.error('❌ Error: Content ID is missing for status toggle');
        alert('Error: Content ID is missing. Please try again.');
        return;
      }
      
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const url = buildApiUrl(getEndpoint('CONTENT', 'TITLE', { id }));
      console.log('🔗 PATCH URL:', url);
      console.log('📤 Sending data:', { status: newStatus });
      
      const response = await axios.patch(url, { status: newStatus });
      console.log('✅ Status update response:', response.data);
      
      // Refresh content to show updated status
      fetchContent();
    } catch (error) {
      console.error('❌ Error updating content status:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      alert(`Error updating content status: ${error.response?.data?.message || error.message}. Please try again.`);
    }
  };

  const toggleFeaturedStatus = async (id, currentFeatured) => {
    try {
      console.log('⭐ Toggling featured status...');
      console.log('🆔 Content ID:', id);
      console.log('🔍 Content ID type:', typeof id);
      console.log('📊 Current featured status:', currentFeatured);
      console.log('🔄 New featured status:', !currentFeatured);
      
      if (!id) {
        console.error('❌ Error: Content ID is missing for featured status toggle');
        alert('Error: Content ID is missing. Please try again.');
        return;
      }
      
      // Ensure id is a string and not an object
      if (typeof id === 'object') {
        console.error('❌ Error: Content ID is an object, cannot use for URL');
        alert('Error: Invalid content ID. Please try again.');
        return;
      }
      
      const newFeatured = !currentFeatured;
      const url = buildApiUrl(getEndpoint('CONTENT', 'TITLE', { id }));
      console.log('🔗 PATCH URL:', url);
      console.log('📤 Sending data:', { is_featured: newFeatured });
      
      // Use PATCH for featured status updates
      const response = await axios.patch(url, { is_featured: newFeatured });
      console.log('✅ Featured status update response:', response.data);
      
      // Refresh content to show updated status
      fetchContent();
    } catch (error) {
      console.error('❌ Error updating featured status:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      alert(`Error updating featured status: ${error.response?.data?.message || error.message}. Please try again.`);
    }
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add a test function to verify authentication and data fetching
  const testAuthentication = async () => {
    try {
      console.log('🧪 Testing authentication and data fetching...');
      
      // Test 1: Check if we can fetch content
      const response = await axios.get(buildApiUrl(getEndpoint('CONTENT', 'TITLES')));
      console.log('✅ Content fetch successful:', response.data.success);
      console.log('✅ Content count:', response.data.data.titles?.length || 0);
      
      // Test 2: Check if we can access a specific title
      if (response.data.data.titles && response.data.data.titles.length > 0) {
        const firstTitle = response.data.data.titles[0];
        console.log('✅ First title ID:', firstTitle.id);
        console.log('✅ First title featured status:', firstTitle.is_featured);
        
        // Test 3: Try to toggle featured status
        const testId = firstTitle.id;
        const currentFeatured = firstTitle.is_featured;
        console.log('🧪 Testing featured toggle for ID:', testId, 'Current:', currentFeatured);
        
        const toggleResponse = await axios.patch(buildApiUrl(getEndpoint('CONTENT', 'TITLE', { id: testId })), { 
          is_featured: !currentFeatured 
        });
        console.log('✅ Featured toggle successful:', toggleResponse.data);
        
        // Test 4: Toggle back to original state
        const restoreResponse = await axios.patch(buildApiUrl(getEndpoint('CONTENT', 'TITLE', { id: testId })), { 
          is_featured: currentFeatured 
        });
        console.log('✅ Featured restore successful:', restoreResponse.data);
        
        console.log('🎉 All authentication tests passed!');
      }
    } catch (error) {
      console.error('❌ Authentication test failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
    }
  };

  // Add test button to the UI
  const renderTestButton = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <Button
          variant="outlined"
          onClick={testAuthentication}
          sx={{ ml: 2, borderColor: 'orange', color: 'orange' }}
        >
          🧪 Test Auth
        </Button>
      );
    }
    return null;
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Please log in to view content management.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Content Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {renderTestButton()}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddContent}
            sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}
          >
            Add New Content
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <TextField
          fullWidth
          placeholder="Search content by title or genre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Paper>

      {/* Content Table */}
      <Paper sx={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'rgba(25, 118, 210, 0.1)' }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Genre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Year</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Featured</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Views</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.type}
                      size="small"
                      color={item.type === 'movie' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>{item.genre}</TableCell>
                  <TableCell>{item.duration}</TableCell>
                  <TableCell>{item.releaseYear}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.rating}
                      size="small"
                      color={item.rating === 'PG' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      size="small"
                      color={item.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.is_featured ? 'Featured' : 'Not Featured'}
                      size="small"
                      color={item.is_featured ? 'primary' : 'default'}
                      onClick={() => toggleFeaturedStatus(item.id, item.is_featured)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>{item.views?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleContentStatus(item.id, item.status)}
                        color={item.status === 'active' ? 'warning' : 'success'}
                      >
                        {item.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditContent(item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteContent(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Content Dialog */}
      <Dialog 
        open={addDialogOpen || editDialogOpen} 
        onClose={() => {
          setAddDialogOpen(false);
          setEditDialogOpen(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editDialogOpen ? 'Edit Content' : 'Add New Content'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="movie">Movie</MenuItem>
                <MenuItem value="series">Series</MenuItem>
                <MenuItem value="short">Short</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              fullWidth
            />
            <TextField
              label="Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              fullWidth
              placeholder="e.g., 2h 15m"
            />
            <TextField
              label="Release Year"
              value={formData.releaseYear}
              onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
              fullWidth
              type="number"
            />
            <FormControl fullWidth>
              <InputLabel>Rating</InputLabel>
              <Select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                label="Rating"
              >
                <MenuItem value="G">G</MenuItem>
                <MenuItem value="PG">PG</MenuItem>
                <MenuItem value="PG-13">PG-13</MenuItem>
                <MenuItem value="R">R</MenuItem>
                <MenuItem value="TV-MA">TV-MA</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Featured</InputLabel>
              <Select
                value={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.value })}
                label="Featured"
              >
                <MenuItem value={true}>Yes - Show in Hero</MenuItem>
                <MenuItem value={false}>No - Regular Content</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddDialogOpen(false);
            setEditDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button onClick={handleSaveContent} variant="contained">
            {editDialogOpen ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentManagement;
