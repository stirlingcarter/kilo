import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://3.146.46.120'; // Replace with your actual backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('userToken');
    console.log('=== API REQUEST DEBUG ===');
    console.log('Request URL:', config.url);
    console.log('Token from storage:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization);
    } else {
      console.log('No token found in storage');
    }
    console.log('Full request config:', JSON.stringify(config, null, 2));
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

export default api; 