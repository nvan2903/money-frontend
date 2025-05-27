import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box, Typography, Paper, Grid, TextField, Button, MenuItem,
  CircularProgress, Alert, FormControl, FormHelperText,
} from '@mui/material';
import {
  addTransaction,
  fetchTransaction,
  updateTransaction,
  clearTransactionError
} from '../../store/slices/transactionSlice';
import { fetchCategories } from '../../store/slices/categorySlice';

const TransactionForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { transaction, loading, error, success } = useSelector(state => state.transactions);
  const { 
    incomeCategories, 
    expenseCategories, 
    loading: categoriesLoading 
  } = useSelector(state => state.categories);
  
  const [selectedType, setSelectedType] = useState('expense');  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Form validation schema
  const validationSchema = Yup.object({
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .typeError('Amount must be a number'),
    type: Yup.string().required('Type is required').oneOf(['income', 'expense']),
    category_id: Yup.string().required('Category is required'),
    date: Yup.date()
      .required('Date is required')
      .max(new Date(), 'Date cannot be in the future')
      .typeError('Invalid date'),
    note: Yup.string()
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      amount: '',
      type: 'expense',
      category_id: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    },
    validationSchema,
    onSubmit: (values) => {
      if (isEditing) {
        dispatch(updateTransaction({ id, transactionData: values }));
      } else {
        dispatch(addTransaction(values));
      }
      setFormSubmitted(true);
    }
  });
  
  // Load data when component mounts
  useEffect(() => {
    dispatch(fetchCategories());
    
    if (isEditing) {
      dispatch(fetchTransaction(id));
    }
    
    // Clear any error messages when component unmounts
    return () => {
      dispatch(clearTransactionError());
    };
  }, [dispatch, id, isEditing]);
      // Keep a reference to the latest formik instance
  const formikRef = useRef(formik);
  formikRef.current = formik;
  
  // Set form values when editing and transaction data is fetched
  useEffect(() => {
    if (isEditing && transaction) {
      formikRef.current.setValues({
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.category_id,
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
        note: transaction.note || ''
      });
      setSelectedType(transaction.type);
    }
  }, [isEditing, transaction]);
    // Redirect after successful submission
  useEffect(() => {
    if (success && formSubmitted) {
      navigate('/transactions');
    }
  }, [success, formSubmitted, navigate]);
  
  // Handle type change to reset category selection
  const handleTypeChange = (event) => {
    const type = event.target.value;
    setSelectedType(type);
    formik.setFieldValue('type', type);
    formik.setFieldValue('category_id', '');
  };
  
  // Get categories based on selected type
  const categories = selectedType === 'income' ? incomeCategories : expenseCategories;
  
  // Loading indicator
  if ((isEditing && !transaction && loading) || categoriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="type"
                name="type"
                label="Transaction Type"
                select
                value={formik.values.type}
                onChange={handleTypeChange}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="amount"
                name="amount"
                label="Amount"
                type="number"
                value={formik.values.amount}
                onChange={formik.handleChange}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                InputProps={{
                  startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.category_id && Boolean(formik.errors.category_id)}
              >
                <TextField
                  id="category_id"
                  name="category_id"
                  label="Category"
                  select
                  value={formik.values.category_id}
                  onChange={formik.handleChange}
                  error={formik.touched.category_id && Boolean(formik.errors.category_id)}
                >
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      {`No ${selectedType} categories found. Please create one first.`}
                    </MenuItem>
                  )}
                </TextField>
                {formik.touched.category_id && formik.errors.category_id && (
                  <FormHelperText>{formik.errors.category_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="date"
                name="date"
                label="Date"
                type="date"
                value={formik.values.date}
                onChange={formik.handleChange}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="note"
                name="note"
                label="Note (optional)"
                value={formik.values.note}
                onChange={formik.handleChange}
                error={formik.touched.note && Boolean(formik.errors.note)}
                helperText={formik.touched.note && formik.errors.note}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/transactions')}
              >
                Cancel
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
                  'Update Transaction'
                ) : (
                  'Add Transaction'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TransactionForm;