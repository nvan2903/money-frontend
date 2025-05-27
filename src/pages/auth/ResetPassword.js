import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container, Box, Typography, TextField, Button, Grid,
  Link, Paper, Avatar, CssBaseline, InputAdornment, IconButton
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { resetPassword, clearError, clearMessage } from '../../store/slices/authSlice';
import AlertMessage from '../../components/Common/AlertMessage';
import Loader from '../../components/Common/Loader';

// Helper function to get query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useSelector(state => state.auth);
  const query = useQuery();
  const token = query.get('token');

  useEffect(() => {
    // Redirect if no token is provided
    if (!token) {
      navigate('/forgot-password');
    }

    // Show alert if there's an error or message
    if (error || message) {
      setAlertOpen(true);
      // If password reset was successful, redirect to login after showing the message
      if (message && message.includes('successful')) {
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    }

    // Clean up on unmount
    return () => {
      dispatch(clearError());
      dispatch(clearMessage());
    };
  }, [token, error, message, navigate, dispatch]);

  const handleAlertClose = () => {
    setAlertOpen(false);
    dispatch(clearError());
    dispatch(clearMessage());
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Form validation schema
  const validationSchema = Yup.object({
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
        'Password must contain at least one letter and one number'
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  // Form handling with formik
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(resetPassword({ token, password: values.password }));
    }
  });

  if (!token) {
    return <Loader fullscreen />;
  }

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
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>

        {loading && <Loader />}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            Reset Password
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

export default ResetPassword;