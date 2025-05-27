import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchTransactions,
  deleteTransaction,
  clearTransactionMessage,
  setPage,
  setPerPage,
  exportTransactions // Import exportTransactions
} from '../../store/slices/transactionSlice';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton, Button, Chip, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Alert, TextField, MenuItem, InputAdornment, Grid, Tooltip,
  Menu // Ensure Menu is imported
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon, // Added for PDF
  Description as ExcelIcon, // Added for Excel (generic doc icon)
  TableChart as CsvIcon // Added for CSV (table/sheet icon)
} from '@mui/icons-material';
import { fetchCategories } from '../../store/slices/categorySlice'; // Keep this if it was added previously

const TransactionList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    transactions,
    loading,
    error,
    message,
    success,
    page,
    total,
    perPage
  } = useSelector(state => state.transactions);
  
  const { categories } = useSelector(state => state.categories); // Keep this
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null); // Added for export menu
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category_id: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: ''
  });

  // Load categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // Function to load transactions with filters
  const loadTransactions = useCallback(() => {
    const queryParams = {
      page: page,
      per_page: perPage,
      ...filters
    };
    
    // Remove empty filters
    Object.keys(queryParams).forEach(key => 
      (queryParams[key] === '' || queryParams[key] === null) && delete queryParams[key]
    );
    
    dispatch(fetchTransactions(queryParams));
  }, [dispatch, page, perPage, filters]);
    // Load transactions when page, perPage or filters change
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);
  
  // Handle success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearTransactionMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dispatch, success]);
  
  const handleChangePage = (event, newPage) => {
    dispatch(setPage(newPage + 1)); // API uses 1-based indexing
  };
  
  const handleChangeRowsPerPage = (event) => {
    dispatch(setPerPage(parseInt(event.target.value, 10)));
    dispatch(setPage(1));
  };
  
  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      dispatch(deleteTransaction(transactionToDelete._id));
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };
  
  const handleEditTransaction = (id) => {
    navigate(`/transactions/edit/${id}`);
  };
  
  const handleAddTransaction = () => {
    navigate('/transactions/add');
  };
  
  const handleExportMenuOpen = (event) => { // Added
    setExportMenuAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => { // Added
    setExportMenuAnchorEl(null);
  };
  const handleExportTransactions = async (format) => {
    try {
      const action = await dispatch(exportTransactions({ format, filters }));
      
      if (action.type === 'transactions/export/fulfilled') {
        // Create blob from response data
        const blob = new Blob([action.payload], {
          type: format === 'pdf' ? 'application/pdf' : 
                format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
                'text/csv'
        });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
        const extension = format === 'excel' ? 'xlsx' : format;
        link.setAttribute('download', `transactions_${timestamp}.${extension}`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
      } else if (action.type === 'transactions/export/rejected') {
        alert(`Failed to export transactions: ${action.payload || 'Server error'}`);
      }
    } catch (error) {
      alert(`Failed to export transactions: ${error.message || 'Unknown error'}`);
    }
    
    handleExportMenuClose();
  };
  
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };
  
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    dispatch(setPage(1)); // Reset to first page
    loadTransactions();
  };
  
  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      category_id: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: ''
    });
    dispatch(setPage(1));
  };
  
  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transactions
        </Typography>
        <Box> {/* Wrapper for buttons */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTransaction}
            sx={{ mr: 1 }} // Add margin to separate buttons
          >
            Add Transaction
          </Button>
          <Button // Added Export Button
            variant="outlined"
            color="secondary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportMenuOpen}
          >
            Export Report
          </Button>
          <Menu // Added Export Menu
            anchorEl={exportMenuAnchorEl}
            open={Boolean(exportMenuAnchorEl)}
            onClose={handleExportMenuClose}
            PaperProps={{
              style: {
                maxHeight: 48 * 4.5, // Adjust based on number of items
                width: '20ch',
              },
            }}
          >
            <MenuItem onClick={() => handleExportTransactions('pdf')}>
              <PdfIcon sx={{ mr: 1 }} /> Export as PDF
            </MenuItem>
            <MenuItem onClick={() => handleExportTransactions('excel')}>
              <ExcelIcon sx={{ mr: 1 }} /> Export as Excel
            </MenuItem>
            <MenuItem onClick={() => handleExportTransactions('csv')}>
              <CsvIcon sx={{ mr: 1 }} /> Export as CSV
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Success message */}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Search and filter bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: filtersOpen ? 2 : 0 }}>          <TextField
            label="Search transactions by description, amount, or notes"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
            sx={{ width: { xs: '100%', sm: '40%' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleFilterSubmit(e);
              }
            }}
          />
          <Button
            startIcon={<FilterIcon />}
            onClick={toggleFilters}
            color="primary"
          >
            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Box>
        
        {filtersOpen && (
          <Box component="form" onSubmit={handleFilterSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  size="small"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  name="category_id"
                  value={filters.category_id}
                  onChange={handleFilterChange}
                  size="small"
                >
                  <MenuItem value="">All</MenuItem>
                  {categories && categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="From Date"
                  name="date_from"
                  type="date"
                  value={filters.date_from}
                  onChange={handleFilterChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="To Date"
                  name="date_to"
                  type="date"
                  value={filters.date_to}
                  onChange={handleFilterChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Min Amount"
                  name="amount_min"
                  type="number"
                  value={filters.amount_min}
                  onChange={handleFilterChange}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Max Amount"
                  name="amount_max"
                  type="number"
                  value={filters.amount_max}
                  onChange={handleFilterChange}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" fullWidth>
                  Apply Filters
                </Button>
                <Button variant="outlined" onClick={handleClearFilters} fullWidth>
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Transactions table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="transactions table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Note</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction._id} hover>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.category_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        color={transaction.type === 'income' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      color: transaction.type === 'income' ? 'success.main' : 'error.main',
                      fontWeight: 'bold' 
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{transaction.note || '-'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton 
                          aria-label="edit" 
                          color="primary"
                          onClick={() => handleEditTransaction(transaction._id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          aria-label="delete" 
                          color="error"
                          onClick={() => handleDeleteClick(transaction)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total || 0}
          rowsPerPage={perPage}
          page={(page > 0 ? page - 1 : 0)}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete Transaction
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this transaction{' '}
            {transactionToDelete && `(${transactionToDelete.category_name}: $${transactionToDelete.amount})`}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionList;