import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography,
  Box, Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Assessment, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

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
      background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)'
    }}>
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ p: 5, borderRadius: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Assessment sx={{ fontSize: 50, color: '#1a237e' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mt: 1 }}>
              AI Skin DiagnoTech
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              AI-Powered Skin Condition Diagnosis
            </Typography>
          </Box>

          {/* Disclaimer */}
          <Alert severity="info" sx={{ mb: 3, fontSize: '0.75rem' }}>
            This tool provides preliminary guidance only. Not a substitute for professional medical diagnosis.
          </Alert>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><Email color="action" /></InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><Lock color="action" /></InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1a237e, #1565c0)',
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(45deg, #0d47a1, #1976d2)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#1a237e', fontWeight: 'bold', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;