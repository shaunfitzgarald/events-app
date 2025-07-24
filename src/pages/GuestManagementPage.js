import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Badge,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import CancelIcon from '@mui/icons-material/Cancel';

// Import components
import GuestCommunication from '../components/guests/GuestCommunication';
import EventNavigation from '../components/events/EventNavigation';

// Mock data for guests
const mockGuests = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', phone: '555-123-4567', status: 'attending', guests: 2, dietaryRestrictions: 'Vegetarian', notes: 'Allergic to nuts', avatar: 'https://source.unsplash.com/random/100x100/?person,1' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-987-6543', status: 'attending', guests: 1, dietaryRestrictions: 'None', notes: '', avatar: 'https://source.unsplash.com/random/100x100/?person,2' },
  { id: '3', name: 'Mike Johnson', email: 'mike.johnson@example.com', phone: '555-456-7890', status: 'maybe', guests: 0, dietaryRestrictions: 'Gluten-free', notes: 'Will confirm next week', avatar: 'https://source.unsplash.com/random/100x100/?person,3' },
  { id: '4', name: 'Sarah Williams', email: 'sarah.williams@example.com', phone: '555-789-0123', status: 'attending', guests: 3, dietaryRestrictions: 'None', notes: '', avatar: 'https://source.unsplash.com/random/100x100/?person,4' },
  { id: '5', name: 'David Brown', email: 'david.brown@example.com', phone: '555-321-6547', status: 'not-attending', guests: 0, dietaryRestrictions: 'None', notes: 'Out of town', avatar: 'https://source.unsplash.com/random/100x100/?person,5' },
  { id: '6', name: 'Emily Davis', email: 'emily.davis@example.com', phone: '555-654-3210', status: 'attending', guests: 0, dietaryRestrictions: 'Vegan', notes: '', avatar: 'https://source.unsplash.com/random/100x100/?person,6' },
  { id: '7', name: 'Alex Wilson', email: 'alex.wilson@example.com', phone: '555-987-1234', status: 'maybe', guests: 1, dietaryRestrictions: 'None', notes: 'Might be late', avatar: 'https://source.unsplash.com/random/100x100/?person,7' },
];

// Mock event data
const mockEvent = {
  id: '123',
  title: 'Summer Tech Conference 2023',
  date: 'August 15, 2023',
  location: 'San Francisco Convention Center',
  totalInvited: 50,
  attending: 25,
  maybe: 10,
  notAttending: 15
};

function GuestManagementPage() {
  const theme = useTheme();
  const { eventId } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  
  // Filtered guests based on status and search query
  const filteredGuests = mockGuests
    .filter(guest => filterStatus === 'all' || guest.status === filterStatus)
    .filter(guest => 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };
  
  // Handle guest menu open
  const handleGuestMenuOpen = (event, guest) => {
    setAnchorEl(event.currentTarget);
    setSelectedGuest(guest);
  };
  
  // Handle guest menu close
  const handleGuestMenuClose = () => {
    setAnchorEl(null);
    setSelectedGuest(null);
  };
  
  // Handle change guest status
  const handleChangeStatus = (status) => {
    // In a real app, this would update the guest status in Firebase
    console.log('Changing status for guest:', selectedGuest.id, 'to', status);
    handleGuestMenuClose();
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'attending':
        return <CheckCircleIcon fontSize="small" color="success" />;
      case 'maybe':
        return <HelpIcon fontSize="small" color="warning" />;
      case 'not-attending':
        return <CancelIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };
  
  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'attending':
        return 'Going';
      case 'maybe':
        return 'Maybe';
      case 'not-attending':
        return 'Not Going';
      default:
        return '';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Guest Management
      </Typography>
      
      {/* Event Navigation */}
      <EventNavigation eventId={eventId} currentTab={1} />
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {mockEvent.title} - {mockEvent.date}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Invited
              </Typography>
              <Typography variant="h3">
                {mockEvent.totalInvited}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="h6" gutterBottom>
                Attending
              </Typography>
              <Typography variant="h3">
                {mockEvent.attending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="h6" gutterBottom>
                Maybe
              </Typography>
              <Typography variant="h3">
                {mockEvent.maybe}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="h6" gutterBottom>
                Not Attending
              </Typography>
              <Typography variant="h3">
                {mockEvent.notAttending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="guest management tabs"
            >
              <Tab icon={<PeopleIcon />} label="Guest List" />
              <Tab icon={<EmailIcon />} label="Communication" />
            </Tabs>
          </Paper>
          
          {/* Guest List Tab */}
          {tabValue === 0 && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">
                  Guest List
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    placeholder="Search guests"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="filter-status-label">Status</InputLabel>
                    <Select
                      labelId="filter-status-label"
                      value={filterStatus}
                      onChange={handleFilterChange}
                      label="Status"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="attending">Going</MenuItem>
                      <MenuItem value="maybe">Maybe</MenuItem>
                      <MenuItem value="not-attending">Not Going</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                  >
                    Export
                  </Button>
                </Box>
              </Box>
              
              <List>
                {filteredGuests.map((guest) => (
                  <React.Fragment key={guest.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="more options"
                          onClick={(e) => handleGuestMenuOpen(e, guest)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={getStatusIcon(guest.status)}
                        >
                          <Avatar src={guest.avatar} alt={guest.name} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" component="span">
                              {guest.name}
                            </Typography>
                            {guest.guests > 0 && (
                              <Chip 
                                label={`+${guest.guests}`} 
                                size="small" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {guest.email} • {guest.phone}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {guest.dietaryRestrictions !== 'None' && (
                                <Chip 
                                  label={guest.dietaryRestrictions} 
                                  size="small" 
                                  sx={{ mr: 1, mt: 0.5 }}
                                />
                              )}
                              {guest.notes && (
                                <Typography variant="body2" color="text.secondary">
                                  Note: {guest.notes}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              
              {filteredGuests.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No guests found matching your criteria.
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
          
          {/* Communication Tab */}
          {tabValue === 1 && (
            <GuestCommunication eventId={eventId} />
          )}
        </Grid>
      </Grid>
      
      {/* Guest Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleGuestMenuClose}
      >
        <MenuItem onClick={() => handleChangeStatus('attending')}>
          <ListItemText primary="Mark as Going" />
        </MenuItem>
        <MenuItem onClick={() => handleChangeStatus('maybe')}>
          <ListItemText primary="Mark as Maybe" />
        </MenuItem>
        <MenuItem onClick={() => handleChangeStatus('not-attending')}>
          <ListItemText primary="Mark as Not Going" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleGuestMenuClose}>
          <ListItemText primary="Edit Details" />
        </MenuItem>
        <MenuItem onClick={handleGuestMenuClose}>
          <ListItemText primary="Remove Guest" />
        </MenuItem>
      </Menu>
    </Container>
  );
}

export default GuestManagementPage;
