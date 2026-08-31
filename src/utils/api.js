import axios from 'axios';

// Vercel: MUST set VITE_API_URL to backend URL (e.g. https://press-backend.vercel.app)
// If empty, relative /api will hit FRONTEND domain -> Vercel static returns 405 for POST
const raw = import.meta.env.VITE_API_URL?.trim();
if (!raw && typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')) {
  console.warn('VITE_API_URL missing! Frontend is calling relative /api on static hosting -> 405. Set VITE_API_URL in Vercel frontend env vars to https://<backend>.vercel.app');
}
const baseURL = raw ? `${raw.replace(/\/$/, '')}/api` : '/api';

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
