import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Check, 
  Close, 
  Edit, 
  Delete, 
  QrCode, 
  VerifiedUser,
  Visibility
} from '@mui/icons-material';
import { 
  updateEventTicketSettings, 
  getEventTickets, 
  checkInTicket,
  cancelTicket
} from '../../services/ticketService';
import { getUserProfile } from '../../services/userService';

const TicketManager = ({ event, isEventOwner }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tickets, setTickets] = useState([]);
  const [ticketUsers, setTicketUsers] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [ticketSettings, setTicketSettings] = useState({
    enabled: event?.ticketsEnabled || false,
    available: event?.ticketsAvailable || 0,
    price: event?.ticketPrice || 0,
    currency: event?.ticketCurrency || 'USD',
    verificationRequired: event?.ticketVerificationRequired || false
  });

  // Fetch tickets for this event
  useEffect(() => {
    if (event?.id && isEventOwner) {
      fetchTickets();
    }
  }, [event?.id, isEventOwner]);

  // Fetch tickets and associated user data
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const ticketData = await getEventTickets(event.id);
      setTickets(ticketData);
      
      // Fetch user data for each ticket
      const userIds = [...new Set(ticketData.map(ticket => ticket.userId))];
      const userProfiles = {};
      
      for (const userId of userIds) {
        const profile = await getUserProfile(userId);
        if (profile) {
          userProfiles[userId] = profile;
        }
      }
      
      setTicketUsers(userProfiles);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // Handle ticket settings changes
  const handleSettingChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'enabled' || name === 'verificationRequired' ? checked : value;
    
    setTicketSettings({
      ...ticketSettings,
      [name]: newValue
    });
  };

  // Save ticket settings
  const saveTicketSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateEventTicketSettings(event.id, ticketSettings);
      setSuccess('Ticket settings updated successfully');
    } catch (error) {
      console.error('Error updating ticket settings:', error);
      setError('Failed to update ticket settings');
    } finally {
      setLoading(false);
    }
  };

  // Open verification dialog
  const handleVerifyTicket = (ticket) => {
    setSelectedTicket(ticket);
    setVerificationCode('');
    setVerificationDialogOpen(true);
  };

  // Check in a ticket
  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      await checkInTicket(
        selectedTicket.id, 
        selectedTicket.verificationCode ? verificationCode : null
      );
      
      setVerificationDialogOpen(false);
      setSuccess('Ticket checked in successfully');
      fetchTickets(); // Refresh ticket list
    } catch (error) {
      console.error('Error checking in ticket:', error);
      setError(error.message || 'Failed to check in ticket');
    } finally {
      setLoading(false);
    }
  };

  // Cancel a ticket
  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await cancelTicket(ticketId);
      setSuccess('Ticket cancelled successfully');
      fetchTickets(); // Refresh ticket list
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      setError('Failed to cancel ticket');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Render ticket status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip size="small" color="success" label="Active" />;
      case 'used':
        return <Chip size="small" color="default" label="Used" />;
      case 'cancelled':
        return <Chip size="small" color="error" label="Cancelled" />;
      case 'refunded':
        return <Chip size="small" color="warning" label="Refunded" />;
      default:
        return <Chip size="small" color="default" label={status} />;
    }
  };

  // If not event owner, show purchase button instead
  if (!isEventOwner) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tickets
        </Typography>
        
        {!event?.ticketsEnabled ? (
          <Typography>Tickets are not available for this event.</Typography>
        ) : (
          <Box>
            <Typography gutterBottom>
              Price: {event.ticketPrice} {event.ticketCurrency || 'USD'}
            </Typography>
            <Typography gutterBottom>
              Available: {event.ticketsAvailable || 0}
            </Typography>
            {event.ticketsAvailable > 0 ? (
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                href={`/events/${event.id}/purchase-ticket`}
              >
                Purchase Ticket
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                disabled
                sx={{ mt: 2 }}
              >
                Sold Out
              </Button>
            )}
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Ticket Management
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={ticketSettings.enabled}
              onChange={handleSettingChange}
              name="enabled"
            />
          }
          label="Enable ticket sales"
        />
      </Box>
      
      {ticketSettings.enabled && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Available Tickets"
              name="available"
              type="number"
              value={ticketSettings.available}
              onChange={handleSettingChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={ticketSettings.price}
              onChange={handleSettingChange}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                name="currency"
                value={ticketSettings.currency}
                onChange={handleSettingChange}
                label="Currency"
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="CAD">CAD</MenuItem>
                <MenuItem value="AUD">AUD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={ticketSettings.verificationRequired}
                  onChange={handleSettingChange}
                  name="verificationRequired"
                />
              }
              label="Require verification code for check-in (extra security)"
            />
          </Grid>
        </Grid>
      )}
      
      <Button
        variant="contained"
        color="primary"
        onClick={saveTicketSettings}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Save Settings'}
      </Button>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        Sold Tickets
      </Typography>
      
      {loading && <CircularProgress />}
      
      {tickets.length === 0 ? (
        <Typography>No tickets have been sold yet.</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ticket #</TableCell>
                <TableCell>Purchaser</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Checked In</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => {
                const user = ticketUsers[ticket.userId] || {};
                return (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.ticketNumber}</TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                      <br />
                      <Typography variant="caption">{user.email}</Typography>
                    </TableCell>
                    <TableCell>{formatDate(ticket.purchasedAt)}</TableCell>
                    <TableCell>{renderStatusChip(ticket.status)}</TableCell>
                    <TableCell>
                      {ticket.checkedIn ? (
                        <>
                          <Check color="success" />
                          <Typography variant="caption" display="block">
                            {formatDate(ticket.checkedInAt)}
                          </Typography>
                        </>
                      ) : (
                        <Close color="error" />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        disabled={ticket.checkedIn || ticket.status !== 'active'}
                        onClick={() => handleVerifyTicket(ticket)}
                      >
                        {ticket.verificationCode ? <VerifiedUser /> : <Check />}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={ticket.status !== 'active'}
                        onClick={() => handleCancelTicket(ticket.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onClose={() => setVerificationDialogOpen(false)}>
        <DialogTitle>Verify Ticket</DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <>
              <Typography gutterBottom>
                Ticket #: {selectedTicket.ticketNumber}
              </Typography>
              
              {selectedTicket.verificationCode && (
                <TextField
                  autoFocus
                  margin="dense"
                  label="Verification Code"
                  fullWidth
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  error={!!error}
                  helperText={error}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCheckIn} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Check In'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TicketManager;
