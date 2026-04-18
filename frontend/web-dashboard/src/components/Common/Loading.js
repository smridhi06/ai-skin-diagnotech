import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <CircularProgress size={60} sx={{ color: '#1a237e' }} />
      <Typography variant="body1" sx={{ mt: 2, color: '#666' }}>{message}</Typography>
    </Box>
  );
};

export default Loading;