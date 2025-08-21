import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl, getEndpoint } from '../config/api';
import axios from 'axios';

const MediaUpload = () => {
  const { isAuthenticated, tokenVerified } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('video');
  const [uploadStatus, setUploadStatus] = useState('');
  const [contentForm, setContentForm] = useState({
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

  // Add refs for file inputs
  const posterInputRef = useRef();
  const heroInputRef = useRef();
  const videoInputRef = useRef();

  // Only fetch content when both authenticated AND token is verified
  useEffect(() => {
    if (isAuthenticated && tokenVerified) {
      console.log('✅ MediaUpload: Authentication and token verified, fetching content...');
      fetchUploadedContent();
    } else if (isAuthenticated && !tokenVerified) {
      console.log('⏳ MediaUpload: Authenticated but token not yet verified, waiting...');
    } else {
      console.log('❌ MediaUpload: Not authenticated, cannot fetch content');
    }
  }, [isAuthenticated, tokenVerified]);

  const fetchUploadedContent = async () => {
    try {
      console.log('📡 MediaUpload: Fetching uploaded content...');
      const response = await axios.get(buildApiUrl(getEndpoint('CONTENT', 'TITLES')));
      if (response.data.success) {
        console.log('✅ MediaUpload: Content fetched successfully');
        setContent(response.data.data.titles || []);
      }
    } catch (error) {
      console.error('❌ MediaUpload: Error fetching content:', error);
      console.error('❌ MediaUpload: Error response:', error.response?.data);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('📁 File selected:', file.name, 'Size:', file.size);
    }
  };

  const validateForm = () => {
    if (!contentForm.title.trim()) {
      alert('Please enter a title');
      return false;
    }
    if (!selectedFile) {
      alert('Please select a file');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');

    try {
      // Create FormData for content upload
      const formData = new FormData();
      
      // Add content metadata
      formData.append('title', contentForm.title);
      formData.append('description', contentForm.description);
      formData.append('type', contentForm.type);
      formData.append('genre', contentForm.genre);
      formData.append('rating', contentForm.rating);
      formData.append('releaseYear', contentForm.releaseYear);
      formData.append('duration', contentForm.duration);
      formData.append('is_featured', contentForm.is_featured);

      // Add media file
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      setUploadStatus('Uploading files...');

      // Upload to backend
      const response = await axios.post(buildApiUrl(getEndpoint('MEDIA', 'UPLOAD_CONTENT')), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          setUploadStatus(`Uploading... ${percentCompleted}%`);
        },
      });

      if (response.data.success) {
        setUploadStatus('Processing content...');
        
        // Add uploaded content to the list
        const newContent = response.data.data.title;
        setContent(prev => [newContent, ...prev]);
        
        // Refresh the content list to get the latest data
        fetchUploadedContent();

        // Reset form
        setSelectedFile(null);
        setContentForm({
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
        
        setUploadStatus('Upload completed successfully!');
        setTimeout(() => {
          setUploadStatus('');
        }, 3000);
        
        alert('Content uploaded successfully! It will now appear in your content library.');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Upload failed: ${error.response?.data?.message || error.message}`);
      setTimeout(() => {
        setUploadStatus('');
      }, 5000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteContent = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await axios.delete(buildApiUrl(getEndpoint('CONTENT', 'TITLE', { id })));
        setContent(prev => prev.filter(content => content.id !== id));
        alert('Content deleted successfully!');
      } catch (error) {
        console.error('Error deleting content:', error);
        alert(`Error deleting content: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handlePreview = (file) => {
    // Simple file preview - you can enhance this later
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    } else {
      alert(`Preview not available for ${file.type} files`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'poster':
      case 'hero':
        return <ImageIcon />;
      case 'video':
        return <VideoIcon />;
      default:
        return <UploadIcon />;
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Please log in to view media upload.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Content Upload
        </Typography>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={uploading || !contentForm.title.trim() || !selectedFile}
          sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}
        >
          {uploading ? 'Uploading...' : 'Upload Content'}
        </Button>
      </Box>

      {uploadStatus && (
        <Alert 
          severity={uploadStatus.includes('failed') ? 'error' : uploadStatus.includes('completed') ? 'success' : 'info'}
          sx={{ mb: 3 }}
        >
          {uploadStatus}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Content Configuration */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Content Details
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={contentForm.type}
                label="Content Type"
                onChange={(e) => setContentForm(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="movie">Movie</MenuItem>
                <MenuItem value="series">Series</MenuItem>
                <MenuItem value="short">Short</MenuItem>
                <MenuItem value="trailer">Trailer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Title *"
              value={contentForm.title}
              onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              sx={{ mb: 2 }}
              required
            />

            <TextField
              label="Description"
              value={contentForm.description}
              onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Genre"
                  value={contentForm.genre}
                  onChange={(e) => setContentForm(prev => ({ ...prev, genre: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Rating</InputLabel>
                  <Select
                    value={contentForm.rating}
                    label="Rating"
                    onChange={(e) => setContentForm(prev => ({ ...prev, rating: e.target.value }))}
                  >
                    <MenuItem value="G">G</MenuItem>
                    <MenuItem value="PG">PG</MenuItem>
                    <MenuItem value="PG-13">PG-13</MenuItem>
                    <MenuItem value="R">R</MenuItem>
                    <MenuItem value="TV-MA">TV-MA</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <TextField
                  label="Release Year"
                  value={contentForm.releaseYear}
                  onChange={(e) => setContentForm(prev => ({ ...prev, releaseYear: e.target.value }))}
                  fullWidth
                  type="number"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Duration"
                  value={contentForm.duration}
                  onChange={(e) => setContentForm(prev => ({ ...prev, duration: e.target.value }))}
                  fullWidth
                  placeholder="e.g., 2h 15m"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Media Upload */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Media Files
            </Typography>
            
            <Grid container spacing={3}>
              {/* Poster Upload */}
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  border: selectedFile && selectedFile.type.startsWith('image/') ? '2px solid #4caf50' : '2px dashed rgba(255,255,255,0.3)',
                  background: selectedFile && selectedFile.type.startsWith('image/') ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#4caf50' }
                }} onClick={() => posterInputRef.current?.click()}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    {selectedFile && selectedFile.type.startsWith('image/') ? (
                      <>
                        <CheckIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(selectedFile.size)}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Click to select poster
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recommended: 300x450px
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e)}
                  style={{ display: 'none' }}
                />
              </Grid>

              {/* Hero Upload */}
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  border: selectedFile && selectedFile.type.startsWith('image/') ? '2px solid #2196f3' : '2px dashed rgba(255,255,255,0.3)',
                  background: selectedFile && selectedFile.type.startsWith('image/') ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#2196f3' }
                }} onClick={() => heroInputRef.current?.click()}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    {selectedFile && selectedFile.type.startsWith('image/') ? (
                      <>
                        <CheckIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(selectedFile.size)}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Click to select hero
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recommended: 1920x1080px
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e)}
                  style={{ display: 'none' }}
                />
              </Grid>

              {/* Video Upload */}
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  border: selectedFile && selectedFile.type.startsWith('video/') ? '2px solid #ff9800' : '2px dashed rgba(255,255,255,0.3)',
                  background: selectedFile && selectedFile.type.startsWith('video/') ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#ff9800' }
                }} onClick={() => videoInputRef.current?.click()}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    {selectedFile && selectedFile.type.startsWith('video/') ? (
                      <>
                        <CheckIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(selectedFile.size)}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <VideoIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Click to select video
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          MP4, AVI, MOV, etc.
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileSelect(e)}
                  style={{ display: 'none' }}
                />
              </Grid>
            </Grid>

            {uploading && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  {uploadProgress}% Complete
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Uploaded Content */}
      {content.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Uploaded Content ({content.length})
          </Typography>
          
          <Grid container spacing={2}>
            {content.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        label={item.type}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={item.status}
                        size="small"
                        color={item.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {item.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description || 'No description'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {item.genre?.split(',').map((genre, index) => (
                        <Chip key={index} label={genre.trim()} size="small" />
                      ))}
                      <Chip label={item.rating} size="small" color="warning" />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      {item.releaseYear} • {item.duration ? Math.floor(item.duration / 60) + 'm' : 'N/A'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => handlePreview(item)}
                        color="primary"
                      >
                        <PlayIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteContent(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={false} // Preview functionality removed
        onClose={() => {}}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Preview: {selectedFile?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {selectedFile && selectedFile.type.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt={selectedFile.name}
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
              />
            ) : (
              <>
                <PlayIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="body1">
                  Preview not available
                </Typography>
              </>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {selectedFile?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {/* No synopsis available in current state */}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {}}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaUpload;
