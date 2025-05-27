import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Divider, Stack, IconButton, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, CircularProgress,
  Alert, TablePagination
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as DateIcon,
  AccountBalance as BalanceIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Receipt as TransactionIcon,
  ToggleOff as DeactivateIcon,
  ToggleOn as ActivateIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { 
  fetchUser, 
  fetchAllTransactions,
  toggleUserStatus,
  deleteUser,
  clearAdminError 
} from '../../store/slices/adminSlice';

const UserDetails = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, transactions = [], loading, error } = useSelector(state => state.admin);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPerPage] = useState(10);

  // User statistics
  const [userStats, setUserStats] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(userId));
      dispatch(fetchAllTransactions({ 
        user_id: userId, 
        page: transactionPage, 
        per_page: transactionPerPage 
      }));
    }
  }, [dispatch, userId, transactionPage, transactionPerPage]);

  // Calculate user statistics
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      setUserStats({
        totalTransactions: transactions.length,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      });
    }
  }, [transactions]);

  const handleBack = () => {
    navigate('/admin/users');
  };

  const handleToggleStatus = () => {
    if (user) {
      dispatch(toggleUserStatus(user._id));
    }
  };

  const handleDeleteUser = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (user) {
      dispatch(deleteUser(user._id));
      setDeleteDialogOpen(false);
      navigate('/admin/users');
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleTransactionPageChange = (event, newPage) => {
    setTransactionPage(newPage + 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => dispatch(clearAdminError())}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          User not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ flexGrow: 1 }}>
          User Details
        </Typography>
        {user.role !== 'admin' && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={user.is_active ? <DeactivateIcon /> : <ActivateIcon />}
              color={user.is_active ? 'warning' : 'success'}
              onClick={handleToggleStatus}
            >
              {user.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              color="error"
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </Stack>
        )}
      </Box>

      {/* User Information */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user.first_name || user.last_name 
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                    : user.username
                  }
                </Typography>
                <Chip 
                  label={user.role || 'user'} 
                  color={user.role === 'admin' ? 'primary' : 'default'}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">{user.username}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DateIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    Joined {formatDate(user.created_at)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">
                    Status: 
                    <Chip 
                      label={user.is_active ? 'Active' : 'Inactive'} 
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* User Statistics */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TransactionIcon sx={{ color: 'info.main', mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Transactions
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div" sx={{ mt: 1, color: 'info.main' }}>
                    {userStats.totalTransactions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IncomeIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Total Income
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div" sx={{ mt: 1, color: 'success.main' }}>
                    {formatAmount(userStats.totalIncome)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ExpenseIcon sx={{ color: 'error.main', mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Total Expense
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div" sx={{ mt: 1, color: 'error.main' }}>
                    {formatAmount(userStats.totalExpense)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BalanceIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Net Balance
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                      mt: 1,
                      color: userStats.balance >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {formatAmount(userStats.balance)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* User Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction._id} hover>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
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
                          {formatAmount(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {transaction.notes || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" color="text.secondary">
                        No transactions found for this user
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {transactions && transactions.length > 0 && (
            <TablePagination
              component="div"
              count={userStats.totalTransactions}
              page={transactionPage - 1}
              onPageChange={handleTransactionPageChange}
              rowsPerPage={transactionPerPage}
              rowsPerPageOptions={[]}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title" color="error">
          Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{user.username}"? 
            This action will permanently delete all user data including transactions and categories.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDetails;
