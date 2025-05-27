import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Paper, CircularProgress,
  Alert, Avatar
} from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';
import { authService } from '../../services/authService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationStatus('error');
      setMessage('Thiếu token xác thực. Vui lòng kiểm tra lại liên kết từ email.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);
  const verifyEmail = async (token) => {
    try {
      const response = await authService.verifyEmail(token);
      setVerificationStatus('success');
      setMessage(response.data?.message || response.message || 'Email đã được xác thực thành công!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Email đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.' }
        });
      }, 3000);
    } catch (error) {
      setVerificationStatus('error');
      
      // Handle different error cases
      const errorMessage = error.response?.data?.message || error.message || 'Không thể xác thực email';
      
      if (errorMessage.includes('already been used')) {
        setMessage('Liên kết xác thực đã được sử dụng. Bạn có thể đăng nhập ngay bây giờ.');
      } else if (errorMessage.includes('expired')) {
        setMessage('Liên kết xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.');
      } else if (errorMessage.includes('already verified')) {
        setMessage('Email đã được xác thực trước đó. Bạn có thể đăng nhập ngay bây giờ.');
        // Redirect to login for already verified case
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Email đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.' }
          });
        }, 2000);
      } else {
        setMessage(errorMessage);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Vui lòng nhập email để gửi lại liên kết xác thực.');
      return;
    }

    setResendLoading(true);
    try {
      await authService.resendVerification(email);
      setMessage('Liên kết xác thực mới đã được gửi đến email của bạn.');
    } catch (error) {
      setMessage(error.message || 'Không thể gửi lại email xác thực.');
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">
              Đang xác thực email...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng đợi trong giây lát.
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box textAlign="center">
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'success.main',
                mx: 'auto',
                mb: 2
              }}
            >
              <CheckCircle sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" gutterBottom color="success.main">
              Xác thực thành công!
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Bạn sẽ được chuyển hướng đến trang đăng nhập trong 3 giây...
            </Typography>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              color="primary"
              size="large"
            >
              Đăng nhập ngay
            </Button>
          </Box>
        );

      case 'error':
        return (
          <Box textAlign="center">
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'error.main',
                mx: 'auto',
                mb: 2
              }}
            >
              <Error sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" gutterBottom color="error.main">
              Xác thực thất bại
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {message}
            </Alert>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Bạn có thể thử:
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '12px'
                  }}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  sx={{ mr: 1 }}
                >
                  {resendLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                </Button>
              </Box>
              
              <Button
                component={RouterLink}
                to="/register"
                variant="outlined"
                color="secondary"
                sx={{ mr: 1 }}
              >
                Đăng ký lại
              </Button>
              
              <Button
                component={RouterLink}
                to="/login"
                variant="text"
              >
                Về trang đăng nhập
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          marginBottom: 4,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '400px',
          justifyContent: 'center'
        }}
      >
        <Avatar
          sx={{
            width: 60,
            height: 60,
            bgcolor: 'primary.main',
            mb: 2
          }}
        >
          <Email sx={{ fontSize: 30 }} />
        </Avatar>
        
        <Typography component="h1" variant="h4" gutterBottom>
          Xác thực Email
        </Typography>
        
        {renderContent()}
      </Paper>
    </Container>
  );
};

export default VerifyEmail;
