import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Chip,
  Pagination,
  Stack,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Link } from 'react-router-dom';
import { getFilteredEvents } from '../services/eventService';
import dayjs from 'dayjs';

// Helper function to get the best available image for an event
const getEventImage = (event) => {
  // Priority order:
  // 1. First image from images array (multi-image support)
  // 2. Single image in images field (if it's a string)
  // 3. Single image field (legacy format)
  // 4. Category-based fallback image
  
  // Check for images array (new multi-image format)
  if (event.images && Array.isArray(event.images) && event.images.length > 0) {
    const firstImage = event.images[0];
    if (firstImage && typeof firstImage === 'string' && firstImage.trim() !== '') {
      return firstImage;
    }
  }
  
  // Check if event.images is a single string (not an array)
  if (event.images && typeof event.images === 'string' && event.images.trim() !== '') {
    return event.images;
  }
  
  // Check for single image field (legacy format)
  if (event.image && typeof event.image === 'string' && event.image.trim() !== '') {
    return event.image;
  }
  
  // Fallback to category-based image or generic event image
  const category = event.category || 'event';
  return `https://source.unsplash.com/800x400/?${encodeURIComponent(category)}`;
};

// Format date using dayjs
const formatDate = (date) => {
  if (!date) return 'Date TBD';
  return dayjs(date).format('MMM D, YYYY');
};

function EventsPage() {
  // State for filters and events
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const eventsPerPage = 6;
  
  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const filters = {
          category: category !== '' && category !== 'All Categories' ? category : null,
          searchTerm: searchTerm
        };
        
        const eventsData = await getFilteredEvents(filters);
        setEvents(eventsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [category, searchTerm]);

  // Categories
  const categories = [
    'All Categories',
    'Music',
    'Technology',
    'Food & Drink',
    'Art & Culture',
    'Business',
    'Charity',
    'Sports',
    'Education'
  ];

  // Handle filter changes
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1); // Reset to first page when category changes
  };

  // Pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const indexOfLastEvent = page * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography component="h1" variant="h3" color="text.primary" gutterBottom>
        Discover Events
      </Typography>
      
      {/* Search and Filter */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={category}
                label="Category"
                onChange={handleCategoryChange}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {/* Results count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Showing {events.length} events
        </Typography>
      </Box>
      
      {/* Dynamic Responsive Events Grid */}
      {events.length > 0 ? (
        <>
          <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(auto-fit, minmax(300px, 1fr))',
                md: 'repeat(auto-fit, minmax(350px, 1fr))',
                lg: 'repeat(auto-fit, minmax(380px, 1fr))',
                xl: 'repeat(auto-fit, minmax(400px, 1fr))'
              },
              gap: { xs: 2, sm: 3, md: 4 },
              alignItems: 'start'
            }}
          >
            {currentEvents.map((event) => (
              <Card 
                key={event.id}
                sx={{ 
                  height: 'fit-content',
                  minHeight: '400px',
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                  '&:active': {
                    transform: 'translateY(-8px) scale(1.01)',
                  }
                }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      height: { xs: 180, sm: 200, md: 220 },
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                    image={getEventImage(event)}
                    alt={event.title}
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      e.target.src = `https://source.unsplash.com/800x400/?${encodeURIComponent(event.category || 'event')}`;
                    }}
                  />
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: { xs: 2, sm: 2.5, md: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                  }}>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="h2"
                      sx={{
                        fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' },
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: 'text.primary',
                        mb: 1
                      }}
                    >
                      {event.title}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mb: 0.5
                    }}>
                      <CalendarTodayIcon 
                        fontSize="small" 
                        sx={{ 
                          color: 'primary.main', 
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 500
                        }}
                      >
                        {formatDate(event.date)} - {event.time}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mb: 1
                    }}>
                      <LocationOnIcon 
                        fontSize="small" 
                        sx={{ 
                          color: 'primary.main',
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' },
                          fontWeight: 500
                        }}
                      >
                        {event.location || 'Location TBD'}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                        lineHeight: 1.5,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {event.description || 'No description available'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ 
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    pt: 0,
                    gap: 1,
                    justifyContent: 'space-between'
                  }}>
                    <Button 
                      size="small" 
                      variant="contained"
                      color="primary"
                      component={Link}
                      to={`/events/${event.id}`}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 0.75, sm: 1 },
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                        }
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                        px: { xs: 2, sm: 2.5 },
                        py: { xs: 0.75, sm: 1 },
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          backgroundColor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    >
                      RSVP
                    </Button>
                  </CardActions>
                </Card>
            ))}
          </Grid>
          
          {/* Pagination */}
          {events.length > eventsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={Math.ceil(events.length / eventsPerPage)} 
                page={page} 
                onChange={handleChangePage} 
                color="primary" 
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default EventsPage;
