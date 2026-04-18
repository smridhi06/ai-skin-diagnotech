import React, { useState, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Stepper, Step,
  StepLabel, Alert, CircularProgress, Chip, Grid,
  FormControl, InputLabel, Select, MenuItem, Slider,
  FormControlLabel, Checkbox, Card, CardContent
} from '@mui/material';
import { CloudUpload, CheckCircle, CameraAlt } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { mlAPI } from '../../services/api';
import ScanResult from './ScanResult';

const steps = ['Upload Photo', 'Symptom Questions', 'AI Analysis', 'Results'];

const NewScan = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [quality, setQuality] = useState(null);
  const [symptoms, setSymptoms] = useState({
    duration: '', spreading: '', painLevel: 3,
    itching: '', bleeding: false, fever: false,
    bodyPart: '', specificArea: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));

    // Check quality
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await mlAPI.checkQuality(formData);
      setQuality(res.data);
    } catch (err) {
      console.error('Quality check failed:', err);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setActiveStep(2);

    try {
      const formData = new FormData();
      formData.append('file', image);

      const res = await mlAPI.predict(formData);
      setResult(res.data);
      setActiveStep(3);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      setActiveStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setImage(null);
    setPreview(null);
    setQuality(null);
    setSymptoms({ duration: '', spreading: '', painLevel: 3, itching: '', bleeding: false, fever: false, bodyPart: '', specificArea: '' });
    setResult(null);
    setError('');
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
        New Skin Analysis
      </Typography>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Disclaimer:</strong> This provides PRELIMINARY guidance only. NOT a medical diagnosis. Always consult a dermatologist.
      </Alert>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Step 1: Upload */}
      {activeStep === 0 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Box {...getRootProps()} sx={{
            border: '2px dashed', borderColor: isDragActive ? '#1a237e' : '#bdbdbd',
            borderRadius: 3, p: 5, textAlign: 'center', cursor: 'pointer',
            backgroundColor: isDragActive ? '#e8eaf6' : '#fafafa',
            transition: 'all 0.3s'
          }}>
            <input {...getInputProps()} />
            {preview ? (
              <Box>
                <img src={preview} alt="Preview" style={{ maxWidth: '300px', maxHeight: '300px', borderRadius: '12px' }} />
                <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>Click or drag to replace</Typography>
              </Box>
            ) : (
              <Box>
                <CloudUpload sx={{ fontSize: 60, color: '#90caf9' }} />
                <Typography variant="h6" sx={{ mt: 2 }}>Drop your skin image here</Typography>
                <Typography variant="body2" color="text.secondary">or click to browse (JPEG, PNG, max 10MB)</Typography>
              </Box>
            )}
          </Box>

          {quality && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Image Quality Check:</Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Chip label={`Quality: ${(quality.quality_score * 100).toFixed(0)}%`}
                    color={quality.acceptable ? 'success' : 'warning'} />
                </Grid>
                <Grid item xs={9}>
                  {quality.suggestions?.map((s, i) => (
                    <Typography key={i} variant="body2" color="text.secondary">- {s}</Typography>
                  ))}
                </Grid>
              </Grid>
            </Box>
          )}

          {image && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button variant="contained" size="large" onClick={() => setActiveStep(1)}
                sx={{ px: 5, py: 1.5, borderRadius: 2, background: 'linear-gradient(45deg, #1a237e, #1565c0)' }}>
                Continue to Symptoms
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Step 2: Symptoms */}
      {activeStep === 1 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Symptom Questionnaire</Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>How long have you had this?</InputLabel>
                <Select value={symptoms.duration} label="How long have you had this?"
                  onChange={(e) => setSymptoms({ ...symptoms, duration: e.target.value })}>
                  <MenuItem value="less_than_week">Less than 1 week</MenuItem>
                  <MenuItem value="1-2_weeks">1-2 weeks</MenuItem>
                  <MenuItem value="2-4_weeks">2-4 weeks</MenuItem>
                  <MenuItem value="over_month">Over a month</MenuItem>
                  <MenuItem value="several_months">Several months</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Is it spreading?</InputLabel>
                <Select value={symptoms.spreading} label="Is it spreading?"
                  onChange={(e) => setSymptoms({ ...symptoms, spreading: e.target.value })}>
                  <MenuItem value="yes_rapidly">Yes, rapidly</MenuItem>
                  <MenuItem value="yes_slowly">Yes, slowly</MenuItem>
                  <MenuItem value="no_change">No change</MenuItem>
                  <MenuItem value="getting_smaller">Getting smaller</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Body Part</InputLabel>
                <Select value={symptoms.bodyPart} label="Body Part"
                  onChange={(e) => setSymptoms({ ...symptoms, bodyPart: e.target.value })}>
                  <MenuItem value="face">Face</MenuItem>
                  <MenuItem value="scalp">Scalp</MenuItem>
                  <MenuItem value="neck">Neck</MenuItem>
                  <MenuItem value="chest">Chest</MenuItem>
                  <MenuItem value="back">Back</MenuItem>
                  <MenuItem value="arms">Arms</MenuItem>
                  <MenuItem value="hands">Hands</MenuItem>
                  <MenuItem value="legs">Legs</MenuItem>
                  <MenuItem value="feet">Feet</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Itching Level</InputLabel>
                <Select value={symptoms.itching} label="Itching Level"
                  onChange={(e) => setSymptoms({ ...symptoms, itching: e.target.value })}>
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="mild">Mild</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="severe">Severe</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Pain Level: {symptoms.painLevel}/10</Typography>
              <Slider value={symptoms.painLevel} onChange={(e, v) => setSymptoms({ ...symptoms, painLevel: v })}
                min={0} max={10} step={1} marks valueLabelDisplay="auto"
                sx={{ color: symptoms.painLevel > 7 ? '#e74c3c' : symptoms.painLevel > 4 ? '#f39c12' : '#27ae60' }} />
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel control={<Checkbox checked={symptoms.bleeding} onChange={(e) => setSymptoms({ ...symptoms, bleeding: e.target.checked })} />}
                label="Bleeding" />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel control={<Checkbox checked={symptoms.fever} onChange={(e) => setSymptoms({ ...symptoms, fever: e.target.checked })} />}
                label="Fever" />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => setActiveStep(0)} sx={{ px: 4 }}>Back</Button>
            <Button variant="contained" onClick={handleAnalyze}
              sx={{ px: 5, py: 1.5, background: 'linear-gradient(45deg, #1a237e, #1565c0)' }}>
              Analyze with AI
            </Button>
          </Box>
        </Paper>
      )}

      {/* Step 3: Loading */}
      {activeStep === 2 && (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, textAlign: 'center', border: '1px solid #e0e0e0' }}>
          <CircularProgress size={80} sx={{ color: '#1a237e' }} />
          <Typography variant="h5" sx={{ mt: 3, fontWeight: 600 }}>Analyzing Your Image...</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Our AI models are processing your skin image
          </Typography>
        </Paper>
      )}

      {/* Step 4: Results */}
      {activeStep === 3 && result && (
        <ScanResult result={result} onReset={handleReset} />
      )}
    </Box>
  );
};

export default NewScan;