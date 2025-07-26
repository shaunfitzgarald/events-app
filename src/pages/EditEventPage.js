import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Card,
  CardMedia,
  Stack,
  LinearProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
  List,
  ListItem
} from '@mui/material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getEventById, updateEvent } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import { uploadMultipleImages } from '../services/storageService';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Draggable Image Item Component
const DraggableImageItem = ({ imageUrl, index, moveImage, removeImage }) => {
  const ref = React.useRef(null);
  
  const [, drop] = useDrop({
    accept: 'image',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  drag(drop(ref));
  
  return (
    <Paper
      ref={ref}
      sx={{
        p: 1,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#f0f0f0' : 'white',
        boxShadow: isDragging ? 3 : 1,
      }}
    >
      <DragIndicatorIcon sx={{ mr: 1, cursor: 'move', color: 'text.secondary' }} />
      <Box sx={{ width: 80, height: 80, mr: 2, flexShrink: 0 }}>
        <img
          src={imageUrl}
          alt={`Event image ${index + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
        />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Image {index + 1}
          {index === 0 && (
            <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
              (Main image)
            </Typography>
          )}
        </Typography>
      </Box>
      <IconButton onClick={() => removeImage(index)} color="error" size="small">
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
};

function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    startDate: null,
    endDate: null,
    image: '', // Keep for backward compatibility
    images: [], // Array for multiple images
    price: '',
    maxAttendees: '',
    isPublic: true
  });
  
  // Image upload state
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Categories
  const categories = [
    'Music',
    'Tech',
    'Food',
    'Art',
    'Business',
    'Sports',
    'Education',
    'Celebration',
    'Other'
  ];
  
  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEventById(id);
        
        // Check if current user is the creator or an admin
        if (eventData.createdBy !== currentUser?.uid && 
            (!eventData.admins || !eventData.admins.includes(currentUser?.uid))) {
          setError('You do not have permission to edit this event');
          setLoading(false);
          return;
        }
        
        setEvent(eventData);
        
        // Handle images array or single image
        const eventImages = eventData.images || [];
        // If there's a single image but no images array, add it to the array for backward compatibility
        if (eventData.image && eventImages.length === 0) {
          eventImages.push(eventData.image);
        }
        
        // Format dates with dayjs
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          location: eventData.location || '',
          category: eventData.category || '',
          startDate: eventData.startDate ? (eventData.startDate && typeof eventData.startDate === 'object' && eventData.startDate.toDate ? dayjs(eventData.startDate.toDate()) : dayjs(eventData.startDate)) : null,
          endDate: eventData.endDate ? (eventData.endDate && typeof eventData.endDate === 'object' && eventData.endDate.toDate ? dayjs(eventData.endDate.toDate()) : dayjs(eventData.endDate)) : null,
          image: eventData.image || '', // Keep for backward compatibility
          images: eventImages,
          price: eventData.price || '',
          maxAttendees: eventData.maxAttendees || '',
          isPublic: eventData.isPublic !== undefined ? eventData.isPublic : true
        });
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id, currentUser]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle date changes
  const handleDateChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle image selection
  const handleImageSelect = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages([...selectedImages, ...filesArray]);
    }
  };

  // Handle image removal from selected images (before upload)
  const handleRemoveSelectedImage = (index) => {
    const newSelectedImages = [...selectedImages];
    newSelectedImages.splice(index, 1);
    setSelectedImages(newSelectedImages);
  };

  // Handle image removal from existing images
  const handleRemoveExistingImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages,
      // If this was the last image and it was also the main image, clear that too
      image: newImages.length === 0 ? '' : (index === 0 ? newImages[0] : formData.image)
    });
  };
  
  // Handle image reordering
  const moveImage = (dragIndex, hoverIndex) => {
    const draggedImage = formData.images[dragIndex];
    const newImages = [...formData.images];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    
    setFormData({
      ...formData,
      images: newImages,
      // Update the main image if the first image changed
      image: newImages.length > 0 ? newImages[0] : ''
    });
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedImages.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload multiple images to Firebase Storage
      // Log the upload path for debugging
      const uploadPath = `events/${id}`;
      console.log('Uploading images to path:', uploadPath);
      
      const imageUrls = await uploadMultipleImages(
        selectedImages,
        uploadPath,
        (progress) => setUploadProgress(progress)
      );
      
      // Add new image URLs to form data
      setFormData({
        ...formData,
        images: [...formData.images, ...imageUrls],
        // If this is the first image, also set it as the main image for backward compatibility
        image: formData.image || (formData.images.length === 0 && imageUrls.length > 0 ? imageUrls[0] : formData.image)
      });
      
      // Clear selected images after successful upload
      setSelectedImages([]);
      setSuccess(true);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validate form data
      if (!formData.title) {
        setError('Event title is required');
        setSaving(false);
        return;
      }
      
      // Upload any pending images first
      if (selectedImages.length > 0) {
        await handleImageUpload();
      }
      
      // Prepare event data for update
      const eventData = {
        ...formData,
        // Ensure dates are properly formatted for Firestore
        startDate: formData.startDate && formData.startDate.isValid() ? formData.startDate.toDate() : null,
        endDate: formData.endDate && formData.endDate.isValid() ? formData.endDate.toDate() : null,
      };
      
      // Log the event data for debugging
      console.log('Saving event with dates:', { 
        startDate: eventData.startDate, 
        endDate: eventData.endDate,
        startDateValid: formData.startDate ? formData.startDate.isValid() : false,
        endDateValid: formData.endDate ? formData.endDate.isValid() : false
      });
      
      // Update event in Firestore
      await updateEvent(id, eventData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/events/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate(`/events/${id}`);
  };
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Error state
  if (error && !event) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Event
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Event Title"
                fullWidth
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="location"
                label="Location"
                fullWidth
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Event Images
              </Typography>
              
              {/* Display existing images */}
              {formData.images && formData.images.length > 0 ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Drag to reorder images. The first image will be used as the main event image.
                  </Typography>
                  
                  <DndProvider backend={HTML5Backend}>
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {formData.images.map((imageUrl, index) => (
                        <DraggableImageItem
                          key={index}
                          index={index}
                          imageUrl={imageUrl}
                          moveImage={moveImage}
                          removeImage={handleRemoveExistingImage}
                        />
                      ))}
                    </Box>
                  </DndProvider>
                  
                  {/* Also show as grid for visual reference */}
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Image Gallery Preview:
                  </Typography>
                  <ImageList sx={{ maxHeight: 200 }} cols={3} rowHeight={100}>
                    {formData.images.map((imageUrl, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={imageUrl}
                          alt={`Event image ${index + 1}`}
                          loading="lazy"
                          style={{ height: '100%', objectFit: 'cover' }}
                        />
                        {index === 0 && (
                          <ImageListItemBar
                            title="Main"
                            sx={{ background: 'rgba(0,0,0,0.3)' }}
                          />
                        )}
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  No images uploaded yet. Add some images below.
                </Typography>
              )}
              
              {/* Image upload section */}
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload-button"
                  multiple
                  type="file"
                  onChange={handleImageSelect}
                />
                <label htmlFor="image-upload-button">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{ mr: 2 }}
                  >
                    Select Images
                  </Button>
                </label>
                
                {selectedImages.length > 0 && (
                  <Button
                    variant="contained"
                    onClick={handleImageUpload}
                    disabled={uploading}
                  >
                    Upload {selectedImages.length} {selectedImages.length === 1 ? 'Image' : 'Images'}
                  </Button>
                )}
              </Box>
              
              {/* Selected images preview */}
              {selectedImages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Selected Images ({selectedImages.length})
                  </Typography>
                  <ImageList sx={{ maxHeight: 200 }} cols={3} rowHeight={100}>
                    {selectedImages.map((file, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Selected image ${index + 1}`}
                          loading="lazy"
                          style={{ height: '100%', objectFit: 'cover' }}
                        />
                        <ImageListItemBar
                          actionIcon={
                            <IconButton
                              sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                              onClick={() => handleRemoveSelectedImage(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
              
              {/* Upload progress */}
              {uploading && (
                <Box sx={{ width: '100%', mb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" color="text.secondary" align="center">
                    {Math.round(uploadProgress)}%
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={formData.startDate}
                  onChange={(newValue) => handleDateChange('startDate', newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="End Date & Time"
                  value={formData.endDate}
                  onChange={(newValue) => handleDateChange('endDate', newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price"
                fullWidth
                value={formData.price}
                onChange={handleChange}
                placeholder="Free or amount"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="maxAttendees"
                label="Maximum Attendees"
                fullWidth
                type="number"
                value={formData.maxAttendees}
                onChange={handleChange}
                placeholder="Leave blank for unlimited"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="visibility-label">Visibility</InputLabel>
                <Select
                  labelId="visibility-label"
                  id="isPublic"
                  name="isPublic"
                  value={formData.isPublic}
                  onChange={handleChange}
                  label="Visibility"
                >
                  <MenuItem value={true}>Public</MenuItem>
                  <MenuItem value={false}>Private</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Event updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default EditEventPage;
