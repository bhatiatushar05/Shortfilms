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

const ContentManagement = () => {
  const { isAuthenticated } = useAuth();
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
    status: 'active'
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchContent();
    }
  }, [isAuthenticated]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/content/titles');
      setContent(response.data.data.titles || []);
    } catch (error) {
      console.error('Error fetching content:', error);
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
      status: 'active'
    });
    setAddDialogOpen(true);
  };

  const handleEditContent = (item) => {
    setSelectedContent(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      type: item.type,
      genre: item.genre,
      duration: item.duration,
      releaseYear: item.releaseYear,
      rating: item.rating,
      status: item.status
    });
    setEditDialogOpen(true);
  };

  const handleSaveContent = async () => {
    try {
      if (editDialogOpen && selectedContent) {
        // Update existing content
        await axios.put(`/content/titles/${selectedContent.id}`, formData);
      } else {
        // Add new content
        await axios.post('/content/titles', formData);
      }
      
      fetchContent();
      setAddDialogOpen(false);
      setEditDialogOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    }
  };

  const handleDeleteContent = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await axios.delete(`/content/titles/${id}`);
        fetchContent();
      } catch (error) {
        console.error('Error deleting content:', error);
        alert('Error deleting content. Please try again.');
      }
    }
  };

  const toggleContentStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.patch(`/content/titles/${id}`, { status: newStatus });
      fetchContent();
    } catch (error) {
      console.error('Error updating content status:', error);
      alert('Error updating content status. Please try again.');
    }
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddContent}
          sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}
        >
          Add New Content
        </Button>
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
