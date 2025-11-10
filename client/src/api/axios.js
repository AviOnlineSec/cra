// src/api/axios.js
import axios from 'axios';
import { signAxiosConfig } from './signature';
import { jwtDecode } from 'jwt-decode';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000', // adjust your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('cdd_access_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      // Attach company header for non-superusers if selected
      try {
        const decoded = jwtDecode(accessToken);
        const isSuperuser = decoded?.is_superuser === true || decoded?.isSuperuser === true;
        const companyId = localStorage.getItem('cdd_company_id');
        if (!isSuperuser && companyId) {
          config.headers['X-Company-ID'] = companyId;
        }
      } catch (_) {
        // ignore decode errors
      }
    }
    // Attach signature headers if configured
    config = await signAxiosConfig(config);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('cdd_refresh_token')
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('cdd_refresh_token');
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken,
        });
        localStorage.setItem('cdd_access_token', response.data.access);
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        localStorage.removeItem('cdd_access_token');
        localStorage.removeItem('cdd_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
