import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Divider,
  Link as MuiLink,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { 
  registerWithEmail, 
  initPhoneAuth, 
  sendVerificationCode, 
  verifyPhoneNumber,
  onAuthStateChanged
} from '../services/authService';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function RegisterPage() {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        navigate('/events');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setAuthMethod(newValue);
    setError('');
    setSuccess('');
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate inputs
      if (!email || !password || !confirmPassword || !displayName) {
        throw new Error('Please fill in all required fields');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Register with email and password
      await registerWithEmail(email, password, { displayName });
      
      setSuccess('Registration successful! You are now logged in.');
      navigate('/events');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!phoneNumber) {
        throw new Error('Please enter your phone number');
      }
      
      if (!displayName) {
        throw new Error('Please enter your name');
      }
      
      // Format phone number if needed
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber}`; // Default to US country code
      
      // Initialize reCAPTCHA verifier
      const recaptchaVerifier = initPhoneAuth('recaptcha-container');
      
      // Send verification code
      await sendVerificationCode(formattedPhoneNumber, recaptchaVerifier);
      
      setCodeSent(true);
      setSuccess('Verification code sent to your phone!');
    } catch (error) {
      console.error('Phone verification error:', error);
      setError(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!verificationCode) {
        throw new Error('Please enter the verification code');
      }
      
      // Register with phone number
      await verifyPhoneNumber(verificationCode, false, { displayName });
      
      setSuccess('Registration successful! You are now logged in.');
      navigate('/events');
    } catch (error) {
      console.error('Phone registration error:', error);
      setError(error.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Create an Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Tabs
            value={authMethod}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 3 }}
          >
            <Tab 
              value="email" 
              label="Email" 
              icon={<EmailIcon />} 
              iconPosition="start"
            />
            <Tab 
              value="phone" 
              label="Phone" 
              icon={<PhoneIcon />} 
              iconPosition="start"
            />
          </Tabs>
          
          {authMethod === 'email' ? (
            <Box component="form" onSubmit={handleEmailRegister}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="displayName"
                label="Full Name"
                name="displayName"
                autoComplete="name"
                autoFocus
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <MuiLink component={Link} to="/login" variant="body2">
                    Already have an account? Sign in
                  </MuiLink>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              {!codeSent ? (
                <Box component="form" onSubmit={handleSendVerificationCode}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="displayName"
                    label="Full Name"
                    name="displayName"
                    autoComplete="name"
                    autoFocus
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={loading}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    autoComplete="tel"
                    placeholder="+1 (555) 555-5555"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                  <div id="recaptcha-container" className="recaptcha"></div>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={handlePhoneRegister}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="verificationCode"
                    label="Verification Code"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Verify & Register'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setCodeSent(false)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                </Box>
              )}
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <MuiLink component={Link} to="/login" variant="body2">
                    Already have an account? Sign in
                  </MuiLink>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default RegisterPage;
