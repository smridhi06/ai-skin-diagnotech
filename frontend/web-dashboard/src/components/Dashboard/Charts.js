import React from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1a237e', '#1565c0', '#42a5f5', '#90caf9', '#bbdefb'];

const Charts = ({ stats }) => {
  const conditionData = stats?.topConditions?.map(c => ({
    name: c._id || 'Unknown',
    value: c.count || 0
  })) || [
    { name: 'Acne', value: 35 },
    { name: 'Eczema', value: 25 },
    { name: 'Psoriasis', value: 18 },
    { name: 'Fungal', value: 12 },
    { name: 'Other', value: 10 }
  ];

  const urgencyData = [
    { name: 'Low', count: stats?.urgencyBreakdown?.low || 45, fill: '#27ae60' },
    { name: 'Medium', count: stats?.urgencyBreakdown?.medium || 35, fill: '#f39c12' },
    { name: 'High', count: stats?.urgencyBreakdown?.high || 20, fill: '#e74c3c' }
  ];

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Top Conditions Detected
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={conditionData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {conditionData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Urgency Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={urgencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {urgencyData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Charts;