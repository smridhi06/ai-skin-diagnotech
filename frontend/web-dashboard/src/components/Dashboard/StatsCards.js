import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { CameraAlt, TrendingUp, LocalHospital, Warning } from '@mui/icons-material';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Scans',
      value: stats?.totalScans || 0,
      icon: <CameraAlt />,
      color: '#1a237e',
      bg: '#e8eaf6'
    },
    {
      title: 'Avg Confidence',
      value: `${((stats?.avgConfidence || 0) * 100).toFixed(1)}%`,
      icon: <TrendingUp />,
      color: '#2e7d32',
      bg: '#e8f5e9'
    },
    {
      title: 'Doctors Available',
      value: stats?.doctorsCount || '150+',
      icon: <LocalHospital />,
      color: '#0277bd',
      bg: '#e1f5fe'
    },
    {
      title: 'High Risk Cases',
      value: stats?.urgencyBreakdown?.high || 0,
      icon: <Warning />,
      color: '#c62828',
      bg: '#ffebee'
    }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: card.bg,
              border: `1px solid ${card.color}20`,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" sx={{ color: card.color, fontWeight: 500, mb: 1 }}>
                  {card.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: card.color }}>
                  {card.value}
                </Typography>
              </Box>
              <Box sx={{
                p: 1.5, borderRadius: 2,
                backgroundColor: `${card.color}15`,
                color: card.color
              }}>
                {card.icon}
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;