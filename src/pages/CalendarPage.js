import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  DateCalendar,
  PickersDay,
  LocalizationProvider,
  DayCalendarSkeleton
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

function CalendarPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [date, setDate] = useState(dayjs());
  const [view, setView] = useState('month'); // 'day', 'week', 'month'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Import Firestore functions
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        
        // Get events collection
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);
        
        // Transform events data
        const eventsData = eventsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            start: data.date ? dayjs(data.date + 'T' + (data.time || '00:00')) : dayjs(),
            end: data.date ? dayjs(data.date + 'T' + (data.endTime || data.time || '00:00')) : dayjs(),
            allDay: !data.time,
            location: data.location || '',
            description: data.description || '',
            color: getEventColor(data.category)
          };
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
    
    fetchEvents();
  }, []);
  
  // Get color based on event category
  const getEventColor = (category) => {
    const categoryColors = {
      'Music': theme.palette.primary.main,
      'Tech': theme.palette.secondary.main,
      'Food': theme.palette.warning.main,
      'Art': theme.palette.error.main,
      'Business': theme.palette.success.main,
      'Celebration': theme.palette.info.main
    };
    
    return categoryColors[category] || theme.palette.primary.main;
  };
  
  // Event data for the calendar
  const eventData = [
    {
      id: 1,
      title: 'Summer Music Festival',
      start: dayjs('2025-08-15T10:00'),
      end: dayjs('2025-08-17T22:00'),
      allDay: false,
      location: 'Central Park, New York',
      description: 'A three-day music festival featuring top artists from around the world.',
      color: theme.palette.primary.main
    },
    {
      id: 2,
      title: 'Tech Conference 2025',
      start: dayjs('2025-09-05T09:00'),
      end: dayjs('2025-09-07T18:00'),
      allDay: false,
      location: 'Convention Center, San Francisco',
      description: 'Join industry leaders and innovators for the biggest tech event of the year.',
      color: theme.palette.secondary.main
    },
    {
      id: 3,
      title: 'Food & Wine Festival',
      start: dayjs('2025-10-12T11:00'),
      end: dayjs('2025-10-14T20:00'),
      allDay: false,
      location: 'Downtown, Chicago',
      description: 'Taste exquisite dishes and fine wines from renowned chefs and wineries.',
      color: theme.palette.warning.main
    },
    {
      id: 4,
      title: 'Art Exhibition Opening',
      start: dayjs('2025-07-28T18:00'),
      end: dayjs('2025-07-28T21:00'),
      allDay: false,
      location: 'Modern Art Gallery, Los Angeles',
      description: 'Featuring works from emerging artists exploring themes of nature and technology.',
      color: theme.palette.error.main
    },
    {
      id: 5,
      title: 'Startup Networking Mixer',
      start: dayjs('2025-08-03T17:30'),
      end: dayjs('2025-08-03T20:00'),
      allDay: false,
      location: 'Innovation Hub, Austin',
      description: 'Connect with founders, investors, and industry experts in a casual setting.',
      color: theme.palette.success.main
    }
  ];

  // Get events for the current month
  const eventsInMonth = events.filter(event => {
    return event.start.month() === date.month() && event.start.year() === date.year();
  });

  // Upcoming events (sorted by date)
  const upcomingEvents = events
    .filter(event => event.start.isAfter(dayjs()))
    .sort((a, b) => a.start.diff(b.start))
    .slice(0, 5);

  // Handle date change
  const handleMonthChange = (newDate) => {
    setDate(newDate);
  };
  
  // Handle view change
  const handleViewChange = (newView) => {
    setView(newView);
  };
  
  // Navigate to previous month/week/day
  const handlePrevious = () => {
    if (view === 'month') {
      setDate(date.subtract(1, 'month'));
    } else if (view === 'week') {
      setDate(date.subtract(1, 'week'));
    } else {
      setDate(date.subtract(1, 'day'));
    }
  };
  
  // Navigate to next month/week/day
  const handleNext = () => {
    if (view === 'month') {
      setDate(date.add(1, 'month'));
    } else if (view === 'week') {
      setDate(date.add(1, 'week'));
    } else {
      setDate(date.add(1, 'day'));
    }
  };
  
  // Go to today
  const handleToday = () => {
    setDate(dayjs());
  };
  
  // Custom day renderer to show events
  const renderDay = (day, selectedDays, pickersDayProps) => {
    // Convert the MUI day object to a dayjs object for comparison
    const dayjsObj = dayjs(day.toString());
    
    // Check if there are events on this day
    const eventsOnDay = eventData.filter(event => {
      const eventStart = event.start;
      const eventEnd = event.end;
      
      return (
        dayjsObj.format('YYYY-MM-DD') === eventStart.format('YYYY-MM-DD') || 
        (dayjsObj.isAfter(eventStart, 'day') && dayjsObj.isBefore(eventEnd, 'day')) ||
        dayjsObj.format('YYYY-MM-DD') === eventEnd.format('YYYY-MM-DD')
      );
    });
    
    const hasEvents = eventsOnDay.length > 0;
    
    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={hasEvents ? eventsOnDay.length : 0}
        color="primary"
      >
        <PickersDay {...pickersDayProps} day={day} />
      </Badge>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography component="h1" variant="h3" color="text.primary" gutterBottom>
        Event Calendar
      </Typography>
      
      <Grid container spacing={4}>
        {/* Calendar */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '700px',
              overflow: 'hidden'
            }}
          >
            {/* Calendar Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {date.format('MMMM YYYY')}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ButtonGroup size="small" variant="outlined">
                  <Tooltip title="Day view">
                    <Button 
                      onClick={() => handleViewChange('day')}
                      variant={view === 'day' ? 'contained' : 'outlined'}
                    >
                      <ViewDayIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Week view">
                    <Button 
                      onClick={() => handleViewChange('week')}
                      variant={view === 'week' ? 'contained' : 'outlined'}
                    >
                      <ViewWeekIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Month view">
                    <Button 
                      onClick={() => handleViewChange('month')}
                      variant={view === 'month' ? 'contained' : 'outlined'}
                    >
                      <CalendarMonthIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
                
                <ButtonGroup size="small" variant="outlined">
                  <Tooltip title="Previous">
                    <IconButton onClick={handlePrevious} size="small">
                      <ChevronLeftIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Today">
                    <Button onClick={handleToday} size="small">
                      <TodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Today
                    </Button>
                  </Tooltip>
                  <Tooltip title="Next">
                    <IconButton onClick={handleNext} size="small">
                      <ChevronRightIcon />
                    </IconButton>
                  </Tooltip>
                </ButtonGroup>
              </Box>
            </Box>
            
            {/* Calendar */}
            <Box sx={{ height: 'calc(100% - 50px)', overflow: 'hidden' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar 
                  value={date}
                  onChange={handleMonthChange}
                  views={['day', 'month', 'year']}
                  showDaysOutsideCurrentMonth
                  displayWeekNumber
                  sx={{
                    width: '100%',
                    height: '100%',
                    '& .MuiPickersCalendarHeader-root': {
                      display: 'none', // Hide default header since we have our own
                    },
                    '& .MuiDayCalendar-header': {
                      justifyContent: 'space-around',
                    },
                    '& .MuiDayCalendar-weekContainer': {
                      justifyContent: 'space-around',
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
            
            {/* Event Details (if an event is selected) */}
            {selectedEvent && (
              <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h6">{selectedEvent.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedEvent.start.format('MMM D, YYYY • h:mm A')} - {selectedEvent.end.format('MMM D, YYYY • h:mm A')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Location:</strong> {selectedEvent.location}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {selectedEvent.description}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Upcoming Events */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '700px',
              overflow: 'auto'
            }}
          >
            <Typography variant="h5" gutterBottom>
              Upcoming Events
            </Typography>
            <Box sx={{ mt: 2 }}>
              {upcomingEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      mb: 2, 
                      borderLeft: '4px solid', 
                      borderLeftColor: event.color,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      }
                    }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {event.start.format('ddd, MMM D')}
                        {' • '}
                        {event.start.format('h:mm A')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.location}
                      </Typography>
                    </CardContent>
                  </Card>
                  {index < upcomingEvents.length - 1 && (
                    <Divider sx={{ mb: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CalendarPage;
