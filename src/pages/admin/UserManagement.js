import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, InputAdornment,
  IconButton, Chip, Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, CircularProgress, Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  ToggleOff as DeactivateIcon,
  ToggleOn as ActivateIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { 
  fetchUsers, 
  toggleUserStatus, 
  deleteUser,
  clearAdminError,
  clearAdminMessage
} from '../../store/slices/adminSlice';

const UserManagement = () => {  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, total, page, perPage, loading, error, success, message } = useSelector(state => state.admin);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load users on component mount
  useEffect(() => {
    dispatch(fetchUsers({ page: 1, perPage: 10, search: '' }));
  }, [dispatch]);

  // Clear messages after timeout
  useEffect(() => {
    if (success && message) {
      const timer = setTimeout(() => {
        dispatch(clearAdminMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, message, dispatch]);

  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      dispatch(fetchUsers({ page: 1, perPage, search: value }));
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    dispatch(fetchUsers({ page: newPage + 1, perPage, search: searchTerm }));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    const newPerPage = parseInt(event.target.value, 10);
    dispatch(fetchUsers({ page: 1, perPage: newPerPage, search: searchTerm }));
  };

  // Handle view user
  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  // Handle toggle user status
  const handleToggleStatus = (userId) => {
    dispatch(toggleUserStatus(userId));
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      dispatch(deleteUser(selectedUser._id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {success && message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAdminError())}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by username, email, first name, or last name..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.first_name || user.last_name 
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role || 'user'} 
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.is_active ? 'Active' : 'Inactive'} 
                        color={user.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        onClick={() => handleViewUser(user._id)}
                        color="primary"
                        size="small"
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {user.role !== 'admin' && (
                        <>
                          <IconButton 
                            onClick={() => handleToggleStatus(user._id)}
                            color={user.is_active ? 'warning' : 'success'}
                            size="small"
                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.is_active ? <DeactivateIcon /> : <ActivateIcon />}
                          </IconButton>
                          
                          <IconButton 
                            onClick={() => handleDeleteUser(user)}
                            color="error"
                            size="small"
                            title="Delete User"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No users found
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
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

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
            Are you sure you want to delete user "{selectedUser?.username}"? 
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

export default UserManagement;
