import axios from 'axios';

const api = axios.create({
    // FIX: Change 'baseUrl' to 'baseURL'
    baseURL: import.meta.env.VITE_API_BASE_URL, 
    withCredentials: true, 
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', 
    }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;