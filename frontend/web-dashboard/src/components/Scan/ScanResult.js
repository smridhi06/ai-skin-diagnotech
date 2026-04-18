import React from 'react';
import {
  Paper, Typography, Box, Grid, Chip, Button,
  LinearProgress, Alert, Card, CardContent, Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  CheckCircle, Warning, LocalHospital, Refresh,
  Healing, Block, ArrowForward
} from '@mui/icons-material';
import { getUrgencyColor } from '../../utils/helpers';

const ScanResult = ({ result, onReset }) => {
  if (!result) return null;

  const urgencyColor = getUrgencyColor(result.urgency?.level);

  return (
    <Box>
      {/* Critical Disclaimer */}
      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>IMPORTANT:</strong> {result.disclaimer || 'This is a PRELIMINARY assessment only. NOT a substitute for professional medical diagnosis.'}
      </Alert>

      {/* Primary Result */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3 }}>
          Analysis Results
        </Typography>

        <Card sx={{ mb: 3, border: `2px solid ${urgencyColor}20`, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Most Likely Condition</Typography>
              <Chip label={`${result.urgency?.level?.toUpperCase()} URGENCY`}
                sx={{ backgroundColor: `${urgencyColor}20`, color: urgencyColor, fontWeight: 'bold' }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
              {result.primary?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {result.primary?.description}
            </Typography>

            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Confidence</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {(result.primary?.confidence * 100).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={result.primary?.confidence * 100}
                sx={{ height: 10, borderRadius: 5, backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': { borderRadius: 5, backgroundColor: '#1a237e' } }} />
            </Box>
          </CardContent>
        </Card>

        {/* Alternative Conditions */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Other Possibilities:</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {result.alternatives?.map((alt, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{alt.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(alt.confidence * 100).toFixed(1)}% confidence
                  </Typography>
                  <LinearProgress variant="determinate" value={alt.confidence * 100}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recommendations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Healing color="primary" /> Home Care Tips
            </Typography>
            <List dense>
              {result.recommendations?.home_care?.map((tip, i) => (
                <ListItem key={i}>
                  <ListItemIcon><CheckCircle sx={{ color: '#27ae60', fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Block color="error" /> Things to Avoid
            </Typography>
            <List dense>
              {result.recommendations?.avoid?.map((item, i) => (
                <ListItem key={i}>
                  <ListItemIcon><Warning sx={{ color: '#e74c3c', fontSize: 20 }} /></ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<LocalHospital />} size="large"
          sx={{ px: 4, py: 1.5, borderRadius: 2, background: 'linear-gradient(45deg, #1a237e, #1565c0)' }}>
          Find Dermatologists
        </Button>
        <Button variant="outlined" startIcon={<Refresh />} onClick={onReset} size="large"
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}>
          New Scan
        </Button>
      </Box>

      {/* Processing Info */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Processed in {result.processing_time_ms}ms | {result.timestamp} | {result.note}
        </Typography>
      </Box>
    </Box>
  );
};

export default ScanResult;