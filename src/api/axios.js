import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Make sure your Laravel is running!
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});
// This part is crucial!
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;