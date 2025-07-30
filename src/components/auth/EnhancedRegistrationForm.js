import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Divider,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Visibility, VisibilityOff, CloudUpload } from '@mui/icons-material';
import { registerUser } from '../../services/userService';

const EnhancedRegistrationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [billingAddressSameAsProfile, setBillingAddressSameAsProfile] = useState(true);
  const [onlyAttendFreeEvents, setOnlyAttendFreeEvents] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    profilePicture: null,
    onlyAttendFreeEvents: false,
    paymentInfo: {
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
    }
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (for payment info)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle billing address checkbox
  const handleBillingAddressChange = (e) => {
    const checked = e.target.checked;
    setBillingAddressSameAsProfile(checked);
    
    setFormData({
      ...formData,
      paymentInfo: {
        ...formData.paymentInfo,
        billingAddressSameAsProfile: checked
      }
    });
  };
  
  // Handle free events only toggle
  const handleFreeEventsToggle = (e) => {
    const checked = e.target.checked;
    setOnlyAttendFreeEvents(checked);
    
    setFormData({
      ...formData,
      onlyAttendFreeEvents: checked
    });
  };

  // Handle billing address fields
  const handleBillingAddressFieldChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.replace('billing_', '');
    
    setFormData({
      ...formData,
      paymentInfo: {
        ...formData.paymentInfo,
        billingAddress: {
          ...formData.paymentInfo.billingAddress,
          [fieldName]: value
        }
      }
    });
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        profilePicture: e.target.files[0]
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Register the user
      await registerUser(formData);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (error) {
      setError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Create Your Account
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
            >
              Upload Profile Picture
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleProfilePictureChange}
              />
            </Button>
            {formData.profilePicture && (
              <Typography variant="caption">
                Selected: {formData.profilePicture.name}
              </Typography>
            )}
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Address Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Address Line 1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="State/Province"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="ZIP/Postal Code"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Event Preferences
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={onlyAttendFreeEvents}
                  onChange={handleFreeEventsToggle}
                  name="onlyAttendFreeEvents"
                  color="primary"
                />
              }
              label="I only want to attend free events"
            />
            {onlyAttendFreeEvents && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                You won't need to provide payment information for free events.
              </Typography>
            )}
          </Grid>
        </Grid>
        
        {!onlyAttendFreeEvents && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            
            <Grid container spacing={2}>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Card Type</InputLabel>
              <Select
                name="paymentInfo.cardType"
                value={formData.paymentInfo.cardType}
                onChange={handleChange}
                label="Card Type"
              >
                <MenuItem value="visa">Visa</MenuItem>
                <MenuItem value="mastercard">Mastercard</MenuItem>
                <MenuItem value="amex">American Express</MenuItem>
                <MenuItem value="discover">Discover</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Card Number"
              name="paymentInfo.cardNumber"
              value={formData.paymentInfo.cardNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Cardholder Name"
              name="paymentInfo.cardholderName"
              value={formData.paymentInfo.cardholderName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel>Expiry Month</InputLabel>
              <Select
                name="paymentInfo.expiryMonth"
                value={formData.paymentInfo.expiryMonth}
                onChange={handleChange}
                label="Expiry Month"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, '0');
                  return (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel>Expiry Year</InputLabel>
              <Select
                name="paymentInfo.expiryYear"
                value={formData.paymentInfo.expiryYear}
                onChange={handleChange}
                label="Expiry Year"
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = (new Date().getFullYear() + i).toString();
                  return (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              required
              fullWidth
              label="CVV"
              name="paymentInfo.cvv"
              value={formData.paymentInfo.cvv}
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
              label="Billing address is the same as profile address"
            />
          </Grid>
          
          {!billingAddressSameAsProfile && (
            <>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Billing Address Line 1"
                  name="billing_addressLine1"
                  value={formData.paymentInfo.billingAddress.addressLine1}
                  onChange={handleBillingAddressFieldChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Billing Address Line 2"
                  name="billing_addressLine2"
                  value={formData.paymentInfo.billingAddress.addressLine2}
                  onChange={handleBillingAddressFieldChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Billing City"
                  name="billing_city"
                  value={formData.paymentInfo.billingAddress.city}
                  onChange={handleBillingAddressFieldChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Billing State/Province"
                  name="billing_state"
                  value={formData.paymentInfo.billingAddress.state}
                  onChange={handleBillingAddressFieldChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Billing Country"
                  name="billing_country"
                  value={formData.paymentInfo.billingAddress.country}
                  onChange={handleBillingAddressFieldChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Billing ZIP/Postal Code"
                  name="billing_zip"
                  value={formData.paymentInfo.billingAddress.zip}
                  onChange={handleBillingAddressFieldChange}
                />
              </Grid>
            </>
          )}
        </Grid>
      </>
    )}
        
        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default EnhancedRegistrationForm;
