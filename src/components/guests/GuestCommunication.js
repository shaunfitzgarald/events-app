import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TemplateIcon from '@mui/icons-material/Description';
import FilterListIcon from '@mui/icons-material/FilterList';

// Mock data for guests
const mockGuests = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', phone: '555-123-4567', status: 'attending', avatar: 'https://source.unsplash.com/random/100x100/?person,1' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-987-6543', status: 'attending', avatar: 'https://source.unsplash.com/random/100x100/?person,2' },
  { id: '3', name: 'Mike Johnson', email: 'mike.johnson@example.com', phone: '555-456-7890', status: 'maybe', avatar: 'https://source.unsplash.com/random/100x100/?person,3' },
  { id: '4', name: 'Sarah Williams', email: 'sarah.williams@example.com', phone: '555-789-0123', status: 'attending', avatar: 'https://source.unsplash.com/random/100x100/?person,4' },
  { id: '5', name: 'David Brown', email: 'david.brown@example.com', phone: '555-321-6547', status: 'not-attending', avatar: 'https://source.unsplash.com/random/100x100/?person,5' },
  { id: '6', name: 'Emily Davis', email: 'emily.davis@example.com', phone: '555-654-3210', status: 'attending', avatar: 'https://source.unsplash.com/random/100x100/?person,6' },
  { id: '7', name: 'Alex Wilson', email: 'alex.wilson@example.com', phone: '555-987-1234', status: 'maybe', avatar: 'https://source.unsplash.com/random/100x100/?person,7' },
];

// Message templates
const messageTemplates = [
  { id: '1', title: 'Event Reminder', content: 'Hi {name}, just a reminder that our event is coming up on {date}. Looking forward to seeing you there!' },
  { id: '2', title: 'Thank You', content: 'Hi {name}, thank you for attending our event! We hope you had a great time.' },
  { id: '3', title: 'Event Update', content: 'Hi {name}, there has been an update to our event. Please check the details on the event page.' },
  { id: '4', title: 'RSVP Confirmation', content: 'Hi {name}, this is to confirm that we have received your RSVP for our event on {date}.' },
];

