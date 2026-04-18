import React from 'react';
import {
  AppBar, Toolbar, Typography, IconButton,
  Badge, Box, Chip
} from '@mui/material';
import { Notifications, Settings } from '@mui/icons-material';

const Navbar = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'white',
        color: '#333',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2, ml: '260px' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
            Dashboard
          </Typography>
          <Chip
            label="NOT A MEDICAL DIAGNOSIS"
            size="small"
            sx={{
              backgroundColor: '#fff3e0',
              color: '#e65100',
              fontWeight: 'bold',
              fontSize: '0.65rem'
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label="API: Online"
            size="small"
            sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}
          />
          <Chip
            label="ML: Online"
            size="small"
            sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}
          />
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton color="inherit">
            <Settings />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;