import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia,
  Stack,
  Paper,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Link } from 'react-router-dom';

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Featured events data (mock)
  const featuredEvents = [
    {
      id: 1,
      title: 'Summer Music Festival',
      date: 'Aug 15-17, 2025',
      location: 'Central Park, New York',
      image: 'https://source.unsplash.com/random/400x200/?concert',
      category: 'Music'
    },
    {
      id: 2,
      title: 'Tech Conference 2025',
      date: 'Sep 5-7, 2025',
      location: 'Convention Center, San Francisco',
      image: 'https://source.unsplash.com/random/400x200/?conference',
      category: 'Technology'
    },
    {
      id: 3,
      title: 'Food & Wine Festival',
      date: 'Oct 12-14, 2025',
      location: 'Downtown, Chicago',
      image: 'https://source.unsplash.com/random/400x200/?food',
      category: 'Food & Drink'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: { xs: 6, md: 12 },
          pb: { xs: 8, md: 16 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            color="text.primary"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Plan Your Perfect Event
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}
          >
            Create, manage, and share events that bring people together.
            From intimate gatherings to large conferences, we've got you covered.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={Link}
              to="/create-event"
            >
              Create Event
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              component={Link}
              to="/explore"
            >
              Explore Events
            </Button>
          </Stack>
        </Container>
        
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            backgroundColor: 'primary.light',
            opacity: 0.1,
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            backgroundColor: 'secondary.light',
            opacity: 0.1,
            zIndex: 0,
          }}
        />
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Why Choose EventsHub?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
                backgroundColor: 'rgba(94, 96, 206, 0.05)',
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                RSVP Tracking
              </Typography>
              <Typography color="text.secondary">
                Easily manage your guest list, send invitations, and track RSVPs in real-time.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
                backgroundColor: 'rgba(72, 191, 227, 0.05)',
              }}
            >
              <PeopleIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Guest Communication
              </Typography>
              <Typography color="text.secondary">
                Keep your guests informed with updates, reminders, and important event details.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 4,
                backgroundColor: 'rgba(255, 158, 0, 0.05)',
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Budget Management
              </Typography>
              <Typography color="text.secondary">
                Track expenses, set budgets, and manage payments all in one place.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Events Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography component="h2" variant="h4" color="text.primary">
              Featured Events
            </Typography>
            <Button component={Link} to="/events" color="primary">
              View All
            </Button>
          </Box>
          <Grid container spacing={4}>
            {featuredEvents.map((event) => (
              <Grid item key={event.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.image}
                    alt={event.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {event.date} • {event.location}
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'inline-block', 
                        bgcolor: 'primary.light', 
                        color: 'white', 
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                        mt: 1
                      }}
                    >
                      {event.category}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            bgcolor: 'primary.main',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to create your next event?
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}>
            Join thousands of event organizers who trust EventsHub to create memorable experiences.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            component={Link}
            to="/register"
            sx={{ 
              px: 4, 
              py: 1.5, 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            Get Started for Free
          </Button>
          
          {/* Decorative circles */}
          <Box
            sx={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 150,
              height: 150,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        </Box>
      </Container>
    </>
  );
}

export default HomePage;
