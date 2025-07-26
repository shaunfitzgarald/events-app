import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { assignEventAdmin, removeEventAdmin } from '../../services/eventService';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

function EventAdminManagement({ event, onAdminChange }) {
  const { currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Check if current user is the event creator
  const isCreator = event && currentUser && event.createdBy === currentUser.uid;

  // Load admin users
  useEffect(() => {
    const loadAdmins = async () => {
      if (!event || !event.admins || event.admins.length === 0) {
        setAdmins([]);
        setLoading(false);
        return;
      }

      try {
        const adminUsers = [];
        
        // Fetch user data for each admin
        for (const adminId of event.admins) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('uid', '==', adminId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            adminUsers.push({
              id: adminId,
              name: userData.displayName || 'Unknown User',
              email: userData.email || '',
              photoURL: userData.photoURL || ''
            });
          } else {
            // If user not found, add placeholder
            adminUsers.push({
              id: adminId,
              name: 'Unknown User',
              email: '',
              photoURL: ''
            });
          }
        }
        
        setAdmins(adminUsers);
      } catch (err) {
        console.error('Error loading admins:', err);
        setError('Failed to load admin users');
      } finally {
        setLoading(false);
      }
    };
    
    loadAdmins();
  }, [event]);

  // Handle dialog open
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setEmail('');
    setSearchResult(null);
    setSearchError(null);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Search user by email
  const handleSearchUser = async () => {
    if (!email) {
      setSearchError('Please enter an email address');
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      // Search for user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSearchError('User not found');
      } else {
        const userData = querySnapshot.docs[0].data();
        
        // Check if user is already an admin
        if (event.admins && event.admins.includes(userData.uid)) {
          setSearchError('User is already an admin');
        } else if (event.createdBy === userData.uid) {
          setSearchError('User is the event creator');
        } else {
          setSearchResult({
            id: userData.uid,
            name: userData.displayName || 'Unknown User',
            email: userData.email,
            photoURL: userData.photoURL || ''
          });
        }
      }
    } catch (err) {
      console.error('Error searching user:', err);
      setSearchError('Failed to search for user');
    } finally {
      setSearching(false);
    }
  };

  // Add admin
  const handleAddAdmin = async () => {
    if (!searchResult) return;

    setAddingAdmin(true);
    try {
      await assignEventAdmin(event.id, searchResult.id);
      
      // Update local state
      setAdmins([...admins, searchResult]);
      
      // Notify parent component
      if (onAdminChange) {
        onAdminChange();
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error adding admin:', err);
      setSearchError('Failed to add admin');
    } finally {
      setAddingAdmin(false);
    }
  };

  // Remove admin
  const handleRemoveAdmin = async (adminId) => {
    try {
      await removeEventAdmin(event.id, adminId);
      
      // Update local state
      setAdmins(admins.filter(admin => admin.id !== adminId));
      
      // Notify parent component
      if (onAdminChange) {
        onAdminChange();
      }
    } catch (err) {
      console.error('Error removing admin:', err);
      setError('Failed to remove admin');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Event Administrators</Typography>
        {isCreator && (
          <Button
            startIcon={<PersonAddIcon />}
            variant="outlined"
            size="small"
            onClick={handleOpenDialog}
          >
            Add Admin
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {admins.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No additional administrators assigned.
        </Typography>
      ) : (
        <List>
          {admins.map((admin) => (
            <ListItem key={admin.id}>
              <ListItemAvatar>
                <Avatar src={admin.photoURL} alt={admin.name}>
                  {admin.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={admin.name}
                secondary={admin.email}
              />
              {isCreator && (
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => handleRemoveAdmin(admin.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Event Administrator</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Administrators can edit event details and manage event settings.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
            <TextField
              label="User Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="dense"
              variant="outlined"
              error={!!searchError}
              helperText={searchError}
            />
            <Button
              variant="contained"
              onClick={handleSearchUser}
              sx={{ ml: 1, mt: 1 }}
              disabled={searching || !email}
            >
              {searching ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Box>

          {searchResult && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">User Found:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Avatar src={searchResult.photoURL} alt={searchResult.name}>
                  {searchResult.name.charAt(0)}
                </Avatar>
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body1">{searchResult.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchResult.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddAdmin}
            variant="contained"
            color="primary"
            disabled={!searchResult || addingAdmin}
          >
            {addingAdmin ? <CircularProgress size={24} /> : 'Add as Admin'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EventAdminManagement;
