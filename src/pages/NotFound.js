import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 10,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h1" sx={{ mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Không tìm thấy trang
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
        </Typography>
        <Button
          component={RouterLink}
          to="/dashboard"
          variant="contained"
          color="primary"
          size="large"
        >
          Quay lại bảng điều khiển
        </Button>
      </Container>
    </Box>
  );
};

export default NotFound;