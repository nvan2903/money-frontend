import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, InputAdornment,
  Button, Chip, Grid, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, CircularProgress, Alert, Stack, IconButton,
  Collapse, Tooltip, Badge, Autocomplete
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TuneRounded as TuneIcon
} from '@mui/icons-material';
import { fetchAllTransactions, clearAdminError } from '../../store/slices/adminSlice';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminTransactionManagement = () => {  const dispatch = useDispatch();
  const { transactions = [], total, page, perPage, loading, error } = useSelector(state => state.admin);
    // Filter states
  const [filters, setFilters] = useState({
    search: '',
    user_id: '',
    type: '',
    category_id: '',
    start_date: null,
    end_date: null,
    min_amount: '',
    max_amount: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [quickFilters, setQuickFilters] = useState({
    today: false,
    thisWeek: false,
    thisMonth: false,
    highValue: false
  });

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== '' && value !== null).length +
           Object.values(quickFilters).filter(Boolean).length;
  }, [filters, quickFilters]);
  // Load transactions on component mount
  useEffect(() => {
    dispatch(fetchAllTransactions({ page: 1, per_page: 10 }));
  }, [dispatch]);

  // Generate search suggestions from existing transactions
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const suggestions = new Set();
      transactions.forEach(transaction => {
        if (transaction.description) suggestions.add(transaction.description);
        if (transaction.category_name) suggestions.add(transaction.category_name);
        if (transaction.user_id) suggestions.add(`User: ${transaction.user_id}`);
      });
      setSearchSuggestions(Array.from(suggestions).slice(0, 20));
    }
  }, [transactions]);
  // Handle quick filter toggle
  const handleQuickFilter = (filterType) => {
    const newQuickFilters = { ...quickFilters, [filterType]: !quickFilters[filterType] };
    setQuickFilters(newQuickFilters);
    
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let newFilters = { ...filters };
    
    // Clear date filters first
    newFilters.start_date = null;
    newFilters.end_date = null;
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
    
    // Apply filters immediately
    const filterParams = { page: 1, per_page: perPage || 10 };
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] !== '' && newFilters[key] !== null) {
        filterParams[key] = newFilters[key];
      }
    });
    dispatch(fetchAllTransactions(filterParams));  };

  // Handle filter change
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

  // Apply filters
  const applyFilters = () => {
    const filterParams = { page: 1, per_page: perPage || 10 };
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null) {
        filterParams[key] = filters[key];
      }
    });

    dispatch(fetchAllTransactions(filterParams));
  };
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      user_id: '',
      type: '',
      category_id: '',
      start_date: null,
      end_date: null,
      min_amount: '',
      max_amount: ''
    });
    setQuickFilters({
      today: false,
      thisWeek: false,
      thisMonth: false,
      highValue: false
    });
    dispatch(fetchAllTransactions({ page: 1, per_page: perPage || 10 }));
  };
  // Handle page change
  const handlePageChange = (event, newPage) => {
    const filterParams = { page: newPage + 1, per_page: perPage };
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null) {
        filterParams[key] = filters[key];
      }
    });

    dispatch(fetchAllTransactions(filterParams));
  };
  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    const newPerPage = parseInt(event.target.value, 10);
    const filterParams = { page: 1, per_page: newPerPage };
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null) {
        filterParams[key] = filters[key];
      }
    });

    dispatch(fetchAllTransactions(filterParams));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Quản lý giao dịch
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            // onClick={handleExport}
          >
            Xuất giao dịch
          </Button>
        </Box>

        {/* Error Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminError())}>
            {error}
          </Alert>
        )}        {/* Search and Filter Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {/* Quick Filters */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Bộ lọc nhanh
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label="Hôm nay"
                  variant={quickFilters.today ? "filled" : "outlined"}
                  color={quickFilters.today ? "primary" : "default"}
                  onClick={() => handleQuickFilter('today')}
                  size="small"
                />
                <Chip
                  label="Tuần này"
                  variant={quickFilters.thisWeek ? "filled" : "outlined"}
                  color={quickFilters.thisWeek ? "primary" : "default"}
                  onClick={() => handleQuickFilter('thisWeek')}
                  size="small"
                />
                <Chip
                  label="Tháng này"
                  variant={quickFilters.thisMonth ? "filled" : "outlined"}
                  color={quickFilters.thisMonth ? "primary" : "default"}
                  onClick={() => handleQuickFilter('thisMonth')}
                  size="small"
                />                <Chip
                  label="Giao dịch giá trị lớn (>1.000.000 đ)"
                  variant={quickFilters.highValue ? "filled" : "outlined"}
                  color={quickFilters.highValue ? "secondary" : "default"}
                  onClick={() => handleQuickFilter('highValue')}
                  size="small"
                />
              </Stack>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  freeSolo
                  options={searchSuggestions}
                  value={filters.search}
                  onChange={(event, newValue) => handleFilterChange('search', newValue || '')}
                  onInputChange={(event, newInputValue) => handleFilterChange('search', newInputValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      placeholder="Tìm kiếm theo mô tả, danh mục, người dùng..."
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
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Loại</InputLabel>
                  <Select
                    value={filters.type}
                    label="Type"
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="income">Thu nhập</MenuItem>
                    <MenuItem value="expense">Chi tiêu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Tooltip title={`${activeFilterCount} bộ lọc đang áp dụng`}>
                  <Badge badgeContent={activeFilterCount} color="primary">
                    <Button
                      variant="outlined"
                      startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => setShowFilters(!showFilters)}
                      fullWidth
                    >
                      {showFilters ? 'Ẩn bộ lọc' : 'Thêm bộ lọc'}
                    </Button>
                  </Badge>
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  onClick={applyFilters}
                  fullWidth
                  startIcon={<TuneIcon />}
                >
                  Áp dụng bộ lọc
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  fullWidth
                  disabled={activeFilterCount === 0}
                >
                  Hủy
                </Button>
              </Grid>
            </Grid>            {/* Extended Filters */}
            <Collapse in={showFilters}>
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Bộ lọc nâng cao
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Ngày bắt đầu"
                      type="date"
                      value={filters.start_date || ''}
                      onChange={(e) => handleFilterChange('start_date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Ngày kết thúc"
                    type="date"
                    value={filters.end_date || ''}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Số tiền tối thiểu"
                    type="number"
                    value={filters.min_amount}
                    onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Số tiền tối đa"
                    type="number"
                    value={filters.max_amount}
                    onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                  />
                </Grid>              </Grid>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : transactions && transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction._id} hover>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2" fontWeight="bold">
                            {transaction.user_info?.username || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.user_info?.email || ''}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.type} 
                          color={transaction.type === 'income' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: transaction.type === 'income' ? 'success.main' : 'error.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                          {transaction.notes || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small"
                          color="primary"
                          title="Xem chi tiết"
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" color="text.secondary">
                        Không tìm thấy giao dịch nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            component="div"
            count={total || 0}
            page={(page || 1) - 1}
            onPageChange={handlePageChange}
            rowsPerPage={perPage || 10}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />        </Paper>
      </Box>
    );
  };

  export default AdminTransactionManagement;
