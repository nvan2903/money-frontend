import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container, Box, Typography, TextField, Button, Grid,
  Link, Paper, Avatar, CssBaseline, InputAdornment, IconButton
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { login, clearError, clearMessage, resendVerification } from '../../store/slices/authSlice';
import AlertMessage from '../../components/Common/AlertMessage';
import Loader from '../../components/Common/Loader';
import { authService } from '../../services/authService';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message, isAuthenticated, emailVerificationRequired, unverifiedEmail: storeUnverifiedEmail } = useSelector(state => state.auth);
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }    // Show alert if there's an error or message
    if (error || message) {
      setAlertOpen(true);
    }

    // Check if email verification is required
    if (emailVerificationRequired && storeUnverifiedEmail) {
      setShowResendVerification(true);
      setUnverifiedEmail(storeUnverifiedEmail);
    }

    // Clean up on unmount
    return () => {
      dispatch(clearError());
      dispatch(clearMessage());    };
  }, [isAuthenticated, error, message, emailVerificationRequired, storeUnverifiedEmail, navigate, dispatch]);

  const handleAlertClose = () => {
    setAlertOpen(false);
    dispatch(clearError());
    dispatch(clearMessage());
    setShowResendVerification(false);
  };  const handleResendVerification = async () => {
    const emailToUse = unverifiedEmail || storeUnverifiedEmail;
    if (!emailToUse) return;
    
    setResendLoading(true);
    try {
      dispatch(resendVerification(emailToUse));
    } finally {
      setResendLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Form validation schema
  const validationSchema = Yup.object({
    username: Yup.string()
      .required('Username or email is required'),
    password: Yup.string()
      .required('Password is required')
  });

  // Form handling with formik
  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema,    onSubmit: (values) => {
      setUnverifiedEmail(values.username); // Store for potential resend verification
      dispatch(login(values));
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
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>

        {loading && <Loader />}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username or Email"
            name="username"
            autoComplete="username"
            autoFocus
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>      <AlertMessage
        open={alertOpen}
        handleClose={handleAlertClose}
        severity={error ? 'error' : 'success'}
        message={error || message}
      />

      {/* Resend verification dialog/section */}
      {showResendVerification && (
        <Paper 
          elevation={2} 
          sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: '#fff3e0',
            border: '1px solid #ffb74d' 
          }}
        >
          <Typography variant="body2" gutterBottom>
            Email chưa được xác thực? 
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleResendVerification}
            disabled={resendLoading}
            sx={{ mt: 1 }}
          >
            {resendLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default Login;