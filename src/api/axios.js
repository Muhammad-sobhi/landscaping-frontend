import axios from 'axios';

const api = axios.create({
    // Updated to your live Koyeb URL
    // Note: No '/public' is needed because Koyeb/Buildpacks point to public automatically
    baseUrl : import.meta.env.VITE_API_BASE_URL.replace('/api', ''),
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