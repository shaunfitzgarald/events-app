import React, { useState } from 'react';
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
  List
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

function CreateEventPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
    image: null,
    imagePreview: null,
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (loadEvent) => {
        setEventData({
          ...eventData,
          image: file,
          imagePreview: loadEvent.target.result
        });
      };
      
      reader.readAsDataURL(file);
    }
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
  const handleSubmit = () => {
    // In a real app, this would send data to Firebase
    console.log('Event data submitted:', eventData);
    
    // Navigate to the events page after submission
    setTimeout(() => {
      navigate('/events');
    }, 1500);
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
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  sx={{ height: '56px' }}
                >
                  {eventData.image ? 'Change Image' : 'Upload Event Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {eventData.imagePreview && (
                  <Box sx={{ position: 'relative', width: '100%', height: '100px' }}>
                    <img
                      src={eventData.imagePreview}
                      alt="Event preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                      onClick={() => setEventData({ ...eventData, image: null, imagePreview: null })}
                    >
                      <DeleteIcon />
                    </IconButton>
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
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              >
                {activeStep === steps.length - 1 ? 'Create Event' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default CreateEventPage;
