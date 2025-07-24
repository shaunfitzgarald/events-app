import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Tooltip,
  Alert,
  Snackbar,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LinkIcon from '@mui/icons-material/Link';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { QRCodeSVG } from 'qrcode.react';

// Mock data for social media accounts
const mockSocialAccounts = [
  { id: '1', platform: 'facebook', name: 'Tech Events', connected: true, icon: <FacebookIcon />, color: '#1877F2' },
  { id: '2', platform: 'twitter', name: '@techeventshub', connected: true, icon: <TwitterIcon />, color: '#1DA1F2' },
  { id: '3', platform: 'instagram', name: 'techeventshub', connected: false, icon: <InstagramIcon />, color: '#E4405F' },
  { id: '4', platform: 'linkedin', name: 'Tech Events Hub', connected: true, icon: <LinkedInIcon />, color: '#0A66C2' },
];

// Mock data for scheduled posts
const mockScheduledPosts = [
  { 
    id: '1', 
    platform: 'facebook', 
    content: 'Join us for the Summer Tech Conference 2023! Early bird tickets available now. #TechConf2023', 
    scheduledDate: '2023-07-15T10:00', 
    status: 'published',
    icon: <FacebookIcon />,
    color: '#1877F2'
  },
  { 
    id: '2', 
    platform: 'twitter', 
    content: 'Excited to announce our keynote speaker for #TechConf2023! @techguru will be sharing insights on AI trends.', 
    scheduledDate: '2023-07-20T14:30', 
    status: 'scheduled',
    icon: <TwitterIcon />,
    color: '#1DA1F2'
  },
  { 
    id: '3', 
    platform: 'linkedin', 
    content: 'Summer Tech Conference 2023 is just around the corner! Join industry leaders for a day of learning and networking.', 
    scheduledDate: '2023-07-25T09:00', 
    status: 'scheduled',
    icon: <LinkedInIcon />,
    color: '#0A66C2'
  },
];

