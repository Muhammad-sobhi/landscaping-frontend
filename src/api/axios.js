import axios from 'axios';

const api = axios.create({
    // Updated to your live Koyeb URL
    // Note: No '/public' is needed because Koyeb/Buildpacks point to public automatically
    baseURL: 'https://ready-ally-thattreeguy-134e425d.koyeb.app/api', 
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