import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  Grid,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Import FutureIntegrations component
import FutureIntegrations from '../components/integrations/FutureIntegrations';

function FutureIntegrationsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link color="inherit" href="/">
            Home
          </Link>
          <Link color="inherit" href="/settings">
            Settings
          </Link>
          <Typography color="text.primary">Integrations</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="h4" component="h1">
            Future Integrations
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CodeIcon />}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              API Documentation
            </Button>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Integration Settings
            </Button>
            <Button
              variant="outlined"
              startIcon={<HelpOutlineIcon />}
            >
              Help
            </Button>
          </Box>
        </Box>
        
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Enhance Your Events with AI and API Integrations
              </Typography>
              <Typography variant="body1">
                Explore our upcoming AI features and API integrations designed to make your event planning and management more efficient and engaging. These powerful tools will help you create better events, understand your attendees, and streamline your workflows.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Button 
                variant="contained" 
                color="secondary"
                size="large"
                sx={{ 
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Request Early Access
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      {/* Main Content */}
      <FutureIntegrations />
      
      {/* FAQ Section */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Frequently Asked Questions
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              How do I get started with integrations?
            </Typography>
            <Typography variant="body1" paragraph>
              To get started, you'll need to set up developer accounts with the relevant API providers and obtain API keys. Our documentation provides step-by-step guides for each integration.
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Are these integrations included in my subscription?
            </Typography>
            <Typography variant="body1" paragraph>
              Basic integrations are included in all paid plans. Advanced AI features may require additional subscription tiers. Check our pricing page for details.
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Can I request custom integrations?
            </Typography>
            <Typography variant="body1" paragraph>
              Yes! We're always open to suggestions for new integrations. Contact our support team to discuss your specific needs and requirements.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              How secure are these integrations?
            </Typography>
            <Typography variant="body1" paragraph>
              Security is our top priority. All API keys and sensitive data are encrypted and stored securely. We follow industry best practices for data protection and privacy.
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Will these integrations slow down my app?
            </Typography>
            <Typography variant="body1" paragraph>
              No, our integrations are designed to be lightweight and efficient. Most API calls happen in the background and won't affect your app's performance.
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              What if I need help implementing an integration?
            </Typography>
            <Typography variant="body1" paragraph>
              Our support team is here to help! We provide detailed documentation, code examples, and one-on-one support to ensure smooth implementation.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', mt: 6, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Ready to take your events to the next level?
        </Typography>
        <Typography variant="body1" paragraph>
          Join our developer community and be the first to access new integrations and features.
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary" size="large">
            Join Developer Program
          </Button>
          <Button variant="outlined" size="large">
            View API Documentation
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default FutureIntegrationsPage;
