import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container, Box, Typography, TextField, Button, Grid,
  Link, Paper, Avatar, CssBaseline
} from '@mui/material';
import { LockReset } from '@mui/icons-material';
import { forgotPassword, clearError, clearMessage } from '../../store/slices/authSlice';
import AlertMessage from '../../components/Common/AlertMessage';
import Loader from '../../components/Common/Loader';

const ForgotPassword = () => {
  const [alertOpen, setAlertOpen] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector(state => state.auth);

  useEffect(() => {
    // Show alert if there's an error or message
    if (error || message) {
      setAlertOpen(true);
    }

    // Clean up on unmount
    return () => {
      dispatch(clearError());
      dispatch(clearMessage());
    };
  }, [error, message, dispatch]);

  const handleAlertClose = () => {
    setAlertOpen(false);
    dispatch(clearError());
    dispatch(clearMessage());
  };

  // Form validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required')
  });

  // Form handling with formik
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(forgotPassword(values.email));
    }
  });

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockReset />
        </Avatar>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        {loading && <Loader />}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            Send Reset Link
          </Button>
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to login
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <AlertMessage
        open={alertOpen}
        handleClose={handleAlertClose}
        severity={error ? 'error' : 'success'}
        message={error || message}
      />
    </Container>
  );
};

export default ForgotPassword;