function SocialMediaIntegration({ event }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [socialAccounts, setSocialAccounts] = useState(mockSocialAccounts);
  const [scheduledPosts, setScheduledPosts] = useState(mockScheduledPosts);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [postDate, setPostDate] = useState('');
  const [postTime, setPostTime] = useState('');
  
  // Event URL for sharing
  const eventUrl = `https://eventsapp.com/events/${event?.id || '123'}`;
  
  // Handle connect account
  const handleConnectAccount = (id) => {
    // In a real app, this would open OAuth flow
    const updatedAccounts = socialAccounts.map(account => 
      account.id === id ? { ...account, connected: !account.connected } : account
    );
    
    setSocialAccounts(updatedAccounts);
    
    // Show success message
    setSnackbarMessage(`Account ${updatedAccounts.find(a => a.id === id).connected ? 'connected' : 'disconnected'} successfully!`);
    setSnackbarOpen(true);
  };
  
  // Handle post dialog open
  const handlePostDialogOpen = () => {
    setOpenPostDialog(true);
    setSelectedPlatforms([]);
    setPostContent(`Check out ${event?.title || 'our event'}! ${eventUrl}`);
    
    // Set default date and time (tomorrow at 10 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    setPostDate(tomorrow.toISOString().split('T')[0]);
    setPostTime('10:00');
  };
  
  // Handle post dialog close
  const handlePostDialogClose = () => {
    setOpenPostDialog(false);
  };
  
  // Handle QR dialog open/close
  const handleQRDialogOpen = () => setOpenQRDialog(true);
  const handleQRDialogClose = () => setOpenQRDialog(false);
  
  // Handle platform selection
  const handlePlatformToggle = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };
  
  // Handle schedule post
  const handleSchedulePost = () => {
    // In a real app, this would send data to social media APIs
    const newPosts = selectedPlatforms.map(platform => {
      const account = socialAccounts.find(acc => acc.platform === platform);
      return {
        id: Date.now().toString() + platform,
        platform,
        content: postContent,
        scheduledDate: `${postDate}T${postTime}`,
        status: 'scheduled',
        icon: account.icon,
        color: account.color
      };
    });
    
    setScheduledPosts([...scheduledPosts, ...newPosts]);
    
    // Show success message
    setSnackbarMessage(`${newPosts.length} post(s) scheduled successfully!`);
    setSnackbarOpen(true);
    
    handlePostDialogClose();
  };
  
  // Handle delete post
  const handleDeletePost = (id) => {
    setScheduledPosts(scheduledPosts.filter(post => post.id !== id));
    
    // Show success message
    setSnackbarMessage('Post deleted successfully!');
    setSnackbarOpen(true);
  };
  
  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    
    // Show success message
    setSnackbarMessage('Event link copied to clipboard!');
    setSnackbarOpen(true);
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircleIcon fontSize="small" color="success" />;
      case 'scheduled':
        return <ScheduleIcon fontSize="small" color="primary" />;
      case 'failed':
        return <ErrorIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };
  
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Connected Accounts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Connected Accounts
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Connect your social media accounts to share and promote your event.
            </Typography>
            
            <List>
              {socialAccounts.map((account) => (
                <ListItem key={account.id} disablePadding sx={{ mb: 1 }}>
                  <Card sx={{ width: '100%', bgcolor: account.connected ? 'background.paper' : 'action.disabledBackground' }}>
                    <CardContent sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: account.color, mr: 2 }}>
                          {account.icon}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">
                            {account.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                          </Typography>
                        </Box>
                        <Button
                          variant={account.connected ? "outlined" : "contained"}
                          size="small"
                          onClick={() => handleConnectAccount(account.id)}
                        >
                          {account.connected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Add New Account
            </Button>
          </Paper>
        </Grid>
        
        {/* Sharing Options */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Share Your Event
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  value={eventUrl}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton onClick={handleCopyLink}>
                        <ContentCopyIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  fullWidth
                  onClick={handlePostDialogOpen}
                  disabled={!socialAccounts.some(account => account.connected)}
                >
                  Share on Social Media
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeIcon />}
                  fullWidth
                  onClick={handleQRDialogOpen}
                >
                  Generate QR Code
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Quick Share" />
                </Divider>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {socialAccounts.map((account) => (
                    <Tooltip key={account.id} title={`Share on ${account.platform}`}>
                      <span>
                        <IconButton
                          sx={{ 
                            color: 'white', 
                            bgcolor: account.color,
                            '&:hover': { bgcolor: account.color, opacity: 0.9 }
                          }}
                          disabled={!account.connected}
                        >
                          {account.icon}
                        </IconButton>
                      </span>
                    </Tooltip>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Scheduled Posts */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Scheduled Posts
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handlePostDialogOpen}
                disabled={!socialAccounts.some(account => account.connected)}
              >
                Schedule Post
              </Button>
            </Box>
            
            {scheduledPosts.length > 0 ? (
              <List>
                {scheduledPosts.map((post) => (
                  <Paper key={post.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: post.color, mr: 1 }}>
                        {post.icon}
                      </Avatar>
                      <Typography variant="subtitle2">
                        {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Chip
                        icon={getStatusIcon(post.status)}
                        label={post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        size="small"
                        color={post.status === 'published' ? 'success' : post.status === 'scheduled' ? 'primary' : 'error'}
                      />
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {post.content}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {post.status === 'published' 
                          ? 'Published on ' 
                          : 'Scheduled for '
                        }
                        {new Date(post.scheduledDate).toLocaleString()}
                      </Typography>
                      
                      <Box>
                        {post.status === 'scheduled' && (
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No posts scheduled yet.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handlePostDialogOpen}
                  sx={{ mt: 2 }}
                  disabled={!socialAccounts.some(account => account.connected)}
                >
                  Schedule Your First Post
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Schedule Post Dialog */}
      <Dialog open={openPostDialog} onClose={handlePostDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Schedule Social Media Post</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Select Platforms
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {socialAccounts.filter(account => account.connected).map((account) => (
                  <Chip
                    key={account.id}
                    icon={account.icon}
                    label={account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                    onClick={() => handlePlatformToggle(account.platform)}
                    color={selectedPlatforms.includes(account.platform) ? 'primary' : 'default'}
                    variant={selectedPlatforms.includes(account.platform) ? 'filled' : 'outlined'}
                    sx={{ 
                      '&.MuiChip-colorPrimary': { 
                        bgcolor: selectedPlatforms.includes(account.platform) ? account.color : 'inherit' 
                      } 
                    }}
                  />
                ))}
              </Box>
              
              {socialAccounts.filter(account => account.connected).length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  You don't have any connected social media accounts. Please connect at least one account to schedule posts.
                </Alert>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Post Content"
                multiline
                rows={4}
                fullWidth
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write your post content here..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={postDate}
                onChange={(e) => setPostDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={postTime}
                onChange={(e) => setPostTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePostDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSchedulePost} 
            variant="contained" 
            color="primary"
            disabled={selectedPlatforms.length === 0 || !postContent || !postDate || !postTime}
          >
            Schedule Post
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog open={openQRDialog} onClose={handleQRDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle>Event QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <QRCodeSVG 
              value={eventUrl} 
              size={200}
              level="H"
              includeMargin={true}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Scan this QR code to access the event page.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ mt: 2 }}
            >
              Download QR Code
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQRDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}

export default SocialMediaIntegration;
