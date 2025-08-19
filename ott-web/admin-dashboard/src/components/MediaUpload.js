import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MediaUpload = () => {
  const { isAuthenticated } = useAuth();
  const [contentType, setContentType] = useState('movie');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('PG');
  const [releaseYear, setReleaseYear] = useState('');
  const [duration, setDuration] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedContent, setUploadedContent] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({
    poster: null,
    hero: null,
    video: null
  });
  const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });
  const [uploadStatus, setUploadStatus] = useState('');
  const posterInputRef = useRef();
  const heroInputRef = useRef();
  const videoInputRef = useRef();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUploadedContent();
    }
  }, [isAuthenticated]);

  const fetchUploadedContent = async () => {
    try {
      const response = await axios.get('/content/titles');
      if (response.data.success) {
        setUploadedContent(response.data.data.titles || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleFileSelect = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFiles(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return false;
    }
    if (!selectedFiles.video) {
      alert('Please select a video file');
      return false;
    }
    if (!selectedFiles.poster) {
      alert('Please select a poster image');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');

    try {
      // Create FormData for content upload
      const formData = new FormData();
      
      // Add content metadata
      formData.append('title', title);
      formData.append('description', description);
      formData.append('contentType', contentType);
      formData.append('genre', genre);
      formData.append('rating', rating);
      formData.append('releaseYear', releaseYear);
      formData.append('duration', duration);

      // Add media files
      if (selectedFiles.poster) {
        formData.append('poster', selectedFiles.poster);
      }
      if (selectedFiles.hero) {
        formData.append('hero', selectedFiles.hero);
      }
      if (selectedFiles.video) {
        formData.append('video', selectedFiles.video);
      }

      setUploadStatus('Uploading files...');

      // Upload to backend
      const response = await axios.post('/media/upload-content', formData, {
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
        setUploadedContent(prev => [newContent, ...prev]);
        
        // Refresh the content list to get the latest data
        fetchUploadedContent();

        // Reset form
        setSelectedFiles({
          poster: null,
          hero: null,
          video: null
        });
        setTitle('');
        setDescription('');
        setGenre('');
        setRating('PG');
        setReleaseYear('');
        setDuration('');
        
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
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteContent = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await axios.delete(`/content/titles/${id}`);
        setUploadedContent(prev => prev.filter(content => content.id !== id));
        alert('Content deleted successfully!');
      } catch (error) {
        console.error('Error deleting content:', error);
        alert(`Error deleting content: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handlePreview = (file) => {
    setPreviewDialog({ open: true, file });
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
          disabled={isUploading || !title.trim() || !selectedFiles.video}
          sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}
        >
          {isUploading ? 'Uploading...' : 'Upload Content'}
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
                value={contentType}
                label="Content Type"
                onChange={(e) => setContentType(e.target.value)}
              >
                <MenuItem value="movie">Movie</MenuItem>
                <MenuItem value="series">Series</MenuItem>
                <MenuItem value="short">Short</MenuItem>
                <MenuItem value="trailer">Trailer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Rating</InputLabel>
                  <Select
                    value={rating}
                    label="Rating"
                    onChange={(e) => setRating(e.target.value)}
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
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  fullWidth
                  type="number"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
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
                  border: selectedFiles.poster ? '2px solid #4caf50' : '2px dashed rgba(255,255,255,0.3)',
                  background: selectedFiles.poster ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#4caf50' }
                }} onClick={() => posterInputRef.current?.click()}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    {selectedFiles.poster ? (
                      <>
                        <CheckIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {selectedFiles.poster.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(selectedFiles.poster.size)}
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
                  onChange={(e) => handleFileSelect('poster', e)}
                  style={{ display: 'none' }}
                />
              </Grid>

              {/* Hero Upload */}
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  border: selectedFiles.hero ? '2px solid #2196f3' : '2px dashed rgba(255,255,255,0.3)',
                  background: selectedFiles.hero ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#2196f3' }
                }} onClick={() => heroInputRef.current?.click()}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    {selectedFiles.hero ? (
                      <>
                        <CheckIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {selectedFiles.hero.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(selectedFiles.hero.size)}
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
                  onChange={(e) => handleFileSelect('hero', e)}
                  style={{ display: 'none' }}
                />
              </Grid>

              {/* Video Upload */}
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  border: selectedFiles.video ? '2px solid #ff9800' : '2px dashed rgba(255,255,255,0.3)',
                  background: selectedFiles.video ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#ff9800' }
                }} onClick={() => videoInputRef.current?.click()}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    {selectedFiles.video ? (
                      <>
                        <CheckIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {selectedFiles.video.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(selectedFiles.video.size)}
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
                  onChange={(e) => handleFileSelect('video', e)}
                  style={{ display: 'none' }}
                />
              </Grid>
            </Grid>

            {isUploading && (
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
      {uploadedContent.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Uploaded Content ({uploadedContent.length})
          </Typography>
          
          <Grid container spacing={2}>
            {uploadedContent.map((content) => (
              <Grid item xs={12} sm={6} md={4} key={content.id}>
                <Card sx={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        label={content.kind}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={content.status}
                        size="small"
                        color={content.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {content.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {content.synopsis || 'No description'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {content.genres?.map((genre, index) => (
                        <Chip key={index} label={genre} size="small" />
                      ))}
                      <Chip label={content.rating} size="small" color="warning" />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      {content.year} • {content.runtime_sec ? Math.floor(content.runtime_sec / 60) + 'm' : 'N/A'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => handlePreview(content)}
                        color="primary"
                      >
                        <PlayIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteContent(content.id)}
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
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, file: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Preview: {previewDialog.file?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {previewDialog.file?.poster_url ? (
              <img
                src={`http://localhost:5001${previewDialog.file.poster_url}`}
                alt={previewDialog.file.title}
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
              {previewDialog.file?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {previewDialog.file?.synopsis}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, file: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaUpload;
