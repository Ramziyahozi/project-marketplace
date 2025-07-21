import axios from 'axios';

// Buat instance axios dengan konfigurasi default
const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor untuk request
instance.interceptors.request.use(
  (config) => {
    // Tambahkan token jika ada (untuk fitur autentikasi di masa depan)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error global
    if (error.response) {
      // Error dari server
      console.error('Server error:', error.response.status, error.response.data);
      
      // Jika token tidak valid atau expired
      if (error.response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Error karena tidak ada response
      console.error('Network error:', error.request);
    } else {
      // Error lainnya
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance; 