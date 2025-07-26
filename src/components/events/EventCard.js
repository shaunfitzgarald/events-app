import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  CardActions,
  Avatar,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import dayjs from 'dayjs';

function EventCard({ event }) {
  const navigate = useNavigate();
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      // Handle both timestamp objects and string dates
      if (dateStr && typeof dateStr === 'object' && dateStr.toDate) {
        // Handle Firestore timestamp
        return dayjs(dateStr.toDate()).format('MMM D, YYYY');
      } else {
        // Handle string date
        return dayjs(dateStr).format('MMM D, YYYY');
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date unavailable';
    }
  };
  
  // Handle click to view event details
  const handleViewEvent = () => {
    navigate(`/events/${event.id}`);
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={
          event.images && Array.isArray(event.images) && event.images.length > 0 && event.images[0]
            ? event.images[0]
            : event.image && typeof event.image === 'string' && event.image.startsWith('http')
              ? event.image
              : 'https://source.unsplash.com/random/800x400/?event'
        }
        alt={event.title}
        onError={(e) => {
          console.log('Image failed to load:', e.target.src);
          e.target.src = 'https://source.unsplash.com/random/800x400/?event';
        }}
      />
      
      {/* Event category chip */}
      {event.category && (
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <Chip 
            label={event.category} 
            color="primary" 
            size="small" 
            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: 'primary.main' }}
          />
        </Box>
      )}
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {event.title}
        </Typography>
        
        {/* Organizer */}
        {event.organizer && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              src={event.organizer.image} 
              alt={event.organizer.name} 
              sx={{ width: 24, height: 24, mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {event.organizer.name}
            </Typography>
          </Box>
        )}
        
        {/* Date and Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatDate(event.startDate || event.date)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {event.location}
          </Typography>
        </Box>
        
        {/* Attendees count */}
        {event.attendees && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {event.attendees.length}/{event.maxAttendees || '∞'}
            </Typography>
          </Box>
        )}
        
        {/* Short description */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {event.description?.substring(0, 100)}
          {event.description?.length > 100 ? '...' : ''}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <IconButton size="small">
          <FavoriteBorderIcon fontSize="small" />
        </IconButton>
        <Button size="small" color="primary" onClick={handleViewEvent}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default EventCard;
