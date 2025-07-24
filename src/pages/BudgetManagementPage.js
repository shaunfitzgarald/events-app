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

// Mock event data
const mockEvent = {
  id: '123',
  title: 'Summer Tech Conference 2023',
  date: 'August 15, 2023',
  location: 'San Francisco Convention Center'
};

// Mock revenue sources
const mockRevenueSources = [
  { id: '1', name: 'Ticket Sales', amount: 5000, received: true, date: '2023-07-10' },
  { id: '2', name: 'Sponsorship - TechCorp', amount: 3000, received: true, date: '2023-06-25' },
  { id: '3', name: 'Sponsorship - DevInc', amount: 2000, received: false, date: '2023-08-01' },
  { id: '4', name: 'Workshop Registrations', amount: 1500, received: true, date: '2023-07-20' },
];

function BudgetManagementPage() {
  const theme = useTheme();
  const { eventId } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [revenueSources, setRevenueSources] = useState(mockRevenueSources);
  const [openRevenueDialog, setOpenRevenueDialog] = useState(false);
  const [newRevenue, setNewRevenue] = useState({
    name: '',
    amount: '',
    received: false,
    date: new Date().toISOString().split('T')[0]
  });
  
  // Calculate totals
  const totalRevenue = revenueSources.reduce((sum, source) => sum + source.amount, 0);
  const receivedRevenue = revenueSources.filter(source => source.received).reduce((sum, source) => sum + source.amount, 0);
  const pendingRevenue = totalRevenue - receivedRevenue;
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
  
  // Handle add revenue
  const handleAddRevenue = () => {
    const revenue = {
      id: Date.now().toString(),
      ...newRevenue,
      amount: parseFloat(newRevenue.amount)
    };
    
    setRevenueSources([...revenueSources, revenue]);
    handleRevenueDialogClose();
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Budget Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {mockEvent.title} - {mockEvent.date}
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
      
      {/* Expenses Tab */}
      {tabValue === 0 && (
        <BudgetManager eventId={eventId} />
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
