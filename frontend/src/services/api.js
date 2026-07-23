import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api'
});

// Interceptor to automatically add JWT token to headers if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
