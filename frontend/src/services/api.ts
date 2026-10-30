import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://masic-backend.onrender.com' : '/api');

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor - attach JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('masid_token') || sessionStorage.getItem('masid_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('masid_token');
      localStorage.removeItem('masid_user');
      sessionStorage.removeItem('masid_token');
      sessionStorage.removeItem('masid_user');
      // Redirect to login only if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    securityQuestion1?: string;
    securityAnswer1?: string;
    securityQuestion2?: string;
    securityAnswer2?: string;
  }) => api.post<AuthResponse>('/auth/register', data),
  refresh: () => api.post<AuthResponse>('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  getSecurityQuestions: (email: string) =>
    api.post<{
      success: boolean;
      email: string;
      residentName: string;
      question1: string;
      question2: string;
    }>('/auth/get-security-questions', { email }),
  verifySecurityAnswers: (data: { email: string; answer1: string; answer2: string }) =>
    api.post<{
      success: boolean;
      resetToken: string;
      residentName: string;
      message: string;
    }>('/auth/verify-security-answers', data),
  verifyResident: (data: { email: string; firstName: string; lastName: string }) =>
    api.post<{ success: boolean; resetToken: string; residentName: string; message: string }>('/auth/verify-resident', data),
  resetPassword: (data: { resetToken: string; newPassword: string }) =>
    api.post<{ success: boolean; message: string }>('/auth/reset-password', data),
};

// ---- Beneficiaries ----
export const beneficiariesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/beneficiaries', { params }),
  getById: (id: number) => api.get(`/beneficiaries/${id}`),
  create: (data: unknown) => api.post('/beneficiaries', data),
  update: (id: number, data: unknown) => api.patch(`/beneficiaries/${id}`, data),
  delete: (id: number) => api.delete(`/beneficiaries/${id}`),
  getHistory: (id: number) => api.get(`/beneficiaries/${id}/history`),
};

// ---- Residents ----
export const residentsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/residents', { params }),
  getById: (id: number) => api.get(`/residents/${id}`),
  create: (data: unknown) => api.post('/residents', data),
  update: (id: number, data: unknown) => api.patch(`/residents/${id}`, data),
};

// ---- Payout Programs ----
export const payoutProgramsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/payout-programs', { params }),
  getById: (id: number) => api.get(`/payout-programs/${id}`),
  create: (data: unknown) => api.post('/payout-programs', data),
  update: (id: number, data: unknown) => api.patch(`/payout-programs/${id}`, data),
  delete: (id: number) => api.delete(`/payout-programs/${id}`),
};

// ---- Payout Schedules ----
export const payoutSchedulesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/payout-schedules', { params }),
  getPublic: (params?: Record<string, unknown>) => api.get('/payout-schedules/public', { params }),
  getById: (id: number) => api.get(`/payout-schedules/${id}`),
  create: (data: unknown) => api.post('/payout-schedules', data),
  update: (id: number, data: unknown) => api.patch(`/payout-schedules/${id}`, data),
};

// ---- Payout Transactions ----
export const payoutTransactionsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/payout-transactions', { params }),
  getBySchedule: (scheduleId: number) => api.get(`/payout-transactions/schedule/${scheduleId}`),
  create: (data: unknown) => api.post('/payout-transactions', data),
  updateStatus: (id: number, status: string) => api.patch(`/payout-transactions/${id}/status`, { status }),
  bulkAssign: (scheduleId: number, beneficiaryIds: number[]) =>
    api.post(`/payout-transactions/bulk-assign`, { scheduleId, beneficiaryIds }),
};

// ---- Resources ----
export const resourcesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/resources', { params }),
  getById: (id: number) => api.get(`/resources/${id}`),
  create: (data: unknown) => api.post('/resources', data),
  update: (id: number, data: unknown) => api.patch(`/resources/${id}`, data),
  delete: (id: number) => api.delete(`/resources/${id}`),
};

// ---- Resource Distribution ----
export const distributionApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/distributions', { params }),
  getById: (id: number) => api.get(`/distributions/${id}`),
  create: (data: unknown) => api.post('/distributions', data),
};

// ---- Announcements ----
export const announcementsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/announcements', { params }),
  getPublished: (params?: Record<string, unknown>) => api.get('/announcements/public', { params }),
  getById: (id: number) => api.get(`/announcements/${id}`),
  create: (data: unknown) => api.post('/announcements', data),
  update: (id: number, data: unknown) => api.patch(`/announcements/${id}`, data),
  publish: (id: number) => api.patch(`/announcements/${id}/publish`),
  unpublish: (id: number) => api.patch(`/announcements/${id}/unpublish`),
  archive: (id: number) => api.patch(`/announcements/${id}/archive`),
  delete: (id: number) => api.delete(`/announcements/${id}`),
};

// ---- Events ----
export const eventsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/events', { params }),
  getPublished: (params?: Record<string, unknown>) => api.get('/events/public', { params }),
  getById: (id: number) => api.get(`/events/${id}`),
  create: (data: unknown) => api.post('/events', data),
  update: (id: number, data: unknown) => api.patch(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
};

// ---- Dashboard ----
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getCharts: () => api.get('/dashboard/charts'),
};

// ---- Reports ----
export const reportsApi = {
  getBeneficiaries: (params?: Record<string, unknown>) => api.get('/reports/beneficiaries', { params }),
  getPayouts: (params?: Record<string, unknown>) => api.get('/reports/payouts', { params }),
  getResources: (params?: Record<string, unknown>) => api.get('/reports/resources', { params }),
  getDistributions: (params?: Record<string, unknown>) => api.get('/reports/distributions', { params }),
  getEvents: (params?: Record<string, unknown>) => api.get('/reports/events', { params }),
  exportPdf: (type: string, params?: Record<string, unknown>) =>
    api.get(`/reports/${type}/export/pdf`, { params, responseType: 'blob' }),
  exportExcel: (type: string, params?: Record<string, unknown>) =>
    api.get(`/reports/${type}/export/excel`, { params, responseType: 'blob' }),
};

// ---- Notifications ----
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ---- Audit Logs ----
export const auditLogsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/audit-logs', { params }),
};

// ---- Users ----
export const usersApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: unknown) => api.post('/users', data),
  update: (id: number, data: unknown) => api.patch(`/users/${id}`, data),
  updateStatus: (id: number, status: string) => api.patch(`/users/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// ---- Settings ----
export const settingsApi = {
  getAll: () => api.get('/settings'),
  update: (key: string, value: string) => api.patch(`/settings/${key}`, { value }),
};

export default api;
