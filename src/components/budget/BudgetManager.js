import React, { useState } from 'react';
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

// Mock data for budget categories
const budgetCategories = [
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

// Mock data for budget items
const initialBudgetItems = [
  { id: '1', category: 'Venue', description: 'Conference Hall Rental', amount: 2500, paid: true, vendor: 'City Convention Center', dueDate: '2023-07-30' },
  { id: '2', category: 'Catering', description: 'Lunch Buffet (50 people)', amount: 1250, paid: true, vendor: 'Gourmet Caterers', dueDate: '2023-08-01' },
  { id: '3', category: 'Entertainment', description: 'DJ Services', amount: 800, paid: false, vendor: 'Beats Entertainment', dueDate: '2023-08-10' },
  { id: '4', category: 'Marketing', description: 'Social Media Ads', amount: 500, paid: true, vendor: 'Digital Marketing Inc.', dueDate: '2023-07-15' },
  { id: '5', category: 'Decorations', description: 'Stage Setup and Lighting', amount: 1200, paid: false, vendor: 'Event Decorators', dueDate: '2023-08-05' },
  { id: '6', category: 'Equipment', description: 'Audio/Visual Equipment', amount: 1500, paid: false, vendor: 'Tech Rentals', dueDate: '2023-08-12' },
];

function BudgetManager({ eventId }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [budgetItems, setBudgetItems] = useState(initialBudgetItems);
  const [totalBudget, setTotalBudget] = useState(10000);
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
  
  // Calculate totals
  const totalExpenses = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = budgetItems.filter(item => item.paid).reduce((sum, item) => sum + item.amount, 0);
  const totalUnpaid = totalExpenses - totalPaid;
  const remainingBudget = totalBudget - totalExpenses;
  const budgetProgress = (totalExpenses / totalBudget) * 100;
  
  // Calculate category totals for pie chart
  const categoryTotals = budgetItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += item.amount;
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
  
  // Handle add item
  const handleAddItem = () => {
    const item = {
      id: Date.now().toString(),
      ...newItem,
      amount: parseFloat(newItem.amount)
    };
    
    setBudgetItems([...budgetItems, item]);
    handleAddDialogClose();
  };
  
  // Handle edit item
  const handleEditItem = () => {
    const updatedItems = budgetItems.map(item => 
      item.id === currentItem.id 
        ? { ...item, ...newItem, amount: parseFloat(newItem.amount) } 
        : item
    );
    
    setBudgetItems(updatedItems);
    handleEditDialogClose();
  };
  
  // Handle delete item
  const handleDeleteItem = (id) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
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
                  {budgetItems.map((item) => (
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
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {budgetCategories.map((category) => (
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
              <FormControl fullWidth>
                <InputLabel id="edit-category-label">Category</InputLabel>
                <Select
                  labelId="edit-category-label"
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {budgetCategories.map((category) => (
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
