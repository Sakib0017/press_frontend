import axios from 'axios';

// Resolve backend URL: VITE_API_URL at build time, else fallback
// On Vercel frontend without VITE_API_URL, relative /api hits static hosting -> 405 or CORS error
// Your live URLs: frontend https://press-frontend-two.vercel.app , backend https://press-backend-alpha.vercel.app
const raw = import.meta.env.VITE_API_URL?.trim();

// Known mappings for this project — prevents inferring wrong backend (two vs alpha)
const KNOWN_BACKEND = 'https://press-backend-alpha.vercel.app';
const KNOWN_FRONTEND = 'press-frontend-two.vercel.app';

function inferBackendUrl() {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname;
  // Exact known mapping: press-frontend-two -> press-backend-alpha (NOT press-backend-two)
  if (host === KNOWN_FRONTEND) {
    return KNOWN_BACKEND;
  }
  if (host.includes('frontend')) {
    // Generic fallback: frontend -> backend (but will be wrong if backend name is alpha not two)
    // Prefer KNOWN_BACKEND for this project
    const generic = `${window.location.protocol}//${host.replace('frontend', 'backend')}`;
    // If generic !== KNOWN_BACKEND, warn and use known
    if (host === 'press-frontend-two.vercel.app' && generic !== KNOWN_BACKEND) {
      console.warn(`Inferred backend ${generic} does not match known backend ${KNOWN_BACKEND}. Using known backend. Please set VITE_API_URL=${KNOWN_BACKEND} in Vercel env.`);
      return KNOWN_BACKEND;
    }
    return generic;
  }
  return null;
}

let baseURL;
let backendHint = null;

if (raw) {
  // Normalize: remove trailing slash, ensure no /api double
  const cleaned = raw.replace(/\/$/, '').replace(/\/api$/, '');
  baseURL = `${cleaned}/api`;
} else {
  const inferred = inferBackendUrl();
  if (inferred) {
    console.warn(`VITE_API_URL missing! Using fallback backend ${inferred}/api. FIX: Vercel Frontend -> Settings -> Environment Variables -> VITE_API_URL=${KNOWN_BACKEND} -> Redeploy`);
    baseURL = `${inferred.replace(/\/$/, '')}/api`;
    backendHint = inferred;
  } else {
    baseURL = '/api';
    if (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')) {
      console.error(`VITE_API_URL missing! Frontend is calling relative /api on static hosting -> 405/CORS. Set VITE_API_URL=${KNOWN_BACKEND} in Vercel frontend env vars`);
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

// Response interceptor: friendly messages for 405 and CORS/network errors
api.interceptors.response.use(
  response => response,
  error => {
    const cfg = error.config || {};
    const url = `${cfg.baseURL || ''}${cfg.url || ''}`;
    const isLogin = cfg.url?.includes('/api/auth/login') || cfg.url?.includes('/auth/login');
    // 405 = frontend static hosting (VITE_API_URL missing)
    if (error.response?.status === 405 && isLogin) {
      const msg = backendHint
        ? `Login failed 405: Frontend called ${url} but got 405. Inferred backend ${backendHint} may be wrong. Fix: Vercel Frontend -> Settings -> Environment Variables -> VITE_API_URL=https://press-backend-alpha.vercel.app -> Redeploy`
        : `Login failed 405: Backend not reachable at ${url}. Frontend called relative /api on static hosting. Fix: Vercel Frontend env VITE_API_URL=https://press-backend-alpha.vercel.app -> Redeploy`;
      console.error(msg);
      error.friendlyMessage = msg;
    }
    // CORS / network failure (ERR_FAILED, no response)
    if (!error.response && error.message === 'Network Error' && isLogin) {
      const msg = `Login Network/CORS error: Frontend ${typeof window !== 'undefined' ? window.location.origin : ''} -> ${url} blocked by CORS or backend down. Causes: 1) Frontend VITE_API_URL is https://press-backend-two.vercel.app (WRONG) should be https://press-backend-alpha.vercel.app  2) Backend CORS not allowing ${typeof window !== 'undefined' ? window.location.origin : 'frontend'}  3) Backend not deployed. Fix: Set VITE_API_URL=https://press-backend-alpha.vercel.app in Vercel Frontend and ensure Backend FRONTEND_URL=https://press-frontend-two.vercel.app -> Redeploy both`;
      console.error(msg);
      error.friendlyMessage = msg;
    }
    // Also handle CORS preflight explicit: error.response missing headers case
    if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK') {
      console.error(`CORS/Network detail: baseURL=${baseURL} hint=${backendHint} raw=${raw}`);
    }
    return Promise.reject(error);
  }
);

export default api;
export { baseURL };
