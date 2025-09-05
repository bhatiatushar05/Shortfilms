import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Movie as MovieIcon,
  Image as ImageIcon,
  VideoFile as VideoFileIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl, getEndpoint } from '../config/api';
import axios from 'axios';

const MediaUpload = () => {
  const { isAuthenticated, tokenVerified } = useAuth();
  const [uploadedContent, setUploadedContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [storageStats, setStorageStats] = useState(null);
  const [awsConnectionStatus, setAwsConnectionStatus] = useState('checking');

  const posterFileRef = useRef();
  const heroFileRef = useRef();
  const videoFileRef = useRef();

  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    genre: '',
    releaseYear: '',
    duration: '',
    rating: 'PG',
    language: 'English',
    quality: 'HD',
    is_featured: false,
    tags: '',
  });

  const [posterFile, setPosterFile] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const checkAWSConnection = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl(getEndpoint('AWS_MEDIA', 'TEST_CONNECTION')));
      if (response.data.success) {
        setAwsConnectionStatus('connected');
      } else {
        setAwsConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ AWS connection check failed:', error);
      setAwsConnectionStatus('error');
    }
  }, []);

  const fetchStorageStats = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl(getEndpoint('AWS_MEDIA', 'STORAGE_STATS')));
      if (response.data.success) {
        setStorageStats(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching storage stats:', error);
    }
  }, []);

  const fetchUploadedContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildApiUrl(getEndpoint('CONTENT', 'TITLES')) + '?all=true');
      if (response.data.success) {
        const titles = response.data.data.titles || [];
        setUploadedContent(titles);
      }
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      setUploadedContent([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && tokenVerified) {
      fetchUploadedContent();
      fetchStorageStats();
      checkAWSConnection();
    }
  }, [isAuthenticated, tokenVerified, fetchUploadedContent, fetchStorageStats, checkAWSConnection]);

  const handleFileSelect = (fileType, file) => {
    if (!file) return;
    const maxSize = fileType === 'video' ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setSnackbar({
        open: true,
        message: `${fileType} file size must be less than ${fileType === 'video' ? '500MB' : '10MB'}`,
        severity: 'error'
      });
      return;
    }
    switch (fileType) {
      case 'poster': setPosterFile(file); break;
      case 'hero': setHeroFile(file); break;
      case 'video': setVideoFile(file); break;
      default: break;
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !contentForm.title || !contentForm.genre || !contentForm.releaseYear) {
      setSnackbar({
        open: true,
        message: 'Video file, title, genre, and release year are required',
        severity: 'error'
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const videoFormData = new FormData();
      videoFormData.append('movie', videoFile);
      videoFormData.append('title', contentForm.title);
      videoFormData.append('genre', contentForm.genre);
      videoFormData.append('releaseYear', contentForm.releaseYear);
      videoFormData.append('description', contentForm.description);
      videoFormData.append('rating', contentForm.rating);
      videoFormData.append('language', contentForm.language);
      videoFormData.append('quality', contentForm.quality);
      videoFormData.append('is_featured', contentForm.is_featured);
      videoFormData.append('tags', contentForm.tags);

      const videoResponse = await axios.post(
        buildApiUrl(getEndpoint('AWS_MEDIA', 'UPLOAD_MOVIE')),
        videoFormData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      if (videoResponse.data.success) {
        setSnackbar({
          open: true,
          message: 'Content uploaded successfully to AWS S3!',
          severity: 'success'
        });
        resetForm();
        fetchUploadedContent();
        fetchStorageStats();
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Upload failed',
        severity: 'error'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setContentForm({
      title: '', description: '', genre: '', releaseYear: '', duration: '',
      rating: 'PG', language: 'English', quality: 'HD', is_featured: false, tags: ''
    });
    setPosterFile(null); setHeroFile(null); setVideoFile(null);
    if (posterFileRef.current) posterFileRef.current.value = '';
    if (heroFileRef.current) heroFileRef.current.value = '';
    if (videoFileRef.current) videoFileRef.current.value = '';
  };

  const handleDeleteContent = async (contentItem) => {
    try {
      await axios.delete(buildApiUrl(getEndpoint('CONTENT', 'DELETE', { id: contentItem.id })));
      setSnackbar({ open: true, message: 'Content deleted successfully', severity: 'success' });
      fetchUploadedContent();
    } catch (error) {
      setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
    }
  };

  const handlePreview = (contentItem) => {
    if (contentItem.video_url) {
      window.open(contentItem.video_url, '_blank');
    }
  };

  const getFileSizeDisplay = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isAuthenticated || !tokenVerified) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Verifying authentication...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CloudUploadIcon sx={{ color: '#dc2626' }} />
          Media Upload & Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload movies, series, and media content to AWS S3 cloud storage
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StorageIcon color={awsConnectionStatus === 'connected' ? 'success' : 'error'} />
          <Typography variant="h6">
            AWS S3 Status: {awsConnectionStatus === 'connected' ? 'Connected' : 'Connection Error'}
          </Typography>
          {awsConnectionStatus === 'checking' && <CircularProgress size={20} />}
        </Box>
        {storageStats && (
          <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
            <Chip icon={<StorageIcon />} label={`Storage: ${storageStats.totalSize || 0} bytes`} color="primary" />
            <Chip icon={<MovieIcon />} label={`Files: ${storageStats.fileCount || 0}`} color="secondary" />
            <Chip icon={<ImageIcon />} label={`Images: ${storageStats.imageCount || 0}`} color="info" />
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%)' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Upload New Content</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Title *" value={contentForm.title}
              onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
              required sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Description" value={contentForm.description}
              onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
              multiline rows={3} sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Genre *" value={contentForm.genre}
              onChange={(e) => setContentForm({ ...contentForm, genre: e.target.value })}
              required sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="Release Year *" value={contentForm.releaseYear}
              onChange={(e) => setContentForm({ ...contentForm, releaseYear: e.target.value })}
              required sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Duration (e.g., 2h 15m)" value={contentForm.duration}
              onChange={(e) => setContentForm({ ...contentForm, duration: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rating</InputLabel>
              <Select value={contentForm.rating} onChange={(e) => setContentForm({ ...contentForm, rating: e.target.value })} label="Rating">
                <MenuItem value="G">G</MenuItem>
                <MenuItem value="PG">PG</MenuItem>
                <MenuItem value="PG-13">PG-13</MenuItem>
                <MenuItem value="R">R</MenuItem>
                <MenuItem value="TV-MA">TV-MA</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Language</InputLabel>
              <Select value={contentForm.language} onChange={(e) => setContentForm({ ...contentForm, language: e.target.value })} label="Language">
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Hindi">Hindi</MenuItem>
                <MenuItem value="Spanish">Spanish</MenuItem>
                <MenuItem value="French">French</MenuItem>
                <MenuItem value="German">German</MenuItem>
                <MenuItem value="Chinese">Chinese</MenuItem>
                <MenuItem value="Japanese">Japanese</MenuItem>
                <MenuItem value="Korean">Korean</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Quality</InputLabel>
              <Select value={contentForm.quality} onChange={(e) => setContentForm({ ...contentForm, quality: e.target.value })} label="Quality">
                <MenuItem value="SD">SD</MenuItem>
                <MenuItem value="HD">HD</MenuItem>
                <MenuItem value="Full HD">Full HD</MenuItem>
                <MenuItem value="4K">4K</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Media Files</Typography>
            
            <Box sx={{ mb: 2 }}>
              <input type="file" ref={videoFileRef} accept="video/*" onChange={(e) => handleFileSelect('video', e.target.files[0])} style={{ display: 'none' }} />
              <Button variant="outlined" startIcon={<VideoFileIcon />} onClick={() => videoFileRef.current?.click()} fullWidth sx={{ mb: 1 }}>
                {videoFile ? videoFile.name : 'Select Video File *'}
              </Button>
              {videoFile && <Typography variant="caption" color="text.secondary">Size: {getFileSizeDisplay(videoFile.size)}</Typography>}
            </Box>

            <Box sx={{ mb: 2 }}>
              <input type="file" ref={posterFileRef} accept="image/*" onChange={(e) => handleFileSelect('poster', e.target.files[0])} style={{ display: 'none' }} />
              <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => posterFileRef.current?.click()} fullWidth sx={{ mb: 1 }}>
                {posterFile ? posterFile.name : 'Select Poster Image'}
              </Button>
              {posterFile && <Typography variant="caption" color="text.secondary">Size: {getFileSizeDisplay(posterFile.size)}</Typography>}
            </Box>

            <Box sx={{ mb: 2 }}>
              <input type="file" ref={heroFileRef} accept="image/*" onChange={(e) => handleFileSelect('hero', e.target.files[0])} style={{ display: 'none' }} />
              <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => heroFileRef.current?.click()} fullWidth sx={{ mb: 1 }}>
                {heroFile ? heroFile.name : 'Select Hero Image'}
              </Button>
              {heroFile && <Typography variant="caption" color="text.secondary">Size: {getFileSizeDisplay(heroFile.size)}</Typography>}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={contentForm.is_featured} onChange={(e) => setContentForm({ ...contentForm, is_featured: e.target.checked })} />}
              label="Mark as Featured Content"
            />
          </Grid>

          {uploading && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Uploading to AWS S3...</Typography>
              </Box>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleUpload} disabled={uploading || !videoFile} startIcon={<CloudUploadIcon />} sx={{ px: 4, py: 1.5 }}>
                {uploading ? 'Uploading...' : 'Upload to AWS S3'}
              </Button>
              <Button variant="outlined" onClick={resetForm} disabled={uploading}>Reset Form</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Uploaded Content</Typography>
          <Button variant="outlined" onClick={fetchUploadedContent} disabled={loading} startIcon={<RefreshIcon />}>Refresh</Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>Loading content...</Typography>
          </Box>
        ) : uploadedContent.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">No content uploaded yet. Start by uploading your first movie!</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {uploadedContent.map((content) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={content.id}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardMedia component="img" height="200" image={content.poster_url || '/placeholder-poster.jpg'} alt={content.title} sx={{ objectFit: 'cover' }} />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{content.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={content.type || 'movie'} size="small" color="primary" />
                      {content.genre && <Chip label={content.genre} size="small" color="secondary" />}
                      <Chip label={content.status || 'active'} size="small" color="success" />
                    </Box>
                    
                    {content.year && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Year: {content.year}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                      <Tooltip title="Preview">
                        <IconButton size="small" onClick={() => handlePreview(content)} color="primary">
                          <PlayIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => { setContentToDelete(content); setDeleteDialogOpen(true); }} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{contentToDelete?.title}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => { handleDeleteContent(contentToDelete); setDeleteDialogOpen(false); }} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MediaUpload;

