import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box, Typography, Grid, TextField, Button, Alert,
  CircularProgress, Container, Card, CardContent,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { 
  AccountCircle as ProfileIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Import user slice actions
import { 
  fetchProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  clearUserError,
  clearUserMessage,
  resetUserState // Import resetUserState
} from '../../store/slices/userSlice';
import { logout } from '../../store/slices/authSlice'; // Import logout from authSlice

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error, success, message, accountDeleted } = useSelector(state => state.user);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    // Load user profile
  useEffect(() => {
    dispatch(fetchProfile());
    
    // Clear any success/error messages when component unmounts
    return () => {
      dispatch(clearUserError());
      dispatch(clearUserMessage());
    };
  }, [dispatch]);
  
  // Handle success message display
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearUserMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Effect to handle account deletion
  useEffect(() => {
    if (accountDeleted) {
      dispatch(logout());
      // Optionally, redirect to login page or home page
      // This might be handled by a top-level component observing isAuthenticated state
      // For now, we'll also reset user state here as an immediate action.
      dispatch(resetUserState()); 
    }
  }, [accountDeleted, dispatch]);
  
  // Profile form validation
  const profileFormik = useFormik({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required')
    }),    onSubmit: (values) => {
      dispatch(updateProfile(values));
    }
  });
  
  // Password form validation
  const passwordFormik = useFormik({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    },
    validationSchema: Yup.object({
      current_password: Yup.string().required('Current password is required'),
      new_password: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters'),
      confirm_password: Yup.string()
        .oneOf([Yup.ref('new_password')], 'Passwords must match')
        .required('Please confirm your new password')
    }),    onSubmit: (values, { resetForm }) => {
      dispatch(changePassword({
        current_password: values.current_password,
        new_password: values.new_password
      }));
      setPasswordDialogOpen(false);
      resetForm();
    }
  });
  
  // Delete account form
  const deleteFormik = useFormik({
    initialValues: {
      password: ''
    },
    validationSchema: Yup.object({
      password: Yup.string().required('Password is required to delete your account')
    }),    onSubmit: (values, { resetForm }) => {
      dispatch(deleteAccount(values.password));
      setDeleteDialogOpen(false);
      resetForm();
    }
  });
  
  // Handle password dialog
  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
  };
  
  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    passwordFormik.resetForm();
  };
  
  // Handle delete account dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    deleteFormik.resetForm();
  };
  
  // Loading state
  if (loading && !user) {
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
          Profile Settings
        </Typography>
        
        {/* Success message */}
        {success && message && (
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
        
        {/* Profile Information */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ProfileIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Account Information</Typography>
            </Box>
            <form onSubmit={profileFormik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="first_name"
                    name="first_name"
                    label="First Name"
                    value={profileFormik.values.first_name}
                    onChange={profileFormik.handleChange}
                    error={profileFormik.touched.first_name && Boolean(profileFormik.errors.first_name)}
                    helperText={profileFormik.touched.first_name && profileFormik.errors.first_name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="last_name"
                    name="last_name"
                    label="Last Name"
                    value={profileFormik.values.last_name}
                    onChange={profileFormik.handleChange}
                    error={profileFormik.touched.last_name && Boolean(profileFormik.errors.last_name)}
                    helperText={profileFormik.touched.last_name && profileFormik.errors.last_name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    value={profileFormik.values.email}
                    onChange={profileFormik.handleChange}
                    error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                    helperText={profileFormik.touched.email && profileFormik.errors.email}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
        
        {/* Password Change */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Security</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Change your password to keep your account secure.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleOpenPasswordDialog}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
        
        {/* Delete Account */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DeleteIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" color="error">Danger Zone</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Once you delete your account, there is no going back. Please be certain.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={handleOpenDeleteDialog}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </Box>
      
      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        aria-labelledby="password-dialog-title"
      >
        <form onSubmit={passwordFormik.handleSubmit}>
          <DialogTitle id="password-dialog-title">Change Password</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              To change your password, please enter your current password and then your new password.
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="current_password"
                  name="current_password"
                  label="Current Password"
                  type="password"
                  value={passwordFormik.values.current_password}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.current_password && Boolean(passwordFormik.errors.current_password)}
                  helperText={passwordFormik.touched.current_password && passwordFormik.errors.current_password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="new_password"
                  name="new_password"
                  label="New Password"
                  type="password"
                  value={passwordFormik.values.new_password}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.new_password && Boolean(passwordFormik.errors.new_password)}
                  helperText={passwordFormik.touched.new_password && passwordFormik.errors.new_password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="confirm_password"
                  name="confirm_password"
                  label="Confirm New Password"
                  type="password"
                  value={passwordFormik.values.confirm_password}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.confirm_password && Boolean(passwordFormik.errors.confirm_password)}
                  helperText={passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordDialog} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Change Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <form onSubmit={deleteFormik.handleSubmit}>
          <DialogTitle id="delete-dialog-title" color="error">
            Delete Account
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Warning: This action cannot be undone. All of your data, including transactions and categories, will be permanently deleted.
              To confirm deletion, please enter your password.
            </DialogContentText>
            <TextField
              fullWidth
              margin="dense"
              id="password"
              name="password"
              label="Password"
              type="password"
              value={deleteFormik.values.password}
              onChange={deleteFormik.handleChange}
              error={deleteFormik.touched.password && Boolean(deleteFormik.errors.password)}
              helperText={deleteFormik.touched.password && deleteFormik.errors.password}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="error" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Delete My Account'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Profile;