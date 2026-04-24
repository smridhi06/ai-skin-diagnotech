import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Grid,
  Avatar, Divider, Alert, Chip
} from '@mui/material';

import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { Save } from '@mui/icons-material';
const ProfilePage = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3 }}>
          My Profile
        </Typography>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#1a237e', fontSize: '2rem' }}>
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{user?.fullName || 'User'}</Typography>
              <Typography color="text.secondary">{user?.email}</Typography>
              <Chip label={user?.role || 'user'} size="small" color="primary" sx={{ mt: 0.5 }} />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {saved && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Full Name" defaultValue={user?.fullName || ''} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" defaultValue={user?.email || ''} disabled />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" defaultValue={user?.phone || ''} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Age" type="number" defaultValue={user?.age || ''} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button variant="contained" startIcon={<Save />}
              onClick={() => setSaved(true)}
              sx={{ px: 4, borderRadius: 2, background: 'linear-gradient(45deg, #1a237e, #1565c0)' }}>
              Save Changes
            </Button>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default ProfilePage;