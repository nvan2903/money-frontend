import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchTransactions,
  deleteTransaction,
  clearTransactionMessage,
  setPage,
  setPerPage,
  exportTransactions,
  fetchSearchSuggestions,
} from '../../store/slices/transactionSlice';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton, Button, Chip, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Alert, TextField, MenuItem, InputAdornment, Grid, Tooltip,
  Menu, Autocomplete, Collapse, Stack, Badge
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as ExcelIcon,
  TableChart as CsvIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { fetchCategories } from '../../store/slices/categorySlice';
import { formatCurrency } from '../../utils/formatCurrency';

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
    perPage,
    searchSuggestions
  } = useSelector(state => state.transactions);
  
  const { categories } = useSelector(state => state.categories);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);  const [filtersOpen, setFiltersOpen] = useState(false);  
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category_id: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
    sort_by: 'date',
    sort_order: 'desc'
  });
  
  const [quickFilters, setQuickFilters] = useState({
    today: false,
    thisWeek: false,
    thisMonth: false,
    highValue: false
  });

  // Toggle filters visibility
  const toggleFilters = () => {
    setFiltersOpen(prev => !prev);
  };

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== '' && value !== null).length +
           Object.values(quickFilters).filter(Boolean).length;
  }, [filters, quickFilters]);

  // Load categories and search suggestions on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSearchSuggestions());
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

  const handleEdit = (id) => {
    navigate(`/transactions/edit/${id}`);
  };
  
  const handleAddTransaction = () => {
    navigate('/transactions/add');
  };
  
  const handleExportMenuOpen = (event) => {
    setExportMenuAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
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
  
  // Handle quick filter toggle
  const handleQuickFilter = (filterType) => {
    const newQuickFilters = { ...quickFilters, [filterType]: !quickFilters[filterType] };
    setQuickFilters(newQuickFilters);
    
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let newFilters = { ...filters };
    
    // Clear date filters first
    newFilters.start_date = '';
    newFilters.end_date = '';
    newFilters.min_amount = '';
    
    if (newQuickFilters.today) {
      newFilters.start_date = today;
      newFilters.end_date = today;
    } else if (newQuickFilters.thisWeek) {
      newFilters.start_date = weekAgo;
      newFilters.end_date = today;
    } else if (newQuickFilters.thisMonth) {
      newFilters.start_date = monthAgo;
      newFilters.end_date = today;
    }
      if (newQuickFilters.highValue) {
      newFilters.min_amount = '1000000'; // 1 million VND
    }
    
    setFilters(newFilters);
    dispatch(setPage(1)); // Reset to first page
  };
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear quick filters if manual filters are being used
    if (field === 'start_date' || field === 'end_date' || field === 'min_amount') {
      setQuickFilters({
        today: false,
        thisWeek: false,
        thisMonth: false,
        highValue: false
      });
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      category_id: '',
      start_date: '',
      end_date: '',
      min_amount: '',
      max_amount: '',
      sort_by: 'date',
      sort_order: 'desc'
    });
    
    setQuickFilters({
      today: false,
      thisWeek: false,
      thisMonth: false,
      highValue: false
    });
    
    dispatch(setPage(1));
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Giao dịch
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTransaction}
            sx={{ mr: 1 }}
          >
            Thêm giao dịch
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportMenuOpen}
          >
            Xuất báo cáo
          </Button>
          <Menu
            anchorEl={exportMenuAnchorEl}
            open={Boolean(exportMenuAnchorEl)}
            onClose={handleExportMenuClose}
            PaperProps={{
              style: {
                maxHeight: 48 * 4.5,
                width: '20ch',
              },
            }}
          >
            <MenuItem onClick={() => handleExportTransactions('pdf')}>
              <PdfIcon sx={{ mr: 1 }} /> Xuất PDF
            </MenuItem>
            <MenuItem onClick={() => handleExportTransactions('excel')}>
              <ExcelIcon sx={{ mr: 1 }} /> Xuất Excel
            </MenuItem>
            <MenuItem onClick={() => handleExportTransactions('csv')}>
              <CsvIcon sx={{ mr: 1 }} /> Xuất CSV
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

      {/* Enhanced search and filter bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: filtersOpen ? 2 : 0 }}>
          {/* Enhanced search with autocomplete */}
          <Autocomplete
            freeSolo
            options={searchSuggestions}
            value={filters.search}
            onChange={(event, newValue) => handleFilterChange('search', newValue || '')}
            onInputChange={(event, newInputValue) => handleFilterChange('search', newInputValue)}
            sx={{ width: { xs: '100%', sm: '40%' } }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tìm kiếm theo ghi chú, danh mục..."
                variant="outlined"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Quick filter chips */}
            <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
              <Chip
                label="Hôm nay"
                color={quickFilters.today ? "primary" : "default"}
                onClick={() => handleQuickFilter('today')}
                variant={quickFilters.today ? "filled" : "outlined"}
                size="small"
              />
              <Chip
                label="Tuần này"
                color={quickFilters.thisWeek ? "primary" : "default"}
                onClick={() => handleQuickFilter('thisWeek')}
                variant={quickFilters.thisWeek ? "filled" : "outlined"}
                size="small"
              />
              <Chip
                label="Tháng này"
                color={quickFilters.thisMonth ? "primary" : "default"}
                onClick={() => handleQuickFilter('thisMonth')}
                variant={quickFilters.thisMonth ? "filled" : "outlined"}
                size="small"
              />              <Chip
                label="Giá trị cao (>1tr đ)"
                color={quickFilters.highValue ? "primary" : "default"}
                onClick={() => handleQuickFilter('highValue')}
                variant={quickFilters.highValue ? "filled" : "outlined"}
                size="small"
              />
            </Stack>
            
            <Badge badgeContent={activeFilterCount} color="primary">
              <Button
                variant="outlined"
                startIcon={filtersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                endIcon={<FilterIcon />}
                onClick={toggleFilters}
              >
                Bộ lọc
              </Button>
            </Badge>
          </Box>
        </Box>
        
        {/* Collapsible advanced filters */}
        <Collapse in={filtersOpen}>
          <Box component="form" onSubmit={handleFilterSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Loại giao dịch"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="income">Thu nhập</MenuItem>
                  <MenuItem value="expense">Chi tiêu</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Danh mục"
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">Tất cả</MenuItem>
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
                  label="Từ ngày"
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Đến ngày"
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Số tiền tối thiểu"
                  type="number"
                  value={filters.min_amount}
                  onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Số tiền tối đa"
                  type="number"
                  value={filters.max_amount}
                  onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  startIcon={<SearchIcon />}
                  sx={{ flex: 1 }}
                >
                  Áp dụng bộ lọc
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                  sx={{ flex: 1 }}
                >
                  Xóa bộ lọc
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>
      
      {/* Transactions table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="transactions table">
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Ghi chú</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Đang tải...
                  </TableCell>
                </TableRow>              ) : transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction._id} hover>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.category_name}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                        color={transaction.type === 'income' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {transaction.note || 'Không có ghi chú'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(transaction._id)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(transaction)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      Không tìm thấy giao dịch nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Table pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total || 0}
          rowsPerPage={perPage}
          page={(page || 1) - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
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
          Xóa giao dịch
        </DialogTitle>
        <DialogContent>          <DialogContentText id="alert-dialog-description">
            Bạn có chắc chắn muốn xóa giao dịch này{' '}
            {transactionToDelete && `(${transactionToDelete.category_name}: ${formatCurrency(transactionToDelete.amount)})`}?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionList;