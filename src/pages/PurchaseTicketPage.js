import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import { ConfirmationNumber, Security, Payment } from '@mui/icons-material';
import { createEventTicket } from '../services/ticketService';
import { getUserProfile, updatePaymentInfo } from '../services/userService';
import { getEventById } from '../services/eventService';
import { auth } from '../services/firebase';

const PurchaseTicketPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [useVerification, setUseVerification] = useState(false);
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [billingAddressSameAsProfile, setBillingAddressSameAsProfile] = useState(true);
  
  // Payment form state
  const [paymentInfo, setPaymentInfo] = useState({
    cardType: '',
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddressSameAsProfile: true,
    billingAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      zip: ''
    }
  });

  // Load event and user data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if user is logged in
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate(`/login?redirect=/events/${eventId}/purchase-ticket`);
          return;
        }
        
        // Fetch event details
        const eventData = await getEventById(eventId);
        if (!eventData) {
          setError('Event not found');
          return;
        }
        
        // Check if tickets are available
        if (!eventData.ticketsEnabled) {
          setError('Tickets are not available for this event');
          return;
        }
        
        if (eventData.ticketsAvailable <= 0) {
          setError('This event is sold out');
          return;
        }
        
        setEvent(eventData);
        
        // Fetch user profile
        const userProfile = await getUserProfile(currentUser.uid);
        setUser(userProfile);
        
        // Pre-fill billing address if user has one
        if (userProfile) {
          setPaymentInfo(prev => ({
            ...prev,
            cardholderName: `${userProfile.firstName} ${userProfile.lastName}`,
            billingAddress: {
              addressLine1: userProfile.addressLine1 || '',
              addressLine2: userProfile.addressLine2 || '',
              city: userProfile.city || '',
              state: userProfile.state || '',
              country: userProfile.country || '',
              zip: userProfile.zip || ''
            }
          }));
          
          // If user has saved payment info, pre-fill it
          if (userProfile.paymentInfo) {
            setPaymentInfo(prev => ({
              ...prev,
              cardType: userProfile.paymentInfo.cardType || '',
              // Don't pre-fill card number for security reasons
              expiryMonth: userProfile.paymentInfo.expiryMonth || '',
              expiryYear: userProfile.paymentInfo.expiryYear || '',
              billingAddressSameAsProfile: userProfile.paymentInfo.billingAddressSameAsProfile
            }));
            
            setBillingAddressSameAsProfile(userProfile.paymentInfo.billingAddressSameAsProfile);
            
            if (!userProfile.paymentInfo.billingAddressSameAsProfile && userProfile.paymentInfo.billingAddress) {
              setPaymentInfo(prev => ({
                ...prev,
                billingAddress: {
                  ...userProfile.paymentInfo.billingAddress
                }
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load event information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (for billing address)
      const [parent, child] = name.split('.');
      setPaymentInfo({
        ...paymentInfo,
        [parent]: {
          ...paymentInfo[parent],
          [child]: value
        }
      });
    } else {
      setPaymentInfo({
        ...paymentInfo,
        [name]: value
      });
    }
  };

  // Handle billing address checkbox
  const handleBillingAddressChange = (e) => {
    const checked = e.target.checked;
    setBillingAddressSameAsProfile(checked);
    
    setPaymentInfo({
      ...paymentInfo,
      billingAddressSameAsProfile: checked
    });
  };

  // Purchase ticket
  const handlePurchaseTicket = async () => {
    setPurchasing(true);
    setError('');
    
    try {
      // Validate form
      if (!paymentInfo.cardType || !paymentInfo.cardNumber || !paymentInfo.cardholderName || 
          !paymentInfo.expiryMonth || !paymentInfo.expiryYear || !paymentInfo.cvv) {
        setError('Please fill in all payment details');
        setPurchasing(false);
        return;
      }
      
      // In a real app, you would process payment here
      // For now, we'll just create the ticket
      
      const ticket = await createEventTicket(
        eventId,
        auth.currentUser.uid,
        useVerification,
        event.ticketPrice || 0,
        {
          // In a real app, you would use a payment processor and not store full card details
          cardType: paymentInfo.cardType,
          lastFour: paymentInfo.cardNumber.slice(-4),
          timestamp: new Date()
        }
      );
      
      // Save payment info if requested
      if (savePaymentInfo) {
        await updatePaymentInfo(auth.currentUser.uid, paymentInfo);
      }
      
      // Navigate to ticket confirmation page
      navigate(`/tickets/${ticket.id}/confirmation`, { 
        state: { 
          ticket,
          event
        } 
      });
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      setError(error.message || 'Failed to purchase ticket');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => navigate(`/events/${eventId}`)}
        >
          Back to Event
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Purchase Ticket
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={
                event.images && Array.isArray(event.images) && event.images.length > 0
                  ? event.images[0]
                  : event.image || 'https://source.unsplash.com/random/800x400/?event'
              }
              alt={event.title}
            />
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {new Date(event.date).toLocaleDateString()} at {event.time}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.location}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Ticket Price:</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {event.ticketPrice} {event.ticketCurrency || 'USD'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Paper sx={{ p: 2, mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useVerification}
                  onChange={(e) => setUseVerification(e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Security sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>Add verification code for extra security</Typography>
                </Box>
              }
            />
            <Typography variant="caption" color="text.secondary">
              A unique verification code will be generated for your ticket, providing an additional layer of security.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
              Payment Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Card Type"
                  name="cardType"
                  value={paymentInfo.cardType}
                  onChange={handleChange}
                  SelectProps={{
                    native: true
                  }}
                >
                  <option value=""></option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                  <option value="discover">Discover</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Card Number"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Cardholder Name"
                  name="cardholderName"
                  value={paymentInfo.cardholderName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Expiry Month"
                  name="expiryMonth"
                  value={paymentInfo.expiryMonth}
                  onChange={handleChange}
                  SelectProps={{
                    native: true
                  }}
                >
                  <option value=""></option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    return (
                      <option key={month} value={month}>{month}</option>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Expiry Year"
                  name="expiryYear"
                  value={paymentInfo.expiryYear}
                  onChange={handleChange}
                  SelectProps={{
                    native: true
                  }}
                >
                  <option value=""></option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = (new Date().getFullYear() + i).toString();
                    return (
                      <option key={year} value={year}>{year}</option>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="CVV"
                  name="cvv"
                  value={paymentInfo.cvv}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={billingAddressSameAsProfile}
                      onChange={handleBillingAddressChange}
                    />
                  }
                  label="Billing address is the same as my profile address"
                />
              </Grid>
              
              {!billingAddressSameAsProfile && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Address Line 1"
                      name="billingAddress.addressLine1"
                      value={paymentInfo.billingAddress.addressLine1}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address Line 2"
                      name="billingAddress.addressLine2"
                      value={paymentInfo.billingAddress.addressLine2}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      label="City"
                      name="billingAddress.city"
                      value={paymentInfo.billingAddress.city}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      label="State/Province"
                      name="billingAddress.state"
                      value={paymentInfo.billingAddress.state}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      label="Country"
                      name="billingAddress.country"
                      value={paymentInfo.billingAddress.country}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      label="ZIP/Postal Code"
                      name="billingAddress.zip"
                      value={paymentInfo.billingAddress.zip}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={savePaymentInfo}
                      onChange={(e) => setSavePaymentInfo(e.target.checked)}
                    />
                  }
                  label="Save payment information for future purchases"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/events/${eventId}`)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePurchaseTicket}
                disabled={purchasing}
                startIcon={<ConfirmationNumber />}
              >
                {purchasing ? <CircularProgress size={24} /> : 'Purchase Ticket'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PurchaseTicketPage;
