import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const Loader = ({ size = 40, color = 'primary', fullscreen = false }) => {
  if (fullscreen) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          bgcolor: 'rgba(255, 255, 255, 0.7)'
        }}
      >
        <CircularProgress size={size} color={color} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 3 
      }}
    >
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

export default Loader;