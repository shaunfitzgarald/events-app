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

// Import enhanced registration form
import EnhancedRegistrationForm from '../components/auth/EnhancedRegistrationForm';

function RegisterPage() {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState('email');
  const [useEnhancedForm, setUseEnhancedForm] = useState(true); // Default to enhanced form
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
      // Validate inputs
      if (!phoneNumber || !displayName) {
        throw new Error('Please fill in all required fields');
      }
      
      // Initialize phone auth
      await initPhoneAuth('recaptcha-container');
      
      // Send verification code
      await sendVerificationCode(phoneNumber);
      
      setCodeSent(true);
      setSuccess('Verification code sent to your phone');
    } catch (error) {
      console.error('Phone auth error:', error);
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
      // Validate inputs
      if (!verificationCode) {
        throw new Error('Please enter the verification code');
      }
      
      // Verify phone number with code
      await verifyPhoneNumber(verificationCode, { displayName });
      
      setSuccess('Registration successful! You are now logged in.');
      navigate('/events');
    } catch (error) {
      console.error('Phone verification error:', error);
      setError(error.message || 'Failed to verify phone number. Please try again.');
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
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        {useEnhancedForm ? (
          // Enhanced registration form with all user details
          <EnhancedRegistrationForm />
        ) : (
          // Original basic registration form
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Create an Account
            </Typography>
            
            <Tabs
              value={authMethod}
              onChange={handleTabChange}
              centered
              sx={{ mb: 3 }}
            >
              <Tab 
                icon={<EmailIcon />} 
                label="Email" 
                value="email" 
              />
              <Tab 
                icon={<PhoneIcon />} 
                label="Phone" 
                value="phone" 
              />
            </Tabs>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            
            {authMethod === 'email' ? (
              <form onSubmit={handleEmailRegister}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      type="email"
                      label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={toggleShowPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={toggleShowConfirmPassword}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                
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
              </form>
            ) : (
              <Box>
                {!codeSent ? (
                  <form onSubmit={handleSendVerificationCode}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Display Name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Phone Number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    
                    <div id="recaptcha-container" className="recaptcha"></div>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      sx={{ mt: 3, mb: 2 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePhoneRegister}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Verification Code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      sx={{ mt: 3, mb: 2 }}
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
                  </form>
                )}
              </Box>
            )}
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <MuiLink component={Link} to="/login" variant="body2">
                  Already have an account? Sign in
                </MuiLink>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default RegisterPage;
