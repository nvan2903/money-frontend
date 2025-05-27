import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Paper, Alert, Avatar,
  TextField, CircularProgress
} from '@mui/material';
import { Email, CheckCircle } from '@mui/icons-material';
import { authService } from '../../services/authService';

const EmailVerificationRequired = ({ email, onResendSuccess }) => {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage('');
    setResendError('');

    try {
      await authService.resendVerification(email);
      setResendMessage('Email xác thực đã được gửi lại thành công!');
      if (onResendSuccess) {
        onResendSuccess();
      }
    } catch (error) {
      setResendError(error.message || 'Không thể gửi lại email xác thực.');
    } finally {
      setResendLoading(false);
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
          alignItems: 'center'
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            mb: 2
          }}
        >
          <Email sx={{ fontSize: 40 }} />
        </Avatar>
        
        <Typography component="h1" variant="h4" gutterBottom>
          Xác thực Email
        </Typography>
        
        <Typography variant="h6" gutterBottom color="success.main">
          Đăng ký thành công!
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
          Chúng tôi đã gửi một liên kết xác thực đến email <strong>{email}</strong>.
          Vui lòng kiểm tra hộp thư và nhấp vào liên kết để xác thực tài khoản của bạn.
        </Alert>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Không nhận được email?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Kiểm tra thư mục spam hoặc nhấp vào nút bên dưới để gửi lại
          </Typography>
          
          {resendMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {resendMessage}
            </Alert>
          )}
          
          {resendError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {resendError}
            </Alert>
          )}
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleResendVerification}
            disabled={resendLoading}
            sx={{ mb: 2 }}
          >
            {resendLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Đang gửi...
              </>
            ) : (
              'Gửi lại email xác thực'
            )}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Sau khi xác thực email, bạn có thể đăng nhập vào tài khoản.
          </Typography>
          
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            color="primary"
            size="large"
          >
            Đến trang đăng nhập
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailVerificationRequired;
