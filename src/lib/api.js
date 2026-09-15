import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const signup = data => api.post('/auth/signup', data);
export const login = data => api.post('/auth/login', data);
export const verifyEmail = data => api.post('/auth/verify-email', data);
export const resendEmailOtp = data => api.post('/auth/verify-email/resend', data);
export const logout = () => api.post('/auth/logout');
export const refreshToken = () => api.post('/auth/refresh');
export const forgotPassword = data => api.post('/auth/forgot-password', data);
export const resetPassword = data => api.post('/auth/reset-password', data);
export const changePassword = data => api.post('/auth/change-password', data);

// Forms — per-section saves
export const createDraft = () => api.post('/forms');
export const savePartI = (id, data) => api.patch(`/forms/${id}/part-i`, data);
export const savePartII = (id, data) => api.patch(`/forms/${id}/part-ii`, data);
export const savePartIII = (id, data) => api.patch(`/forms/${id}/part-iii`, data);
export const saveDeposit = (id, data) => api.patch(`/forms/${id}/deposit`, data);
export const saveSignature = (id, data) => api.patch(`/forms/${id}/signature`, data);
export const savePreparer = (id, data) => api.patch(`/forms/${id}/preparer`, data);
export const saveScheduleA = (id, rows) => api.put(`/forms/${id}/schedule-a`, rows);
export const getScheduleA = (id) => api.get(`/forms/${id}/schedule-a`);
export const submitForm = (id, data) => api.post(`/forms/${id}/submit`, data);
export const previewXml = (id) => api.get(`/forms/${id}/preview-xml`, { responseType: 'text' });
export const getMyForms = () => api.get('/forms');
export const getFormById = id => api.get(`/forms/${id}`);
export const deleteForm = id => api.delete(`/forms/${id}`);

// PDFs
export const downloadFormPdf = (id) => api.get(`/forms/${id}/pdf`, { responseType: 'blob' });
export const downloadScheduleAPdf = (id) => api.get(`/forms/${id}/schedule-a-pdf`, { responseType: 'blob' });

// Payments
export const createPaymentIntent = () => api.post('/payments/create-payment-intent');

export default api;
