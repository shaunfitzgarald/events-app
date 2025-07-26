import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PieChartIcon from '@mui/icons-material/PieChart';
import { PieChart } from '@mui/x-charts/PieChart';

// Default budget categories (only used for new item suggestions)
const DEFAULT_BUDGET_CATEGORIES = [
  'Venue',
  'Catering',
  'Decorations',
  'Entertainment',
  'Marketing',
  'Transportation',
  'Accommodation',
  'Staff',
  'Equipment',
  'Miscellaneous'
];

function BudgetManager({ eventId, event }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [budgetItems, setBudgetItems] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [newItem, setNewItem] = useState({
    category: '',
    description: '',
    amount: '',
    paid: false,
    vendor: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Save budget data to Firestore
  const saveBudgetData = async (updatedItems, updatedTotalBudget) => {
    try {
      // Import Firestore functions
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../services/firebase');
      
      // Ensure items are in the correct format
      const safeItems = Array.isArray(updatedItems) ? updatedItems : [];
      const safeBudget = typeof updatedTotalBudget === 'number' ? updatedTotalBudget : 0;
      
      console.log('Saving budget data:', safeItems, safeBudget);
      
      // Update event document
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        budget: safeItems,
        totalBudget: safeBudget
      });
      
      return true;
    } catch (err) {
      console.error('Error saving budget data:', err);
      setError('Failed to save budget data');
      return false;
    }
  };
  
  // Fetch budget data from Firestore
  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!eventId) {
        setError('No event ID provided');
        return;
      }
      
      try {
        setLoading(true);
        
        // Import Firestore functions
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../services/firebase');
        
        // Get event document
        const eventRef = doc(db, 'events', eventId);
        const eventSnapshot = await getDoc(eventRef);
        
        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          
          // Get budget items - ensure it's always an array
          let budgetData = eventData.budget;
          if (!Array.isArray(budgetData)) {
            budgetData = [];
            console.log('Budget data was not an array, initializing empty array');
          }
          
          setBudgetItems(budgetData);
          
          // Get total budget - ensure it's always a number
          const totalBudgetValue = typeof eventData.totalBudget === 'number' ? eventData.totalBudget : 0;
          setTotalBudget(totalBudgetValue);
          
          // Extract unique categories from budget items
          const uniqueCategories = [...new Set(budgetData.map(item => item.category).filter(Boolean))];
          setCategories(uniqueCategories.length > 0 ? uniqueCategories : DEFAULT_BUDGET_CATEGORIES);
          
          setError(null);
        } else {
          setError('Event not found');
          setBudgetItems([]);
        }
      } catch (err) {
        console.error('Error fetching budget data:', err);
        setError('Failed to load budget data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBudgetData();
  }, [eventId]);
  
  // Ensure budgetItems is always an array
  const safeItems = Array.isArray(budgetItems) ? budgetItems : [];
  
  // Calculate totals
  const totalExpenses = safeItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalPaid = safeItems.filter(item => item.paid).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalUnpaid = totalExpenses - totalPaid;
  const remainingBudget = totalBudget - totalExpenses;
  const budgetProgress = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  
  // Calculate category totals for pie chart
  const categoryTotals = safeItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += parseFloat(item.amount) || 0;
    return acc;
  }, {});
  
  const pieChartData = Object.keys(categoryTotals).map(category => ({
    id: category,
    value: categoryTotals[category],
    label: category
  }));
  
  // Handle add dialog open
  const handleAddDialogOpen = () => {
    setOpenAddDialog(true);
  };
  
  // Handle add dialog close
  const handleAddDialogClose = () => {
    setOpenAddDialog(false);
    setNewItem({
      category: '',
      description: '',
      amount: '',
      paid: false,
      vendor: '',
      dueDate: ''
    });
  };
  
  // Handle edit dialog open
  const handleEditDialogOpen = (item) => {
    setCurrentItem(item);
    setNewItem({
      category: item.category,
      description: item.description,
      amount: item.amount,
      paid: item.paid,
      vendor: item.vendor,
      dueDate: item.dueDate
    });
    setOpenEditDialog(true);
  };
  
  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setCurrentItem(null);
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem({
      ...newItem,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle edit input change
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Add new budget item
  const handleAddItem = async () => {
    try {
      // Validate inputs
      if (!newItem.category || !newItem.description || !newItem.amount) {
        alert('Please fill in all required fields (Category, Description, and Amount)');
        return;
      }
      
      const item = {
        ...newItem,
        id: Date.now().toString(),
        amount: parseFloat(newItem.amount) || 0,
        paid: newItem.paid || false,
        vendor: newItem.vendor || '',
        dueDate: newItem.dueDate || ''
      };
      
      // Use safeItems to ensure we're working with an array
      const updatedItems = [...safeItems, item];
      setBudgetItems(updatedItems);
      
      // Add category to list if it's new
      if (!categories.includes(item.category)) {
        setCategories([...categories, item.category]);
      }
      
      // Save to Firestore
      await saveBudgetData(updatedItems, totalBudget);
      
      // Reset form
      setNewItem({
        category: '',
        description: '',
        amount: '',
        paid: false,
        vendor: '',
        dueDate: ''
      });
      
      // Close dialog
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error adding budget item:', error);
      setError('Failed to add budget item');
    }
    
    setOpenAddDialog(false);
    setNewItem({
      category: '',
      description: '',
      amount: '',
      paid: false,
      vendor: '',
      dueDate: ''
    });
  };
  
  // Update total budget
  const handleUpdateTotalBudget = async () => {
    // Validate input
    if (!totalBudget || totalBudget <= 0) {
      return;
    }
    
    const updatedTotalBudget = parseFloat(totalBudget);
    setTotalBudget(updatedTotalBudget);
    
    // Save to Firestore
    await saveBudgetData(budgetItems, updatedTotalBudget);
  };
  
  // Edit budget item
  const handleEditItem = async () => {
    if (!currentItem) return;
    
    // Validate inputs
    if (!currentItem.category || !currentItem.description || !currentItem.amount) {
      return;
    }
    
    const updatedItems = budgetItems.map(item => 
      item.id === currentItem.id ? { ...currentItem, amount: parseFloat(currentItem.amount) } : item
    );
    
    setBudgetItems(updatedItems);
    
    // Add category to list if it's new
    if (!categories.includes(currentItem.category)) {
      setCategories([...categories, currentItem.category]);
    }
    
    // Save to Firestore
    await saveBudgetData(updatedItems, totalBudget);
    
    setOpenEditDialog(false);
    setCurrentItem(null);
  };
  
  // Delete budget item
  const handleDeleteItem = async (id) => {
    const updatedItems = budgetItems.filter(item => item.id !== id);
    setBudgetItems(updatedItems);
    
    // Save to Firestore
    await saveBudgetData(updatedItems, totalBudget);
  };
  
  // Handle total budget change
  const handleTotalBudgetChange = (e) => {
    setTotalBudget(parseFloat(e.target.value) || 0);
  };
  
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Budget Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget Summary
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Total Budget"
                  type="number"
                  value={totalBudget}
                  onChange={handleTotalBudgetChange}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Budget Used:
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(budgetProgress, 100)}
                    color={budgetProgress > 90 ? 'error' : budgetProgress > 75 ? 'warning' : 'primary'}
                    sx={{ flexGrow: 1, mr: 1 }}
                  />
                  <Typography variant="body2">
                    {budgetProgress.toFixed(1)}%
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Typography variant="body2">
                    Total Expenses: ${totalExpenses.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Remaining: ${remainingBudget.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Budget Stats */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ${totalExpenses.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} md={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Paid
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    ${totalPaid.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} md={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Unpaid
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    ${totalUnpaid.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Expense Breakdown
                  </Typography>
                  {pieChartData.length > 0 ? (
                    <Box sx={{ height: 200, mt: 2 }}>
                      <PieChart
                        series={[
                          {
                            data: pieChartData,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                          },
                        ]}
                        height={200}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                      No expense data to display
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Budget Items Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Budget Items
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddDialogOpen}
              >
                Add Expense
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.description}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.vendor}</Typography>
                      </TableCell>
                      <TableCell align="right">${item.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.paid ? 'Paid' : 'Unpaid'}
                          color={item.paid ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.dueDate}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditDialogOpen(item)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {budgetItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No budget items added yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Add Item Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={newItem.category}
                  label="Category"
                  onChange={handleInputChange}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="amount"
                label="Amount"
                type="number"
                fullWidth
                value={newItem.amount}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                value={newItem.description}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="vendor"
                label="Vendor"
                fullWidth
                value={newItem.vendor}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="dueDate"
                label="Due Date"
                type="date"
                fullWidth
                value={newItem.dueDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="paid-label">Payment Status</InputLabel>
                <Select
                  labelId="paid-label"
                  name="paid"
                  value={newItem.paid}
                  onChange={handleInputChange}
                  label="Payment Status"
                >
                  <MenuItem value={true}>Paid</MenuItem>
                  <MenuItem value={false}>Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button 
            onClick={handleAddItem} 
            variant="contained" 
            color="primary"
            disabled={!newItem.category || !newItem.description || !newItem.amount}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Item Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="edit-category-label">Category</InputLabel>
                <Select
                  labelId="edit-category-label"
                  id="edit-category"
                  name="category"
                  value={currentItem?.category || ''}
                  label="Category"
                  onChange={handleEditInputChange}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="amount"
                label="Amount"
                type="number"
                fullWidth
                value={newItem.amount}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                value={newItem.description}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="vendor"
                label="Vendor"
                fullWidth
                value={newItem.vendor}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="dueDate"
                label="Due Date"
                type="date"
                fullWidth
                value={newItem.dueDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="edit-paid-label">Payment Status</InputLabel>
                <Select
                  labelId="edit-paid-label"
                  name="paid"
                  value={newItem.paid}
                  onChange={handleInputChange}
                  label="Payment Status"
                >
                  <MenuItem value={true}>Paid</MenuItem>
                  <MenuItem value={false}>Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button 
            onClick={handleEditItem} 
            variant="contained" 
            color="primary"
            disabled={!newItem.category || !newItem.description || !newItem.amount}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BudgetManager;
