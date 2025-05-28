import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchCategories,
  deleteCategory,
  clearCategoryMessage
} from '../../store/slices/categorySlice';
import {
  Box, Paper, Typography, Tab, Tabs, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Button, Chip, Divider,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Alert, Container, TextField, InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    categories, 
    incomeCategories, 
    expenseCategories, 
    loading, 
    error, 
    message, 
    success 
  } = useSelector(state => state.categories);
  
  // Local state
  const [tabValue, setTabValue] = useState(0); // 0 for all, 1 for income, 2 for expense
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
    // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // Handle success messages separately
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearCategoryMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dispatch, success]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      dispatch(deleteCategory(categoryToDelete._id));
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  const handleEditCategory = (id) => {
    navigate(`/categories/edit/${id}`);
  };
    const handleAddCategory = () => {
    navigate('/categories/add');
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
    // Determine which categories to display based on the selected tab
  const displayCategories = () => {
    let filteredCategories;
    switch (tabValue) {
      case 0:
        filteredCategories = categories;
        break;
      case 1:
        filteredCategories = incomeCategories;
        break;
      case 2:
        filteredCategories = expenseCategories;
        break;
      default:
        filteredCategories = categories;
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filteredCategories = filteredCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredCategories;
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Danh sách danh mục
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddCategory}
          >
            Thêm danh mục
          </Button>
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

        {/* Search Box */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm danh mục theo tên hoặc loại..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>
        
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              aria-label="category tabs"
              centered
            >
              <Tab label="Tất cả danh mục" />
              <Tab label="Danh mục thu nhập" />
              <Tab label="Danh mục chi tiêu" />
            </Tabs>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              Đang tải danh mục...
            </Box>
          ) : displayCategories().length > 0 ? (
            <List>
              {displayCategories().map((category) => (
                <React.Fragment key={category._id}>
                  <ListItem>
                    <ListItemText 
                      primary={category.name} 
                    />
                    <Chip
                      label={category.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                      color={category.type === 'income' ? 'success' : 'error'}
                      size="small"
                      sx={{ mr: 8 }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={() => handleEditCategory(category._id)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDeleteClick(category)}
                        color="error"
                        disabled={category.is_default}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Không có danh mục nào
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleAddCategory}
                sx={{ mt: 2 }}
              >
                Thêm danh mục đầu tiên của bạn
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Xóa danh mục
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.name}"?
            Điều này sẽ không xóa các giao dịch liên quan, nhưng chúng sẽ không còn được liên kết với danh mục này nữa.
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
    </Container>
  );
};

export default CategoryList;