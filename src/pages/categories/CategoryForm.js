import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box, Typography, Paper, Grid, TextField, Button, MenuItem,
  CircularProgress, Alert, Container
} from '@mui/material';
import {
  addCategory,
  fetchCategory,
  updateCategory,
  clearCategoryError
} from '../../store/slices/categorySlice';

const CategoryForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { category, loading, error, success } = useSelector(state => state.categories);
  
  const [formSubmitted, setFormSubmitted] = useState(false);
    // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    type: Yup.string()
      .required('Type is required')
      .oneOf(['income', 'expense'], 'Type must be either income or expense')
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      type: 'expense'
    },
    validationSchema,
    onSubmit: (values) => {
      if (isEditing) {
        dispatch(updateCategory({ id, categoryData: values }));
      } else {
        dispatch(addCategory(values));
      }
      setFormSubmitted(true);
    }
  });
  
  // Load data when component mounts
  useEffect(() => {
    if (isEditing) {
      dispatch(fetchCategory(id));
    }
    
    // Clear any error messages when component unmounts
    return () => {
      dispatch(clearCategoryError());
    };
  }, [dispatch, id, isEditing]);
  // Keep a reference to the latest formik instance
  const formikRef = useRef(formik);
  formikRef.current = formik;
  
  // Set form values when editing and category data is fetched
  useEffect(() => {
    if (isEditing && category) {
      formikRef.current.setValues({
        name: category.name,
        type: category.type
      });
    }
  }, [isEditing, category]);
    // Redirect after successful submission
  useEffect(() => {
    if (success && formSubmitted) {
      navigate('/categories');
    }
  }, [success, formSubmitted, navigate]);
  
  // Loading indicator
  if (isEditing && !category && loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Tên danh mục"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="type"
                  name="type"
                  label="Loại danh mục"
                  select
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}
                  disabled={isEditing && category?.is_default}
                >
                  <MenuItem value="income">Thu nhập</MenuItem>
                  <MenuItem value="expense">Chi tiêu</MenuItem>
                </TextField>
                {isEditing && category?.is_default && (
                  <Typography variant="caption" color="text.secondary">
                    Type cannot be changed for default categories
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/categories')}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : isEditing ? (
                    'Cập nhật danh mục'
                  ) : (
                    'Thêm danh mục'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CategoryForm;