import { API_URL, USE_MOCK } from '../config.js';
import { ApiError } from './errors.js';
import { mockHandle } from './mockApi.js';

const TOKEN_KEY = 'uh_token';
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
};

async function request(method, path, { params, body } = {}) {
  const token = getToken();
  if (USE_MOCK) return mockHandle(method, path, { params, body, token });

  const clean = Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  const qs = Object.keys(clean).length ? `?${new URLSearchParams(clean)}` : '';
  let res;
  try {
    res = await fetch(`${API_URL}${path}${qs}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0, 'NETWORK');
  }
  if (!res.ok) {
    let e = {};
    try { e = await res.json(); } catch { /* not json */ }
    if (res.status === 401 && token) window.dispatchEvent(new Event('uh:unauthorized'));
    throw new ApiError(e?.error?.message || `Request failed (${res.status})`, res.status, e?.error?.code);
  }
  return res.json();
}

const get = (path, params) => request('GET', path, { params });
const post = (path, body) => request('POST', path, { body });

// One function per endpoint in docs/API_CONTRACT.md
export const api = {
  health: () => get('/health'),
  overview: (p) => get('/overview', p),
  hotspots: (p) => get('/hotspots', p),
  trend: (p) => get('/trend', p),
  metrics: () => get('/metrics'),
  scatter: (p) => get('/predictions/scatter', p),
  predict: (body) => post('/predict', body),
  shapGlobal: () => get('/shap/global'),
  shapDrivers: () => get('/shap/drivers'),
  shapLocal: (p) => get('/shap/local', p),
  shapSummary: (p) => get('/shap/summary', p),
  simulate: (body) => post('/simulate', body),
  scenariosCompare: (p) => get('/scenarios/compare', p),
  recommendations: (p) => get('/recommendations', p),
  layers: () => get('/map/layers'),
  cities: () => get('/cities'),
  search: (p) => get('/locations/search', p),
  register: (body) => post('/auth/register', body),
  login: (body) => post('/auth/login', body),
  me: () => get('/auth/me'),
};
