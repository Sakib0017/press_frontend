import axios from 'axios';

// Vercel: set VITE_API_URL to backend URL (e.g. https://press-backend.vercel.app)
// Local dev: leave empty to use Vite proxy (/api -> http://localhost:5000)
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
