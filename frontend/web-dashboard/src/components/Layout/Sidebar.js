import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Typography, Box, Divider, Avatar
} from '@mui/material';
import {
  Dashboard, CameraAlt, History, LocalHospital,
  Person, ExitToApp, Assessment
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'New Scan', icon: <CameraAlt />, path: '/scan' },
  { text: 'Scan History', icon: <History />, path: '/history' },
  { text: 'Find Doctors', icon: <LocalHospital />, path: '/doctors' },
  { text: 'My Profile', icon: <Person />, path: '/profile' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)',
          color: 'white',
          borderRight: 'none'
        },
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Assessment sx={{ fontSize: 40, color: '#64b5f6' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1, color: 'white' }}>
          AI Skin DiagnoTech
        </Typography>
        <Typography variant="caption" sx={{ color: '#90caf9' }}>
          AI-Powered Skin Diagnosis
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mx: 2 }} />

      {/* User Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#64b5f6', width: 40, height: 40 }}>
          {user?.fullName?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
            {user?.fullName || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#90caf9' }}>
            {user?.role || 'user'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mx: 2 }} />

      {/* Navigation Menu */}
      <List sx={{ px: 1, mt: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              mx: 1,
              backgroundColor: location.pathname === item.path
                ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      {/* Logout */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mb: 2 }} />
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ListItemIcon sx={{ color: '#ef5350', minWidth: 40 }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: '#ef5350' }} />
        </ListItem>

        {/* Disclaimer */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
          <Typography variant="caption" sx={{ color: '#ffab91', fontSize: '0.65rem' }}>
            This tool provides preliminary guidance only. Always consult a qualified dermatologist.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;