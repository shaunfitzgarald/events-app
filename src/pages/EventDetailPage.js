import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  useMediaQuery,
  MobileStepper,
  Alert,
  Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import ImageIcon from '@mui/icons-material/Image';
import dayjs from 'dayjs';

// Import eventService
import { getEventById, deleteEvent } from '../services/eventService';

// Import auth context
import { useAuth } from '../contexts/AuthContext';

// Import components
import EventNavigation from '../components/events/EventNavigation';
import EventAdminManagement from '../components/events/EventAdminManagement';
import EditWithAIButton from '../components/ai/EditWithAIButton';

// Format date using dayjs
const formatDate = (date) => {
  if (!date) return 'Date TBD';
  return dayjs(date).format('MMM D, YYYY');
};

// We'll fetch real event data from Firestore
// Keeping this commented out for reference
/*
const mockEvents = [
  {
    id: '1',
    title: 'Summer Music Festival',
    date: 'Aug 15-17, 2025',
    startTime: '10:00 AM',
    endTime: '10:00 PM',
    location: 'Central Park, New York',
    address: '14 E 60th St, New York, NY 10022',
    image: 'https://source.unsplash.com/random/1200x600/?concert',
    category: 'Music',
    description: 'A three-day music festival featuring top artists from around the world. Join us for an unforgettable weekend of music, food, and fun in the heart of New York City.',
    organizer: {
      name: 'NYC Events',
      image: 'https://source.unsplash.com/random/100x100/?logo',
    },
    price: '$150',
    attendees: [
      {
        id: '1',
        name: 'John Doe',
        image: 'https://source.unsplash.com/random/100x100/?person',
      },
      {
        id: '2',
        name: 'Jane Smith',
        image: 'https://source.unsplash.com/random/100x100/?woman',
      },
      {
        id: '3',
        name: 'Bob Johnson',
        image: 'https://source.unsplash.com/random/100x100/?man',
      },
    ],
    maxAttendees: 5000,
    schedule: [
      {
        day: 'Day 1',
        events: [
          {
            time: '10:00 AM',
            activity: 'Gates Open',
          },
          {
            time: '12:00 PM',
            activity: 'First Act',
          },
          {
            time: '10:00 PM',
            activity: 'Headliner',
          },
        ],
      },
      {
        day: 'Day 2',
        events: [
          {
            time: '10:00 AM',
            activity: 'Gates Open',
          },
          {
            time: '12:00 PM',
            activity: 'First Act',
          },
          {
            time: '10:00 PM',
            activity: 'Headliner',
          },
        ],
      },
    ],
  },
  // More events...
];
*/

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [openRsvpDialog, setOpenRsvpDialog] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpData, setRsvpData] = useState({
    name: '',
    email: '',
    response: 'attending',
    message: '',
  });
  const [canEdit, setCanEdit] = useState(false);
  
  // Image gallery state
  const [activeStep, setActiveStep] = useState(0);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  
  // Delete event state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // Snackbar state for AI updates
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle toggle favorite
  const handleToggleFavorite = () => {
    setFavorite(!favorite);
  };

  // Handle edit event
  const handleEditEvent = () => {
    navigate(`/events/${id}/edit`);
  };
  
  // Handle delete event dialog
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  // Handle delete event
  const handleDeleteEvent = async () => {
    try {
      setDeleting(true);
      setDeleteError('');
      
      // Delete the event
      await deleteEvent(id);
      
      // Show success message
      setDeleteSuccess(true);
      
      // Close the dialog
      setOpenDeleteDialog(false);
      
      // Navigate back to events page after a short delay
      setTimeout(() => {
        navigate('/events');
      }, 2000);
    } catch (error) {
      console.error('Error deleting event:', error);
      setDeleteError('Failed to delete event. Please try again.');
      setDeleting(false);
    }
  };

  // Handle AI event update
  const handleAIEventUpdated = (result) => {
    console.log('Event updated by AI:', result);
    
    // Show success message
    setSnackbarMessage(`Event updated successfully: ${result.summary}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Refresh the event data
    fetchEventData();
  };

  // Open RSVP dialog
  const handleOpenRsvpDialog = () => {
    setOpenRsvpDialog(true);
  };

  // Close RSVP dialog
  const handleCloseRsvpDialog = () => {
    setOpenRsvpDialog(false);
    // Reset form if not submitted
    if (!rsvpSubmitted) {
      setRsvpData({
        name: '',
        email: '',
        response: 'attending',
        message: '',
      });
    }
  };

  // Handle RSVP form change
  const handleRsvpChange = (e) => {
    const { name, value } = e.target;
    setRsvpData({
      ...rsvpData,
      [name]: value,
    });
  };

  // Submit RSVP
  const handleSubmitRsvp = () => {
    // In a real app, this would send data to Firebase
    console.log('RSVP submitted:', rsvpData);
    setRsvpSubmitted(true);
    handleCloseRsvpDialog();
  };

  // Image gallery navigation
  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      const images = event.images || [event.image];
      return prevActiveStep === images.length - 1 ? 0 : prevActiveStep + 1;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      const images = event.images || [event.image];
      return prevActiveStep === 0 ? images.length - 1 : prevActiveStep - 1;
    });
  };

  // Open full-screen image dialog
  const handleOpenImageDialog = () => {
    setOpenImageDialog(true);
  };

  // Close full-screen image dialog
  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
  };

  // Define fetchEventData function at component level
  const fetchEventData = async () => {
    try {
      // Import Firestore functions
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../services/firebase');
      
      // Get event by ID
      const eventData = await getEventById(id);
      console.log('Fetched event data:', eventData);
      
      // Convert Firestore timestamp to date object if needed
      if (eventData.createdAt && typeof eventData.createdAt.toDate === 'function') {
        eventData.createdAt = eventData.createdAt.toDate();
      }
      if (eventData.updatedAt && typeof eventData.updatedAt.toDate === 'function') {
        eventData.updatedAt = eventData.updatedAt.toDate();
      }
      
      setEvent(eventData);
      
      // Check if current user can edit this event (creator or admin)
      if (currentUser && (eventData.createdBy === currentUser.uid || 
          (eventData.admins && eventData.admins.includes(currentUser.uid)))) {
        setCanEdit(true);
      } else {
        setCanEdit(false);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch event data when component mounts or ID changes
  useEffect(() => {
    fetchEventData();
  }, [id, currentUser]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Event not found
  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1">
          Event not found
        </Typography>
      </Container>
    );
  }
  
  // Hero section
  return (
    <React.Fragment>
      <Box
        sx={{
          position: 'relative',
          height: { xs: '300px', md: '400px' },
          width: '100%',
          overflow: 'hidden',
          mb: 4,
        }}
      >
        {/* Image Gallery */}
        <Box
          component="img"
          src={event.images && Array.isArray(event.images) && event.images.length > 0 
            ? event.images[activeStep] 
            : event.image}
          alt={`${event.title} - Image ${activeStep + 1}`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            cursor: 'pointer',
          }}
          onClick={handleOpenImageDialog}
        />
        
        {/* Image Navigation */}
        {event.images && Array.isArray(event.images) && event.images.length > 1 && (
          <MobileStepper
            steps={event.images.length}
            position="bottom"
            activeStep={activeStep}
            sx={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              background: 'rgba(0,0,0,0.5)',
            }}
            nextButton={
              <IconButton 
                onClick={handleNext}
                size="small"
                sx={{ color: 'white' }}
              >
                <KeyboardArrowRight />
              </IconButton>
            }
            backButton={
              <IconButton 
                onClick={handleBack}
                size="small"
                sx={{ color: 'white' }}
              >
                <KeyboardArrowLeft />
              </IconButton>
            }
          />
        )}
      </Box>
      
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <EventNavigation eventId={id} currentTab={0} />
        
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  About This Event
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {canEdit && (
                    <EditWithAIButton 
                      event={event}
                      onEventUpdated={handleAIEventUpdated}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {canEdit && (
                    <IconButton onClick={handleEditEvent} color="primary" title="Edit Event">
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={handleToggleFavorite} color="primary">
                    {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <IconButton color="primary">
                    <ShareIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>
            </Paper>
            
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Schedule" icon={<ScheduleIcon />} iconPosition="start" />
                <Tab label="Attendees" icon={<PeopleIcon />} iconPosition="start" />
                <Tab label="Details" icon={<InfoIcon />} iconPosition="start" />
                {canEdit && <Tab label="Admins" icon={<PersonAddIcon />} iconPosition="start" />}
              </Tabs>
              <Box sx={{ p: 3 }}>
                {tabValue === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Event Schedule
                    </Typography>
                    {event.schedule && event.schedule.length > 0 ? (
                      event.schedule.map((day, index) => (
                        <Box key={index} sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {day.day}
                          </Typography>
                          <List dense>
                            {day.items && Array.isArray(day.items) ? day.items.map((item, idx) => (
                              <ListItem key={idx}>
                                <ListItemText
                                  primary={item.title}
                                  secondary={item.time}
                                />
                              </ListItem>
                            )) : (
                              <ListItem>
                                <ListItemText primary="No events scheduled for this day" />
                              </ListItem>
                            )}
                          </List>
                          {index < event.schedule.length - 1 && <Divider sx={{ my: 1 }} />}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No schedule information available.
                      </Typography>
                    )}
                  </Box>
                )}
                {tabValue === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Attendees ({event.attendees ? event.attendees.length : 0}/{event.maxAttendees || '∞'})
                    </Typography>
                    {event.attendees && event.attendees.length > 0 ? (
                      <List>
                        {event.attendees.map((attendee) => (
                          <ListItem key={attendee.id}>
                            <ListItemAvatar>
                              <Avatar src={attendee.image} alt={attendee.name} />
                            </ListItemAvatar>
                            <ListItemText primary={attendee.name} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No attendees yet. Be the first to RSVP!
                      </Typography>
                    )}
                  </Box>
                )}
                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Additional Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Category</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {event.category || 'Not specified'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Price</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {event.price || 'Free'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Organizer</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          {event.organizer && (
                            <>
                              <Avatar
                                src={event.organizer.image}
                                alt={event.organizer.name}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              />
                              <Typography variant="body2">
                                {event.organizer.name}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {tabValue === 3 && canEdit && (
                  <Box>
                    <EventAdminManagement 
                      event={event} 
                      onAdminChange={() => {
                        // Refresh event data when admins change
                        fetchEventData();
                      }} 
                    />
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 24 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {event.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip 
                  label={event.category} 
                  color="primary" 
                  size="small" 
                  sx={{ mr: 1 }} 
                />
                <Typography variant="body2" color="text.secondary">
                  {event.price || 'Free'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body1">
                    {formatDate(event.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.time} - {event.endTime || 'TBD'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body1">
                    {event.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.address}
                  </Typography>
                </Box>
              </Box>
              {canEdit && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditEvent}
                  >
                    Edit Event
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleOpenDeleteDialog}
                  >
                    Delete Event
                  </Button>
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenRsvpDialog}
                sx={{ mb: 2 }}
              >
                RSVP Now
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<ShareIcon />}
              >
                Share Event
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* RSVP Dialog */}
      <Dialog open={openRsvpDialog} onClose={handleCloseRsvpDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          RSVP to {event.title}
        </DialogTitle>
        <DialogContent>
          {!rsvpSubmitted ? (
            <React.Fragment>
              <DialogContentText sx={{ mb: 2 }}>
                Please fill out the form below to RSVP to this event.
              </DialogContentText>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Your Name"
                    fullWidth
                    value={rsvpData.name}
                    onChange={handleRsvpChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="email"
                    label="Email Address"
                    fullWidth
                    value={rsvpData.email}
                    onChange={handleRsvpChange}
                    required
                    type="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="response-label">Response</InputLabel>
                    <Select
                      labelId="response-label"
                      name="response"
                      value={rsvpData.response}
                      onChange={handleRsvpChange}
                      label="Response"
                    >
                      <MenuItem value="attending">Attending</MenuItem>
                      <MenuItem value="maybe">Maybe</MenuItem>
                      <MenuItem value="not-attending">Not Attending</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="message"
                    label="Message (Optional)"
                    multiline
                    rows={3}
                    fullWidth
                    value={rsvpData.message || ''}
                    onChange={handleRsvpChange}
                  />
                </Grid>
              </Grid>
            </React.Fragment>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Thank you for your RSVP!
              </Typography>
              <Typography variant="body1">
                We've received your response and look forward to seeing you at the event.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRsvpDialog}>
            {rsvpSubmitted ? 'Close' : 'Cancel'}
          </Button>
          {!rsvpSubmitted && (
            <Button 
              onClick={handleSubmitRsvp} 
              variant="contained" 
              color="primary"
              disabled={!rsvpData.name || !rsvpData.email}
            >
              Submit RSVP
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* Delete Event Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteEvent} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar 
        open={deleteSuccess} 
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Event successfully deleted!
        </Alert>
      </Snackbar>
      
      {/* Full-screen Image Dialog */}
      <Dialog
        open={openImageDialog}
        onClose={handleCloseImageDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseImageDialog}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}
          >
            <EditIcon />
          </IconButton>
          
          <Box
            component="img"
            src={event.images && Array.isArray(event.images) && event.images.length > 0 
              ? event.images[activeStep] 
              : event.image}
            alt={`${event.title} - Image ${activeStep + 1}`}
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
          />
          
          {event.images && Array.isArray(event.images) && event.images.length > 1 && (
            <MobileStepper
              steps={event.images.length}
              position="static"
              activeStep={activeStep}
              sx={{
                bgcolor: '#f5f5f5',
              }}
              nextButton={
                <Button
                  size="small"
                  onClick={handleNext}
                  endIcon={<KeyboardArrowRight />}
                >
                  Next
                </Button>
              }
              backButton={
                <Button
                  size="small"
                  onClick={handleBack}
                  startIcon={<KeyboardArrowLeft />}
                >
                  Back
                </Button>
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default EventDetailPage;
