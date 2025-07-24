import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  linkEmailToPhoneAccount,
  linkPhoneToEmailAccount,
  initPhoneAuth,
  sendVerificationCode,
  verifyPhoneNumber,
  logout,
  onAuthStateChanged
} from '../services/authService';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Dialog states
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openPhoneDialog, setOpenPhoneDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  
  // Fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        try {
          const userProfile = await getUserProfile(user.uid);
          setProfile(userProfile);
          
          // Set initial form values
          setDisplayName(user.displayName || '');
          setEmail(user.email || '');
          setPhoneNumber(user.phoneNumber || '');
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('Failed to load user profile');
        } finally {
          setLoading(false);
        }
      } else {
        // Not logged in, redirect to login
        navigate('/login');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('You must be logged in to update your profile');
      
      await updateUserProfile(currentUser.uid, {
        displayName
      });
      
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!newEmail || !emailPassword) {
        throw new Error('Please enter both email and password');
      }
      
      await updateUserEmail(newEmail, emailPassword);
      setEmail(newEmail);
      setSuccess('Email updated successfully');
      setOpenEmailDialog(false);
      setNewEmail('');
      setEmailPassword('');
    } catch (error) {
      console.error('Error updating email:', error);
      setError(error.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('Please fill in all password fields');
      }
      
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      await updateUserPassword(currentPassword, newPassword);
      setSuccess('Password updated successfully');
      setOpenPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!newPhoneNumber) {
        throw new Error('Please enter your phone number');
      }
      
      // Format phone number if needed
      const formattedPhoneNumber = newPhoneNumber.startsWith('+') 
        ? newPhoneNumber 
        : `+1${newPhoneNumber}`; // Default to US country code
      
      // Initialize reCAPTCHA verifier
      const recaptchaVerifier = initPhoneAuth('recaptcha-container');
      
      // Send verification code
      await linkPhoneToEmailAccount(formattedPhoneNumber, recaptchaVerifier);
      
      setCodeSent(true);
      setSuccess('Verification code sent to your phone!');
    } catch (error) {
      console.error('Phone verification error:', error);
      setError(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!verificationCode) {
        throw new Error('Please enter the verification code');
      }
      
      await verifyPhoneNumber(verificationCode, true);
      
      setPhoneNumber(newPhoneNumber);
      setSuccess('Phone number added successfully');
      setOpenPhoneDialog(false);
      setCodeSent(false);
      setVerificationCode('');
      setNewPhoneNumber('');
      
      // Refresh user data
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      setError(error.message || 'Failed to verify phone number');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLinkEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!newEmail || !emailPassword) {
        throw new Error('Please enter both email and password');
      }
      
      if (emailPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      await linkEmailToPhoneAccount(newEmail, emailPassword);
      
      setEmail(newEmail);
      setSuccess('Email added successfully');
      setOpenEmailDialog(false);
      setNewEmail('');
      setEmailPassword('');
      
      // Refresh user data
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Email linking error:', error);
      setError(error.message || 'Failed to add email');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out');
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
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
        
        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ width: 80, height: 80, mr: 2 }}
                  src={user?.photoURL}
                >
                  {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{displayName || 'User'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {profile?.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box component="form" onSubmit={handleUpdateProfile}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="displayName"
                  label="Display Name"
                  name="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Authentication Methods */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Authentication Methods
              </Typography>
              
              <List>
                {/* Email */}
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={email || 'No email linked'} 
                  />
                  <ListItemSecondaryAction>
                    {email ? (
                      <Button 
                        size="small" 
                        onClick={() => setOpenEmailDialog(true)}
                      >
                        Change
                      </Button>
                    ) : (
                      <IconButton 
                        edge="end" 
                        onClick={() => setOpenEmailDialog(true)}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                
                {/* Phone */}
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={phoneNumber || 'No phone linked'} 
                  />
                  <ListItemSecondaryAction>
                    {phoneNumber ? (
                      <Button 
                        size="small" 
                        onClick={() => setOpenPhoneDialog(true)}
                      >
                        Change
                      </Button>
                    ) : (
                      <IconButton 
                        edge="end" 
                        onClick={() => setOpenPhoneDialog(true)}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                
                {/* Password */}
                <ListItem>
                  <ListItemIcon>
                    <LockIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Password" 
                    secondary={email ? "••••••••" : "No password set"} 
                  />
                  <ListItemSecondaryAction>
                    {email && (
                      <Button 
                        size="small" 
                        onClick={() => setOpenPasswordDialog(true)}
                      >
                        Change
                      </Button>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleLogout}
                sx={{ mt: 2 }}
              >
                Logout
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Email Dialog */}
      <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)}>
        <DialogTitle>
          {email ? 'Change Email Address' : 'Add Email Address'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={email ? handleUpdateEmail : handleLinkEmail}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="newEmail"
              label="New Email Address"
              name="newEmail"
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={email ? "Current Password" : "Create Password"}
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete={email ? "current-password" : "new-password"}
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmailDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={email ? handleUpdateEmail : handleLinkEmail} 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Phone Dialog */}
      <Dialog open={openPhoneDialog} onClose={() => {
        setOpenPhoneDialog(false);
        setCodeSent(false);
      }}>
        <DialogTitle>
          {phoneNumber ? 'Change Phone Number' : 'Add Phone Number'}
        </DialogTitle>
        <DialogContent>
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
          
          {!codeSent ? (
            <Box component="form" onSubmit={handleSendVerificationCode}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="newPhoneNumber"
                label="Phone Number"
                name="newPhoneNumber"
                autoComplete="tel"
                placeholder="+1 (555) 555-5555"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                disabled={loading}
              />
              <div id="recaptcha-container" className="recaptcha"></div>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleVerifyPhone}>
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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              if (codeSent) {
                setCodeSent(false);
              } else {
                setOpenPhoneDialog(false);
              }
            }} 
            disabled={loading}
          >
            {codeSent ? 'Back' : 'Cancel'}
          </Button>
          <Button 
            onClick={codeSent ? handleVerifyPhone : handleSendVerificationCode} 
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : codeSent ? (
              'Verify'
            ) : (
              'Send Code'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleUpdatePassword}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="Current Password"
              type={showPassword ? "text" : "password"}
              id="currentPassword"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
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
              name="newPassword"
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowNewPassword}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
              label="Confirm New Password"
              type={showNewPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePassword} 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProfilePage;
