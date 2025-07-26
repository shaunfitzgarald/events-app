import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  Divider,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import AddIcon from '@mui/icons-material/Add';

// Import components
import BudgetManager from '../components/budget/BudgetManager';
import EventNavigation from '../components/events/EventNavigation';



function BudgetManagementPage() {
  const theme = useTheme();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueSources, setRevenueSources] = useState([]);
  const [openRevenueDialog, setOpenRevenueDialog] = useState(false);
  const [newRevenue, setNewRevenue] = useState({
    name: '',
    amount: '',
    received: false,
    date: new Date().toISOString().split('T')[0]
  });
  
  // Fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId || !currentUser) return;
      
      try {
        setLoading(true);
        
        // Import Firestore functions
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../services/firebase');
        
        // Get event document
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);
        
        if (eventSnap.exists()) {
          const eventData = { id: eventSnap.id, ...eventSnap.data() };
          
          // Check if current user is the creator or an admin
          if (eventData.createdBy !== currentUser.uid && 
              (!eventData.admins || !eventData.admins.includes(currentUser.uid))) {
            setError('You do not have permission to manage this event\'s budget');
            setEvent(null);
          } else {
            setEvent(eventData);
            
            // Get revenue sources
            const revenueData = eventData.revenue || [];
            setRevenueSources(revenueData);
            
            setError(null);
          }
        } else {
          setError('Event not found');
          setEvent(null);
        }
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId, currentUser]);
  
  // Calculate totals
  const totalRevenue = revenueSources.reduce((sum, source) => sum + parseFloat(source.amount || 0), 0);
  const receivedRevenue = revenueSources.filter(source => source.received).reduce((sum, source) => sum + parseFloat(source.amount || 0), 0);
  const pendingRevenue = totalRevenue - receivedRevenue;
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Save revenue data to Firestore
  const saveRevenueData = async (updatedSources) => {
    try {
      // Import Firestore functions
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../services/firebase');
      
      // Update event document
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        revenue: updatedSources
      });
      
      return true;
    } catch (err) {
      console.error('Error saving revenue data:', err);
      setError('Failed to save revenue data');
      return false;
    }
  };
  
  // Handle revenue dialog open
  const handleRevenueDialogOpen = () => {
    setOpenRevenueDialog(true);
  };
  
  // Handle revenue dialog close
  const handleRevenueDialogClose = () => {
    setOpenRevenueDialog(false);
    setNewRevenue({
      name: '',
      amount: '',
      received: false,
      date: new Date().toISOString().split('T')[0]
    });
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRevenue({
      ...newRevenue,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Add revenue source
  const handleAddRevenue = async () => {
    // Validate inputs
    if (!newRevenue.name || !newRevenue.amount) {
      return;
    }
    
    const revenue = {
      ...newRevenue,
      id: Date.now().toString(),
      amount: parseFloat(newRevenue.amount)
    };
    
    const updatedSources = [...revenueSources, revenue];
    setRevenueSources(updatedSources);
    
    // Save to Firestore
    await saveRevenueData(updatedSources);
    
    handleRevenueDialogClose();
  };
  
  // Delete revenue source
  const handleDeleteRevenue = async (id) => {
    const updatedSources = revenueSources.filter(source => source.id !== id);
    setRevenueSources(updatedSources);
    
    // Save to Firestore
    await saveRevenueData(updatedSources);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Budget Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {event?.title || 'Loading...'} - {event?.startDate ? new Date(event.startDate.seconds * 1000).toLocaleDateString() : 'Date TBD'}
      </Typography>
      
      {/* Event Navigation */}
      <EventNavigation eventId={eventId} currentTab={2} />
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button startIcon={<PrintIcon />} variant="outlined">
          Print Budget Report
        </Button>
        <Button startIcon={<DownloadIcon />} variant="outlined">
          Export as CSV
        </Button>
        <Button startIcon={<ShareIcon />} variant="outlined">
          Share
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="budget management tabs"
        >
          <Tab icon={<AttachMoneyIcon />} label="Expenses" />
          <Tab icon={<ReceiptIcon />} label="Revenue" />
          <Tab icon={<AccountBalanceIcon />} label="Summary" />
        </Tabs>
      </Paper>
      
      {/* Budget manager */}
      {tabValue === 0 && (
        <BudgetManager eventId={eventId} event={event} />
      )}
      
      {/* Revenue Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Revenue Stats */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" color="primary">
                      ${totalRevenue.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} md={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Received
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      ${receivedRevenue.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} md={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      ${pendingRevenue.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Revenue Sources */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Revenue Sources
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleRevenueDialogOpen}
                >
                  Add Revenue
                </Button>
              </Box>
              
              <List>
                {revenueSources.map((source) => (
                  <React.Fragment key={source.id}>
                    <ListItem
                      secondaryAction={
                        <Typography variant="body1" fontWeight="bold">
                          ${source.amount.toFixed(2)}
                        </Typography>
                      }
                    >
                      <ListItemText
                        primary={source.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.secondary">
                              {source.date} • {source.received ? 'Received' : 'Pending'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                
                {revenueSources.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No revenue sources added yet"
                      primaryTypographyProps={{ color: 'text.secondary', align: 'center' }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Summary Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Financial Summary
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">Total Revenue:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">${totalRevenue.toFixed(2)}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body1">Total Expenses:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">$8,750.00</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight="bold">Net Profit/Loss:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography 
                      variant="body1" 
                      fontWeight="bold" 
                      align="right"
                      color={totalRevenue - 8750 >= 0 ? 'success.main' : 'error.main'}
                    >
                      ${(totalRevenue - 8750).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Budget Health
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">Budget Utilization:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">87.5%</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body1">Revenue Realization:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">
                      {((receivedRevenue / totalRevenue) * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body1">ROI:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">
                      {((totalRevenue - 8750) / 8750 * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Budget Notes
              </Typography>
              
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Add notes about your budget here..."
                sx={{ mb: 3 }}
              />
              
              <Button variant="contained">Save Notes</Button>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Budget Tips
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Track all expenses in real-time"
                      secondary="Update your budget as soon as expenses occur to maintain accuracy."
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Include a contingency fund"
                      secondary="Set aside 10-15% of your budget for unexpected expenses."
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Review vendor contracts carefully"
                      secondary="Look for hidden fees and cancellation policies."
                    />
                  </ListItem>
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Add Revenue Dialog */}
      <Dialog open={openRevenueDialog} onClose={handleRevenueDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Revenue Source</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Revenue Source Name"
                fullWidth
                value={newRevenue.name}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="amount"
                label="Amount"
                type="number"
                fullWidth
                value={newRevenue.amount}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="date"
                label="Date"
                type="date"
                fullWidth
                value={newRevenue.date}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                select
                name="received"
                label="Status"
                fullWidth
                value={newRevenue.received}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value={true}>Received</option>
                <option value={false}>Pending</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRevenueDialogClose}>Cancel</Button>
          <Button 
            onClick={handleAddRevenue} 
            variant="contained" 
            color="primary"
            disabled={!newRevenue.name || !newRevenue.amount}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default BudgetManagementPage;