function GuestCommunication({ eventId }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [messageType, setMessageType] = useState('email');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Filtered guests based on status
  const filteredGuests = filterStatus === 'all' 
    ? mockGuests 
    : mockGuests.filter(guest => guest.status === filterStatus);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle guest selection
  const handleSelectGuest = (guestId) => {
    if (selectedGuests.includes(guestId)) {
      setSelectedGuests(selectedGuests.filter(id => id !== guestId));
    } else {
      setSelectedGuests([...selectedGuests, guestId]);
    }
  };
  
  // Handle select all guests
  const handleSelectAllGuests = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map(guest => guest.id));
    }
  };
  
  // Handle message type change
  const handleMessageTypeChange = (event) => {
    setMessageType(event.target.value);
  };
  
  // Handle template selection
  const handleSelectTemplate = (template) => {
    setMessageSubject(template.title);
    setMessageContent(template.content);
    setOpenTemplateDialog(false);
  };
  
  // Handle send message
  const handleSendMessage = () => {
    // In a real app, this would send the message via Firebase
    console.log('Sending message:', {
      type: messageType,
      subject: messageSubject,
      content: messageContent,
      recipients: selectedGuests.map(id => mockGuests.find(guest => guest.id === id))
    });
    
    // Show success message
    setSnackbarMessage(`Message sent to ${selectedGuests.length} guests!`);
    setSnackbarOpen(true);
    
    // Reset form
    setMessageSubject('');
    setMessageContent('');
    setSelectedGuests([]);
  };
  
  // Handle invite guest
  const handleInviteGuest = () => {
    // In a real app, this would send an invitation via Firebase
    console.log('Inviting guest:', inviteEmail);
    
    // Show success message
    setSnackbarMessage(`Invitation sent to ${inviteEmail}!`);
    setSnackbarOpen(true);
    
    // Reset form and close dialog
    setInviteEmail('');
    setOpenInviteDialog(false);
  };
  
  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setSelectedGuests([]);
  };
  
  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="guest communication tabs"
        >
          <Tab icon={<EmailIcon />} label="Messages" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<PersonAddIcon />} label="Invitations" />
        </Tabs>
      </Paper>
      
      {/* Messages Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: { xs: 2, md: 0 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Guests
                </Typography>
                <Box>
                  <Button
                    size="small"
                    startIcon={<FilterListIcon />}
                    onClick={(e) => e.currentTarget}
                  >
                    Filter
                  </Button>
                  <FormControl variant="standard" sx={{ ml: 1, minWidth: 120 }}>
                    <Select
                      value={filterStatus}
                      onChange={handleFilterChange}
                      displayEmpty
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="attending">Attending</MenuItem>
                      <MenuItem value="maybe">Maybe</MenuItem>
                      <MenuItem value="not-attending">Not Attending</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              <Button
                size="small"
                onClick={handleSelectAllGuests}
                sx={{ mb: 2 }}
              >
                {selectedGuests.length === filteredGuests.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                {filteredGuests.map((guest) => (
                  <ListItem
                    key={guest.id}
                    secondaryAction={
                      <Chip 
                        label={guest.status === 'attending' ? 'Going' : guest.status === 'maybe' ? 'Maybe' : 'Declined'} 
                        color={guest.status === 'attending' ? 'success' : guest.status === 'maybe' ? 'warning' : 'error'}
                        size="small"
                      />
                    }
                    sx={{
                      bgcolor: selectedGuests.includes(guest.id) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSelectGuest(guest.id)}
                  >
                    <ListItemAvatar>
                      <Avatar src={guest.avatar} alt={guest.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={guest.name}
                      secondary={guest.email}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Compose Message
                </Typography>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="message-type-label">Type</InputLabel>
                  <Select
                    labelId="message-type-label"
                    value={messageType}
                    onChange={handleMessageTypeChange}
                    label="Type"
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              {selectedGuests.length > 0 ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    To: {selectedGuests.length} guests selected
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedGuests.map(id => {
                      const guest = mockGuests.find(g => g.id === id);
                      return (
                        <Chip
                          key={id}
                          label={guest.name}
                          size="small"
                          onDelete={() => handleSelectGuest(id)}
                        />
                      );
                    })}
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Select guests from the list to send a message.
                </Alert>
              )}
              
              {messageType === 'email' && (
                <TextField
                  label="Subject"
                  fullWidth
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  sx={{ mb: 2 }}
                />
              )}
              
              <TextField
                label="Message"
                multiline
                rows={6}
                fullWidth
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Button
                    startIcon={<TemplateIcon />}
                    onClick={() => setOpenTemplateDialog(true)}
                    sx={{ mr: 1 }}
                  >
                    Templates
                  </Button>
                  <Button
                    startIcon={<AttachFileIcon />}
                    disabled={messageType !== 'email'}
                  >
                    Attach
                  </Button>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  disabled={selectedGuests.length === 0 || !messageContent}
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Notifications Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Event Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure automatic notifications for your event.
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText
                primary="Event Reminder"
                secondary="Send a reminder to all attendees 24 hours before the event"
              />
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <Select
                  defaultValue="enabled"
                >
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="RSVP Confirmation"
                secondary="Send a confirmation email when someone RSVPs to your event"
              />
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <Select
                  defaultValue="enabled"
                >
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Event Updates"
                secondary="Notify attendees when event details change"
              />
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <Select
                  defaultValue="enabled"
                >
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Post-Event Thank You"
                secondary="Send a thank you message after the event"
              />
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <Select
                  defaultValue="disabled"
                >
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          </List>
          
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" color="primary">
              Save Settings
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Invitations Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Invite Guests
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Send invitations to potential guests for your event.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenInviteDialog(true)}
            >
              Invite by Email
            </Button>
            <Button
              variant="outlined"
              color="primary"
            >
              Share Invitation Link
            </Button>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Recent Invitations
          </Typography>
          <List>
            <ListItem
              secondaryAction={
                <Chip label="Pending" color="warning" size="small" />
              }
            >
              <ListItemText
                primary="mark.taylor@example.com"
                secondary="Sent 2 days ago"
              />
            </ListItem>
            <Divider />
            <ListItem
              secondaryAction={
                <Chip label="Accepted" color="success" size="small" />
              }
            >
              <ListItemText
                primary="lisa.johnson@example.com"
                secondary="Sent 3 days ago"
              />
            </ListItem>
            <Divider />
            <ListItem
              secondaryAction={
                <Chip label="Declined" color="error" size="small" />
              }
            >
              <ListItemText
                primary="robert.smith@example.com"
                secondary="Sent 3 days ago"
              />
            </ListItem>
          </List>
        </Paper>
      )}
      
      {/* Template Dialog */}
      <Dialog
        open={openTemplateDialog}
        onClose={() => setOpenTemplateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Message Templates</DialogTitle>
        <DialogContent>
          <List>
            {messageTemplates.map((template) => (
              <React.Fragment key={template.id}>
                <ListItem
                  button
                  onClick={() => handleSelectTemplate(template)}
                >
                  <ListItemText
                    primary={template.title}
                    secondary={template.content}
                  />
                </ListItem>
                {template.id !== messageTemplates[messageTemplates.length - 1].id && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Invite Dialog */}
      <Dialog
        open={openInviteDialog}
        onClose={() => setOpenInviteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite Guest</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the email address of the person you'd like to invite to your event.
          </DialogContentText>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInviteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleInviteGuest} 
            variant="contained" 
            color="primary"
            disabled={!inviteEmail}
          >
            Send Invitation
          </Button>
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

export default GuestCommunication;
