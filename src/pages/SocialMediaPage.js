import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShareIcon from '@mui/icons-material/Share';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';

// Import components
import SocialMediaIntegration from '../components/social/SocialMediaIntegration';
import EventNavigation from '../components/events/EventNavigation';

// Mock event data
const mockEvent = {
  id: '123',
  title: 'Summer Tech Conference 2023',
  date: 'August 15, 2023',
  location: 'San Francisco Convention Center',
  description: 'Join us for a day of tech talks, networking, and innovation.'
};

// Mock analytics data
const mockAnalytics = {
  totalShares: 156,
  totalClicks: 423,
  totalImpressions: 2845,
  totalEngagements: 312,
  platforms: [
    { name: 'Facebook', shares: 68, clicks: 187, impressions: 1250, engagements: 145 },
    { name: 'Twitter', shares: 42, clicks: 103, impressions: 850, engagements: 87 },
    { name: 'LinkedIn', shares: 46, clicks: 133, impressions: 745, engagements: 80 }
  ]
};

function SocialMediaPage() {
  const theme = useTheme();
  const { eventId } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [tabValue, setTabValue] = useState(0);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Social Media Promotion
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {mockEvent.title} - {mockEvent.date}
      </Typography>
      
      {/* Event Navigation */}
      <EventNavigation eventId={eventId} currentTab={3} />
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="social media tabs"
        >
          <Tab icon={<ShareIcon />} label="Share & Schedule" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
          <Tab icon={<CampaignIcon />} label="Promotion" />
        </Tabs>
      </Paper>
      
      {/* Share & Schedule Tab */}
      {tabValue === 0 && (
        <SocialMediaIntegration event={mockEvent} />
      )}
      
      {/* Analytics Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Shares
                </Typography>
                <Typography variant="h3" color="primary">
                  {mockAnalytics.totalShares}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Clicks
                </Typography>
                <Typography variant="h3" color="secondary">
                  {mockAnalytics.totalClicks}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Impressions
                </Typography>
                <Typography variant="h3" color="info.main">
                  {mockAnalytics.totalImpressions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Engagements
                </Typography>
                <Typography variant="h3" color="success.main">
                  {mockAnalytics.totalEngagements}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Platform Analytics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Platform Performance
              </Typography>
              
              <List>
                {mockAnalytics.platforms.map((platform, index) => (
                  <React.Fragment key={platform.name}>
                    <ListItem>
                      <ListItemIcon>
                        {platform.name === 'Facebook' && <FacebookIcon color="primary" />}
                        {platform.name === 'Twitter' && <TwitterIcon color="info" />}
                        {platform.name === 'LinkedIn' && <LinkedInIcon color="primary" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={platform.name}
                        secondary={
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                            <Box>
                              <Typography variant="body2" component="span">
                                <ShareIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                {platform.shares} shares
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" component="span">
                                <TrendingUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                {platform.clicks} clicks
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" component="span">
                                <VisibilityIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                {platform.impressions} impressions
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" component="span">
                                <ThumbUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                {platform.engagements} engagements
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < mockAnalytics.platforms.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Engagement Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Engagement Over Time
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Engagement chart will be displayed here
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Promotion Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Promotion Strategies
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Influencer Marketing"
                    secondary="Partner with industry influencers to promote your event to their followers."
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CampaignIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Paid Advertising"
                    secondary="Run targeted ads on social media platforms to reach potential attendees."
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CommentIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Engage with Communities"
                    secondary="Join relevant online communities and share your event with interested groups."
                  />
                </ListItem>
              </List>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Create Promotion Campaign
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Promotion Tips
              </Typography>
              
              <Typography variant="body1" paragraph>
                Maximize your event's reach with these promotion strategies:
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Start Early"
                    secondary="Begin promoting your event at least 6-8 weeks in advance."
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText
                    primary="Use Hashtags"
                    secondary="Create a unique event hashtag and use relevant industry hashtags."
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText
                    primary="Share Updates"
                    secondary="Keep your audience engaged with regular updates about speakers, activities, etc."
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText
                    primary="Create Visual Content"
                    secondary="Use eye-catching graphics, videos, and images to promote your event."
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemText
                    primary="Leverage Email Marketing"
                    secondary="Send targeted email campaigns to your subscriber list."
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

// Import social media icons
const FacebookIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>;

const TwitterIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>;

const LinkedInIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>;

export default SocialMediaPage;
