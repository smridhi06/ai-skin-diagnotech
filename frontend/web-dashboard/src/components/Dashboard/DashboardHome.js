import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import StatsCards from './StatsCards';
import Charts from './Charts';
import RecentScans from './RecentScans';
import { scanAPI, mlAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DashboardHome = () => {
  const [stats, setStats] = useState({});
  const [scans, setScans] = useState([]);
  const [mlStatus, setMlStatus] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, scansRes] = await Promise.allSettled([
        scanAPI.getStats(),
        scanAPI.getScans(1, 5)
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (scansRes.status === 'fulfilled') setScans(scansRes.value.data.data);

      // Check ML service
      try {
        const mlRes = await mlAPI.checkHealth();
        setMlStatus(mlRes.data.status);
      } catch {
        setMlStatus('offline');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    }
  };

  return (
    <Box>
      {/* Welcome */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
          Welcome back, {user?.fullName || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your skin health overview
        </Typography>
      </Box>

      {/* Disclaimer */}
      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Important:</strong> This tool provides preliminary AI-based guidance only.
        It is NOT a substitute for professional medical diagnosis.
        Always consult a qualified dermatologist for treatment.
      </Alert>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts */}
      <Charts stats={stats} />

      {/* Recent Scans */}
      <RecentScans scans={scans} />
    </Box>
  );
};

export default DashboardHome;