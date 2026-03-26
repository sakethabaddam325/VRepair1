import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const sessionKey = sessionStorage.getItem('sessionUniqueKey');
    if (sessionKey && config.data) {
      if (typeof config.data === 'string') {
        config.data += `&sessionUniqueKey=${encodeURIComponent(sessionKey)}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
