import axios from 'axios';

// Resolve backend URL: VITE_API_URL at build time, else fallback to same origin's backend inference
// On Vercel frontend without VITE_API_URL, relative /api hits static hosting -> 405
// We now detect this and provide clear error instead of silent 405
const raw = import.meta.env.VITE_API_URL?.trim();

// Heuristic fallback: if VITE_API_URL missing and on vercel.app, try to infer backend hostname
// e.g. press-frontend-two.vercel.app -> press-backend-two.vercel.app
function inferBackendUrl() {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname;
  if (host.includes('frontend')) {
    return `${window.location.protocol}//${host.replace('frontend', 'backend')}`;
  }
  return null;
}

let baseURL;
let backendHint = null;

if (raw) {
  baseURL = `${raw.replace(/\/$/, '')}/api`;
} else {
  const inferred = inferBackendUrl();
  if (inferred) {
    // Use inferred as last resort, but warn that VITE_API_URL should be set explicitly
    console.warn(`VITE_API_URL missing! Inferring backend as ${inferred}/api. Set VITE_API_URL in Vercel frontend env vars to https://<backend>.vercel.app for reliability.`);
    baseURL = `${inferred}/api`;
    backendHint = inferred;
  } else {
    baseURL = '/api';
    if (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')) {
      console.error('VITE_API_URL missing! Frontend is calling relative /api on static hosting -> 405. Set VITE_API_URL in Vercel frontend env vars to https://<backend>.vercel.app');
    }
  }
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add response interceptor to give friendly message on 405 (frontend static 405)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 405 && error.config?.url?.includes('/api/auth/login')) {
      const msg = backendHint
        ? `Login failed 405: Frontend called ${error.config.baseURL}${error.config.url} but got 405. VITE_API_URL was missing, inferred backend ${backendHint} may be wrong. Fix: Vercel Frontend -> Settings -> Environment Variables -> VITE_API_URL=https://<YOUR-BACKEND>.vercel.app -> Redeploy`
        : `Login failed 405: Backend not reachable at ${error.config.baseURL}${error.config.url}. This happens when frontend's VITE_API_URL is missing (calls relative /api on static hosting) or backend not deployed. Fix: Deploy backend separately, then set VITE_API_URL=https://<backend>.vercel.app in frontend env & redeploy. Backend must be at ${typeof window !== 'undefined' ? window.location.origin.replace('frontend','backend') : 'https://<backend>.vercel.app'}/api`;
      console.error(msg);
      error.friendlyMessage = msg;
    }
    return Promise.reject(error);
  }
);

export default api;
export { baseURL };
