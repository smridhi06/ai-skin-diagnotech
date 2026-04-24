import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const ML_URL =
  process.env.REACT_APP_ML_URL || 'http://localhost:8000';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateMedicalHistory: (data) => api.put('/users/medical-history', data),
  updatePreferences: (data) => api.put('/users/preferences', data),
  deleteAccount: () => api.delete('/users/account'),
};

// Scan APIs
export const scanAPI = {
  createScan: (formData) => api.post('/scans', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getScans: (page = 1, limit = 10) => api.get(`/scans?page=${page}&limit=${limit}`),
  getScanById: (id) => api.get(`/scans/${id}`),
  updateSymptoms: (id, data) => api.put(`/scans/${id}/symptoms`, data),
  analyzeScan: (id) => api.post(`/scans/${id}/analyze`),
  submitFeedback: (id, data) => api.put(`/scans/${id}/feedback`, data),
  deleteScan: (id) => api.delete(`/scans/${id}`),
  getStats: () => api.get('/scans/stats/overview'),
};

// Doctor APIs
export const doctorAPI = {
  getDoctors: (params = {}) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  registerAsDoctor: (data) => api.post('/doctors/register', data),
  reviewDoctor: (id, data) => api.post(`/doctors/${id}/review`, data),
};

// ML Service APIs
export const mlAPI = {
  checkHealth: () => axios.get(`${ML_URL}/health`),
  getConditions: () => axios.get(`${ML_URL}/conditions`),
  getModelInfo: () => axios.get(`${ML_URL}/model-info`),
  checkQuality: (formData) => axios.post(`${ML_URL}/check-quality`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  predict: (formData) => axios.post(`${ML_URL}/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  getScans: (page = 1) => api.get(`/admin/scans?page=${page}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;