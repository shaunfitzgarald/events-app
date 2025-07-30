import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

function Footer() {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              EventsHub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Making event planning simple, fun, and stress-free.
              Create memorable experiences with our intuitive event management platform.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="primary" aria-label="facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="primary" aria-label="twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="primary" aria-label="instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="primary" aria-label="linkedin">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/events" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Events
            </Link>
            <Link href="/calendar" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Calendar
            </Link>
            <Link href="/explore" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Explore
            </Link>
            <Link href="/ai-assistant" color="text.secondary" display="block" sx={{ mb: 1 }}>
              AI Assistant
            </Link>
            <Link href="/create-event" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Create Event
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Support & Legal
            </Typography>
            <Link href="/help" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Help Center
            </Link>
            <Link href="/contact" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Contact Us
            </Link>
            <Link href="/privacy" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Terms of Service
            </Link>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Made with '}
            <span role="img" aria-label="heart">❤️</span>
            {' by '}
            <Link color="inherit" href="https://github.com/shaunfitzgarald" target="_blank" rel="noopener">
              shaunfitzgarald
            </Link>
            {' © '}
            {new Date().getFullYear()}
            {' shaunfitzgarald.com. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
