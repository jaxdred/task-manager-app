// src/api.ts
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const API = axios.create({
baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default API;
