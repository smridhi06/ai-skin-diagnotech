import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  TablePagination, Alert
} from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { scanAPI } from '../../services/api';
import { formatDate, getUrgencyColor } from '../../utils/helpers';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [page, setPage] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, [page]);

  const loadScans = async () => {
    try {
      const res = await scanAPI.getScans(page + 1, 10);
      setScans(res.data.data || []);
      setTotalScans(res.data.pagination?.totalScans || 0);
    } catch (error) {
      console.error('Failed to load scans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3 }}>
        Scan History
      </Typography>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        All scans are encrypted and stored securely. Data is auto-deleted after 30 days.
      </Alert>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f6fa' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Body Part</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Condition</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Confidence</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Urgency</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scans.length > 0 ? scans.map((scan) => (
                <TableRow key={scan._id} hover>
                  <TableCell>{formatDate(scan.createdAt)}</TableCell>
                  <TableCell>{scan.location?.bodyPart || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {scan.aiAnalysis?.primaryCondition?.name || 'Pending'}
                  </TableCell>
                  <TableCell>
                    {scan.aiAnalysis?.primaryCondition?.confidence
                      ? `${(scan.aiAnalysis.primaryCondition.confidence * 100).toFixed(1)}%`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip label={scan.urgencyLevel?.toUpperCase() || 'N/A'} size="small"
                      sx={{ backgroundColor: `${getUrgencyColor(scan.urgencyLevel)}20`,
                        color: getUrgencyColor(scan.urgencyLevel), fontWeight: 'bold' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={scan.status} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary"><Visibility /></IconButton>
                    <IconButton size="small" color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5 }}>
                    <Typography color="text.secondary">No scans yet. Start your first analysis!</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={totalScans} page={page} rowsPerPage={10}
          onPageChange={(e, p) => setPage(p)} rowsPerPageOptions={[10]}
        />
      </Paper>
    </Box>
  );
};

export default ScanHistory;