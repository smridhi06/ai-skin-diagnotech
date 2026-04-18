import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography,
  Box, Alert, CircularProgress, MenuItem, Grid
} from '@mui/material';
import { Assessment } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    age: '', gender: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...submitData } = formData;
    submitData.age = parseInt(submitData.age);

    const result = await register(submitData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Assessment sx={{ fontSize: 40, color: '#1a237e' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              Create Account
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
            This tool provides preliminary guidance only.
          </Alert>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required sx={{ mb: 2 }} />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="9876543210" />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField fullWidth label="Age" name="age" type="number" value={formData.age} onChange={handleChange} required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth select label="Gender" name="gender" value={formData.gender} onChange={handleChange} required>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required sx={{ mb: 3 }} />

            <Button type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ py: 1.5, fontWeight: 'bold', background: 'linear-gradient(45deg, #1a237e, #1565c0)', borderRadius: 2 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1a237e', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;