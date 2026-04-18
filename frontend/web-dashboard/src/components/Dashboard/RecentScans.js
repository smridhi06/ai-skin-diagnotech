import React from 'react';
import {
  Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Box
} from '@mui/material';
import { formatDate, getUrgencyColor } from '../../utils/helpers';

const RecentScans = ({ scans }) => {
  const displayScans = scans?.length > 0 ? scans : [
    { _id: '1', createdAt: new Date(), aiAnalysis: { primaryCondition: { name: 'Acne Vulgaris', confidence: 0.87 } }, urgencyLevel: 'medium', status: 'analyzed' },
    { _id: '2', createdAt: new Date(), aiAnalysis: { primaryCondition: { name: 'Eczema', confidence: 0.92 } }, urgencyLevel: 'low', status: 'analyzed' },
    { _id: '3', createdAt: new Date(), aiAnalysis: { primaryCondition: { name: 'Psoriasis', confidence: 0.78 } }, urgencyLevel: 'medium', status: 'analyzed' },
  ];

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Recent Scans
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f6fa' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Condition</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Confidence</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Urgency</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayScans.map((scan) => (
              <TableRow key={scan._id} hover sx={{ cursor: 'pointer' }}>
                <TableCell>{formatDate(scan.createdAt)}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  {scan.aiAnalysis?.primaryCondition?.name || 'Pending'}
                </TableCell>
                <TableCell>
                  {scan.aiAnalysis?.primaryCondition?.confidence
                    ? `${(scan.aiAnalysis.primaryCondition.confidence * 100).toFixed(1)}%`
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={scan.urgencyLevel?.toUpperCase() || 'N/A'}
                    size="small"
                    sx={{
                      backgroundColor: `${getUrgencyColor(scan.urgencyLevel)}20`,
                      color: getUrgencyColor(scan.urgencyLevel),
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip label={scan.status || 'pending'} size="small" color="primary" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RecentScans;