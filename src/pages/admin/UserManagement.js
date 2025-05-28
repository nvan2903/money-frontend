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
          Quản lý người dùng
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
          placeholder="Tìm kiếm người dùng theo tên đăng nhập, email, họ hoặc tên..."
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
                <TableCell>Tên đăng nhập</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="center">Hành động</TableCell>
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
                        : 'Không có dữ liệu'
                      }
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.is_active ? 'Đang hoạt động' : 'Ngưng hoạt động'}
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
                        title="Xem chi tiết"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {user.role !== 'admin' && (
                        <>
                          <IconButton 
                            onClick={() => handleToggleStatus(user._id)}
                            color={user.is_active ? 'warning' : 'success'}
                            size="small"
                            title={user.is_active ? 'Ngưng hoạt động người dùng' : 'Kích hoạt người dùng'}
                          >
                            {user.is_active ? <DeactivateIcon /> : <ActivateIcon />}
                          </IconButton>
                          
                          <IconButton 
                            onClick={() => handleDeleteUser(user)}
                            color="error"
                            size="small"
                            title="Xóa người dùng"
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
                      Không tìm thấy người dùng nào
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
          Xóa người dùng
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.username}"? 
            Hành động này sẽ xóa vĩnh viễn tất cả dữ liệu của người dùng bao gồm giao dịch và danh mục.
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Hủy
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
