import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  InputAdornment,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  useMediaQuery,
  List,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Card,
  CardContent,
  CardMedia,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { uploadMultipleImages } from '../services/storageService';
import { addEvent } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import DragDropImageUpload from '../components/DragDropImageUpload';

// Mock categories
const categories = [
  'Music',
  'Technology',
  'Food & Drink',
  'Art & Culture',
  'Business',
  'Charity',
  'Sports',
  'Education',
  'Health & Wellness',
  'Other'
];

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

function CreateEventPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // State for stepper
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Basic Info', 'Details & Schedule', 'RSVP Settings', 'Review'];
  
  // State for form data
  const [eventData, setEventData] = useState({
    title: '',
    category: '',
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    location: '',
    address: '',
    description: '',
    image: null, // Keep for backward compatibility
    imagePreview: null, // Keep for backward compatibility
    images: [], // Array of image files
    imagePreviews: [], // Array of image preview URLs
    price: '',
    isPaid: false,
    maxAttendees: '',
    isLimited: false,
    rsvpDeadline: null,
    allowGuests: true,
    maxGuestsPerRSVP: 2,
    collectEmails: true,
    customQuestions: [],
    schedule: [{ day: 'Day 1', items: [{ time: '', title: '' }] }]
  });
  
  // State for image upload
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // State for form validation
  const [errors, setErrors] = useState({});
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData({
      ...eventData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle date/time changes
  const handleDateChange = (name, value) => {
    setEventData({
      ...eventData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newImagePreviews = [];
      
      // Process each file and create previews
      Promise.all(
        filesArray.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
              newImagePreviews.push(loadEvent.target.result);
              resolve();
            };
            reader.readAsDataURL(file);
          });
        })
      ).then(() => {
        setEventData({
          ...eventData,
          // For backward compatibility
          image: filesArray[0],
          imagePreview: newImagePreviews[0],
          // For multiple images
          images: [...eventData.images, ...filesArray],
          imagePreviews: [...eventData.imagePreviews, ...newImagePreviews]
        });
      });
    }
  };
  
  // Handle image removal
  const handleRemoveImage = (index) => {
    const newImages = [...eventData.images];
    const newImagePreviews = [...eventData.imagePreviews];
    
    newImages.splice(index, 1);
    newImagePreviews.splice(index, 1);
    
    setEventData({
      ...eventData,
      images: newImages,
      imagePreviews: newImagePreviews,
      // Update single image fields for backward compatibility
      image: newImages.length > 0 ? newImages[0] : null,
      imagePreview: newImagePreviews.length > 0 ? newImagePreviews[0] : null
    });
  };
  
  // Handle image reordering
  const moveImage = (dragIndex, hoverIndex) => {
    const draggedImage = eventData.images[dragIndex];
    const draggedPreview = eventData.imagePreviews[dragIndex];
    
    const newImages = [...eventData.images];
    const newImagePreviews = [...eventData.imagePreviews];
    
    // Remove dragged items
    newImages.splice(dragIndex, 1);
    newImagePreviews.splice(dragIndex, 1);
    
    // Insert at new position
    newImages.splice(hoverIndex, 0, draggedImage);
    newImagePreviews.splice(hoverIndex, 0, draggedPreview);
    
    setEventData({
      ...eventData,
      images: newImages,
      imagePreviews: newImagePreviews,
      // Update single image fields for backward compatibility
      image: newImages.length > 0 ? newImages[0] : null,
      imagePreview: newImagePreviews.length > 0 ? newImagePreviews[0] : null
    });
  };
  
  // Handle schedule changes
  const handleScheduleChange = (dayIndex, itemIndex, field, value) => {
    const updatedSchedule = [...eventData.schedule];
    updatedSchedule[dayIndex].items[itemIndex][field] = value;
    
    setEventData({
      ...eventData,
      schedule: updatedSchedule
    });
  };
  
  // Add schedule item
  const addScheduleItem = (dayIndex) => {
    const updatedSchedule = [...eventData.schedule];
    updatedSchedule[dayIndex].items.push({ time: '', title: '' });
    
    setEventData({
      ...eventData,
      schedule: updatedSchedule
    });
  };
  
  // Remove schedule item
  const removeScheduleItem = (dayIndex, itemIndex) => {
    const updatedSchedule = [...eventData.schedule];
    updatedSchedule[dayIndex].items.splice(itemIndex, 1);
    
    setEventData({
      ...eventData,
      schedule: updatedSchedule
    });
  };
  
  // Add schedule day
  const addScheduleDay = () => {
    const updatedSchedule = [...eventData.schedule];
    updatedSchedule.push({
      day: `Day ${updatedSchedule.length + 1}`,
      items: [{ time: '', title: '' }]
    });
    
    setEventData({
      ...eventData,
      schedule: updatedSchedule
    });
  };
  
  // Remove schedule day
  const removeScheduleDay = (dayIndex) => {
    const updatedSchedule = [...eventData.schedule];
    updatedSchedule.splice(dayIndex, 1);
    
    setEventData({
      ...eventData,
      schedule: updatedSchedule
    });
  };
  
  // Add custom question
  const [newQuestion, setNewQuestion] = useState('');
  
  const addCustomQuestion = () => {
    if (newQuestion.trim()) {
      setEventData({
        ...eventData,
        customQuestions: [...eventData.customQuestions, newQuestion]
      });
      setNewQuestion('');
    }
  };
  
  // Remove custom question
  const removeCustomQuestion = (index) => {
    const updatedQuestions = [...eventData.customQuestions];
    updatedQuestions.splice(index, 1);
    
    setEventData({
      ...eventData,
      customQuestions: updatedQuestions
    });
  };
  
  // Validate form data for current step
  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      if (!eventData.title) newErrors.title = 'Title is required';
      if (!eventData.category) newErrors.category = 'Category is required';
      if (!eventData.startDate) newErrors.startDate = 'Start date is required';
      if (!eventData.startTime) newErrors.startTime = 'Start time is required';
      if (!eventData.location) newErrors.location = 'Location is required';
    } else if (activeStep === 1) {
      if (!eventData.description) newErrors.description = 'Description is required';
    } else if (activeStep === 2) {
      if (eventData.isLimited && !eventData.maxAttendees) {
        newErrors.maxAttendees = 'Maximum attendees is required';
      }
      if (eventData.isPaid && !eventData.price) {
        newErrors.price = 'Price is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!currentUser) {
      setSubmitError('You must be logged in to create an event');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      let imageUrls = [];
      
      // Upload images if any are selected
      if (eventData.images && eventData.images.length > 0) {
        console.log('Uploading images...', eventData.images);
        imageUrls = await uploadMultipleImages(
          eventData.images,
          'events/images',
          (progress) => {
            console.log('Upload progress:', progress);
          }
        );
        console.log('Images uploaded successfully:', imageUrls);
      }
      
      // Prepare event data for Firestore
      const eventToSave = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        location: eventData.location,
        address: eventData.address,
        startDate: eventData.startDate ? eventData.startDate.toDate() : null,
        endDate: eventData.endDate ? eventData.endDate.toDate() : null,
        startTime: eventData.startTime ? eventData.startTime.format('HH:mm') : null,
        endTime: eventData.endTime ? eventData.endTime.format('HH:mm') : null,
        images: imageUrls,
        image: imageUrls.length > 0 ? imageUrls[0] : null, // For backward compatibility
        isPublic: eventData.isPublic,
        isLimited: eventData.isLimited,
        maxAttendees: eventData.isLimited ? parseInt(eventData.maxAttendees) || null : null,
        price: eventData.price ? parseFloat(eventData.price) || 0 : 0,
        schedule: eventData.schedule || [],
        createdBy: currentUser.uid,
        attendees: [],
        admins: []
      };
      
      console.log('Saving event to Firestore:', eventToSave);
      
      // Save event to Firestore
      const eventId = await addEvent(eventToSave);
      
      console.log('Event created successfully with ID:', eventId);
      
      // Navigate to the event detail page
      navigate(`/events/${eventId}`);
      
    } catch (error) {
      console.error('Error creating event:', error);
      setSubmitError(`Failed to create event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render form steps
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Event Title"
                fullWidth
                required
                value={eventData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.category}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={eventData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Event Images
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DragDropImageUpload
                  onFilesSelected={(files) => {
                    // Convert FileList to event-like object for handleImageChange
                    const event = {
                      target: {
                        files: files
                      }
                    };
                    handleImageChange(event);
                  }}
                  multiple={true}
                  maxFiles={10}
                  existingImagesCount={eventData.images.length}
                  disabled={isSubmitting}
                />
                
                {/* Display uploaded images with drag-and-drop reordering */}
                {eventData.imagePreviews.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Drag to reorder images. The first image will be used as the main event image.
                    </Typography>
                    
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {eventData.imagePreviews.map((preview, index) => (
                        <DraggableImageItem
                          key={index}
                          index={index}
                          imageUrl={preview}
                          moveImage={moveImage}
                          removeImage={handleRemoveImage}
                        />
                      ))}
                    </Box>
                    
                    {/* Also show as grid for visual reference */}
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Image Gallery Preview:
                    </Typography>
                    <ImageList sx={{ maxHeight: 200 }} cols={3} rowHeight={100}>
                      {eventData.imagePreviews.map((preview, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={preview}
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
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={eventData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date (Optional)"
                  value={eventData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Start Time"
                  value={eventData.startTime}
                  onChange={(time) => handleDateChange('startTime', time)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.startTime}
                      helperText={errors.startTime}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="End Time (Optional)"
                  value={eventData.endTime}
                  onChange={(time) => handleDateChange('endTime', time)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="location"
                label="Location"
                fullWidth
                required
                value={eventData.location}
                onChange={handleChange}
                error={!!errors.location}
                helperText={errors.location}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                value={eventData.address}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Event Description"
                multiline
                rows={4}
                fullWidth
                required
                value={eventData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Event Schedule
              </Typography>
              
              {eventData.schedule.map((day, dayIndex) => (
                <Paper key={dayIndex} sx={{ p: 2, mb: 2, position: 'relative' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <TextField
                      label="Day Title"
                      value={day.day}
                      onChange={(e) => {
                        const updatedSchedule = [...eventData.schedule];
                        updatedSchedule[dayIndex].day = e.target.value;
                        setEventData({ ...eventData, schedule: updatedSchedule });
                      }}
                      variant="standard"
                      sx={{ width: '200px' }}
                    />
                    
                    {eventData.schedule.length > 1 && (
                      <IconButton 
                        color="error" 
                        onClick={() => removeScheduleDay(dayIndex)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  
                  {day.items.map((item, itemIndex) => (
                    <Box key={itemIndex} sx={{ display: 'flex', mb: 1, gap: 2 }}>
                      <TextField
                        label="Time"
                        value={item.time}
                        onChange={(e) => handleScheduleChange(dayIndex, itemIndex, 'time', e.target.value)}
                        sx={{ width: '150px' }}
                      />
                      <TextField
                        label="Activity"
                        value={item.title}
                        onChange={(e) => handleScheduleChange(dayIndex, itemIndex, 'title', e.target.value)}
                        fullWidth
                      />
                      {day.items.length > 1 && (
                        <IconButton 
                          color="error" 
                          onClick={() => removeScheduleItem(dayIndex, itemIndex)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => addScheduleItem(dayIndex)}
                    sx={{ mt: 1 }}
                  >
                    Add Activity
                  </Button>
                </Paper>
              ))}
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addScheduleDay}
                sx={{ mt: 1 }}
              >
                Add Day
              </Button>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Attendance Settings
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isLimited"
                    checked={eventData.isLimited}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Limit number of attendees"
              />
            </Grid>
            
            {eventData.isLimited && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="maxAttendees"
                  label="Maximum Attendees"
                  type="number"
                  fullWidth
                  value={eventData.maxAttendees}
                  onChange={handleChange}
                  error={!!errors.maxAttendees}
                  helperText={errors.maxAttendees}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isPaid"
                    checked={eventData.isPaid}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="This is a paid event"
              />
            </Grid>
            
            {eventData.isPaid && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="price"
                  label="Price"
                  fullWidth
                  value={eventData.price}
                  onChange={handleChange}
                  error={!!errors.price}
                  helperText={errors.price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                RSVP Settings
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="RSVP Deadline (Optional)"
                  value={eventData.rsvpDeadline}
                  onChange={(date) => handleDateChange('rsvpDeadline', date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="allowGuests"
                    checked={eventData.allowGuests}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Allow guests"
              />
            </Grid>
            
            {eventData.allowGuests && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="maxGuestsPerRSVP"
                  label="Max Guests per RSVP"
                  type="number"
                  fullWidth
                  value={eventData.maxGuestsPerRSVP}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="collectEmails"
                    checked={eventData.collectEmails}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Collect email addresses"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Custom Questions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add questions that attendees will need to answer when they RSVP
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {eventData.customQuestions.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    onDelete={() => removeCustomQuestion(index)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Add a question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={addCustomQuestion}
                  disabled={!newQuestion.trim()}
                >
                  Add
                </Button>
              </Box>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please review your event details before submitting.
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Title:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{eventData.title}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Category:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{eventData.category}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Date:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>
                      {eventData.startDate ? dayjs(eventData.startDate).format('MM/DD/YYYY') : ''}
                      {eventData.endDate && ` - ${dayjs(eventData.endDate).format('MM/DD/YYYY')}`}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Time:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>
                      {eventData.startTime ? dayjs(eventData.startTime).format('h:mm A') : ''}
                      {eventData.endTime && ` - ${dayjs(eventData.endTime).format('h:mm A')}`}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Location:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{eventData.location}</Typography>
                    {eventData.address && (
                      <Typography variant="body2" color="text.secondary">
                        {eventData.address}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography>{eventData.description}</Typography>
              </Paper>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Attendance Settings
                </Typography>
                <Grid container spacing={2}>
                  {eventData.isLimited && (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Maximum Attendees:</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography>{eventData.maxAttendees}</Typography>
                      </Grid>
                    </>
                  )}
                  
                  {eventData.isPaid && (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Price:</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography>${eventData.price}</Typography>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">RSVP Deadline:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>
                      {eventData.rsvpDeadline ? dayjs(eventData.rsvpDeadline).format('MM/DD/YYYY') : 'No deadline'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Allow Guests:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>
                      {eventData.allowGuests ? `Yes (Max: ${eventData.maxGuestsPerRSVP})` : 'No'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="subtitle2">Collect Emails:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>{eventData.collectEmails ? 'Yes' : 'No'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              {eventData.customQuestions.length > 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Custom Questions
                  </Typography>
                  <List>
                    {eventData.customQuestions.map((question, index) => (
                      <Typography key={index} paragraph>
                        {index + 1}. {question}
                      </Typography>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Create Event
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Event Created Successfully!
            </Typography>
            <Typography variant="body1" paragraph>
              Your event has been created and is now live.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/events')}
              sx={{ mt: 2 }}
            >
              View All Events
            </Button>
          </Box>
        ) : (
          <>
            {renderStepContent(activeStep)}
            
            {/* Error display */}
            {submitError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {submitError}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0 || isSubmitting}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                startIcon={isSubmitting && activeStep === steps.length - 1 ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting && activeStep === steps.length - 1 
                  ? 'Creating Event...' 
                  : activeStep === steps.length - 1 
                    ? 'Create Event' 
                    : 'Next'
                }
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default CreateEventPage;
