import axios from 'axios';
import toast from 'react-hot-toast';

// Determine the base API URL safely
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  // If in production and no VITE_API_URL provided, fallback to your deployed Render URL
  if (import.meta.env.PROD) {
    return 'https://skilltrack-api-n1pc.onrender.com/api';
  }
  return '/api';
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Increased to 60s to accommodate Render free-tier cold starts (which take 40-50s when sleeping)
  timeout: 60000,
});

let coldStartToastShown = false;

// Request interceptor: Notify user if backend is waking up on a cold start
axiosClient.interceptors.request.use((config) => {
  return config;
});

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please check your connection.';

    if (error.code === 'ECONNABORTED' || message.includes('timeout')) {
      message = 'Server is taking longer than usual to wake up (Render free tier). Please refresh in a moment!';
    }

    console.error('API Request Error:', message, error);
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
