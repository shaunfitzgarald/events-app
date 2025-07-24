import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  TextField, 
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress, 
  Alert,
  Pagination,
  Card,
  CardContent,
  CardMedia,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EventCard from '../components/events/EventCard';

function ExplorePage() {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const eventsPerPage = 9;

  // Categories for filtering
  const categories = [
    'All',
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

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Import Firestore functions
        const { collection, getDocs, query, where, orderBy, limit } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        
        // Get events collection
        const eventsRef = collection(db, 'events');
        
        // We could add filters here in the future
        const q = query(eventsRef, orderBy('date', 'asc'));
        const eventsSnapshot = await getDocs(q);
        
        // Transform events data
        const eventsData = eventsSnapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        
        console.log('Fetched events for explore:', eventsData);
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Filter events when search or category changes
  useEffect(() => {
    let result = events;
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(event => 
        event.title?.toLowerCase().includes(searchLower) || 
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (category && category !== 'all') {
      result = result.filter(event => 
        event.category?.toLowerCase() === category.toLowerCase()
      );
    }
    
    setFilteredEvents(result);
    setPage(1); // Reset to first page when filters change
  }, [search, category, events]);

  // Get current page of events
  const indexOfLastEvent = page * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const pageCount = Math.ceil(filteredEvents.length / eventsPerPage);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search change
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  // Handle category change
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  // Featured events section (top 3 events)
  const featuredEvents = events.slice(0, 3);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Title */}
      <Typography variant="h4" component="h1" gutterBottom>
        Explore Events
      </Typography>

      {/* Featured Events Section */}
      {!loading && !error && featuredEvents.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Featured Events
          </Typography>
          <Grid container spacing={3}>
            {featuredEvents.map((event) => (
              <Grid item xs={12} md={4} key={event.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={event.image || 'https://source.unsplash.com/random/800x400/?event'}
                    alt={event.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.description?.substring(0, 120)}
                      {event.description?.length > 120 ? '...' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Search and Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search events..."
              value={search}
              onChange={handleSearchChange}
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
              <InputLabel id="category-select-label">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterListIcon sx={{ mr: 1 }} />
                  Category
                </Box>
              </InputLabel>
              <Select
                labelId="category-select-label"
                value={category}
                onChange={handleCategoryChange}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.toLowerCase()} value={cat.toLowerCase()}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Active Filters */}
      {(search || (category && category !== 'all')) && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {search && (
            <Chip 
              label={`Search: ${search}`}
              onDelete={() => setSearch('')}
              color="primary"
              variant="outlined"
            />
          )}
          {category && category !== 'all' && (
            <Chip 
              label={`Category: ${category}`}
              onDelete={() => setCategory('all')}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
      </Typography>

      {/* Events Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : currentEvents.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No events found matching your criteria.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default ExplorePage;
