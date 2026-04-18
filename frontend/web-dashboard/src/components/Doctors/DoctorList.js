import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Card, CardContent,
  Avatar, Chip, Button, Rating, TextField, Alert
} from '@mui/material';
import { LocalHospital, Phone, VideoCall, LocationOn } from '@mui/icons-material';
import { doctorAPI } from '../../services/api';

const sampleDoctors = [
  { _id: '1', userId: { fullName: 'Dr. Priya Sharma' }, qualifications: { degree: 'MD Dermatology', specialization: 'Dermatology' }, experience: { years: 15 }, currentPractice: { clinicName: 'Skin Care Clinic', address: { city: 'Mumbai' }, consultationFee: { online: 800 } }, ratings: { average: 4.8, count: 230 }, availability: { telemedicine: true }, languages: ['en', 'hi'] },
  { _id: '2', userId: { fullName: 'Dr. Rajesh Mehta' }, qualifications: { degree: 'MD Dermatology', specialization: 'Dermatology' }, experience: { years: 20 }, currentPractice: { clinicName: 'Mehta Skin Hospital', address: { city: 'Delhi' }, consultationFee: { online: 1200 } }, ratings: { average: 4.9, count: 445 }, availability: { telemedicine: true }, languages: ['en', 'hi', 'pa'] },
  { _id: '3', userId: { fullName: 'Dr. Anita Patel' }, qualifications: { degree: 'MD Dermatology', specialization: 'Dermatology' }, experience: { years: 12 }, currentPractice: { clinicName: 'Patel Skin Center', address: { city: 'Pune' }, consultationFee: { online: 600 } }, ratings: { average: 4.7, count: 189 }, availability: { telemedicine: true }, languages: ['en', 'hi', 'mr'] },
];

const DoctorList = () => {
  const [doctors, setDoctors] = useState(sampleDoctors);
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await doctorAPI.getDoctors();
      if (res.data.data?.length > 0) setDoctors(res.data.data);
    } catch (error) {
      console.log('Using sample doctors');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
        Find Dermatologists
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Connect with verified dermatologists near you
      </Typography>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Always consult a qualified dermatologist for proper diagnosis and treatment.
      </Alert>

      <TextField fullWidth label="Search by city" value={searchCity}
        onChange={(e) => setSearchCity(e.target.value)} sx={{ mb: 3 }}
        InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: '#999' }} /> }} />

      <Grid container spacing={3}>
        {doctors.filter(d =>
          !searchCity || d.currentPractice?.address?.city?.toLowerCase().includes(searchCity.toLowerCase())
        ).map((doctor) => (
          <Grid item xs={12} md={6} lg={4} key={doctor._id}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0',
              transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: '#1a237e', fontSize: '1.3rem' }}>
                    {doctor.userId?.fullName?.charAt(0) || 'D'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {doctor.userId?.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doctor.qualifications?.degree}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Rating value={doctor.ratings?.average || 0} precision={0.1} size="small" readOnly />
                  <Typography variant="body2">({doctor.ratings?.count || 0})</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {doctor.experience?.years} years experience
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {doctor.currentPractice?.clinicName} - {doctor.currentPractice?.address?.city}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {doctor.availability?.telemedicine &&
                    <Chip icon={<VideoCall />} label="Online" size="small" color="primary" variant="outlined" />}
                  <Chip label={`Rs ${doctor.currentPractice?.consultationFee?.online || 'N/A'}`}
                    size="small" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }} />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" fullWidth startIcon={<VideoCall />}
                    sx={{ borderRadius: 2, background: 'linear-gradient(45deg, #1a237e, #1565c0)' }}>
                    Consult Online
                  </Button>
                  <Button variant="outlined" sx={{ borderRadius: 2 }}>
                    <Phone />
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DoctorList;