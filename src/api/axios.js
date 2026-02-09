import axios from 'axios';

const api = axios.create({
    // If you are using the .htaccess redirect we discussed, you can remove '/public'
    baseURL: 'https://thattreeguy.infinityfreeapp.com/public/api', 
    withCredentials: true, // REQUIRED for CORS when sending tokens/cookies
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // This header is a "secret weapon" for shared hosting; it tells the 
        // server this is a legitimate AJAX request.
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