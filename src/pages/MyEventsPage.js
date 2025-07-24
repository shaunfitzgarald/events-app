import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert,
  Divider,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EventCard from '../components/events/EventCard';
import AddIcon from '@mui/icons-material/Add';

function MyEventsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/login', { state: { from: '/my-events' } });
      return;
    }

    const fetchMyEvents = async () => {
      try {
        // Import Firestore functions
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        
        // Get events created by the current user
        const eventsRef = collection(db, 'events');
        let q;
        
        if (tabValue === 0) {
          // "My Events" tab - events created by the user
          q = query(eventsRef, where('createdBy', '==', currentUser.uid));
        } else {
          // "Attending" tab - events the user is attending
          q = query(eventsRef, where('attendees', 'array-contains', currentUser.uid));
        }
        
        const eventsSnapshot = await getDocs(q);
        
        // Transform events data
        const eventsData = eventsSnapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        
        console.log('Fetched events:', eventsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyEvents();
  }, [currentUser, navigate, tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Events
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
        >
          Create Event
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="event tabs">
          <Tab label="My Events" />
          <Tab label="Attending" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {tabValue === 0 ? 
              "You haven't created any events yet." : 
              "You're not attending any events yet."}
          </Typography>
          {tabValue === 0 && (
            <Button 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleCreateEvent}
            >
              Create Your First Event
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default MyEventsPage;
