import React from 'react';
import { Alert, Typography } from '@mui/material';

const Disclaimer = ({ variant = 'standard' }) => {
  return (
    <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
      <Typography variant="body2">
        <strong>Medical Disclaimer:</strong> This AI tool provides preliminary skin condition guidance only.
        It is NOT a substitute for professional medical diagnosis. Always consult a qualified dermatologist
        for proper examination, diagnosis, and treatment. In case of emergency, seek immediate medical care.
      </Typography>
    </Alert>
  );
};

export default Disclaimer;