// Fake backend used when VITE_USE_MOCK is not "false". Mirrors docs/API_CONTRACT.md.
import { ApiError } from './errors.js';
import * as D from '../data/mock.js';
import { addDays } from '../utils/date.js';

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const r1 = (n) => +n.toFixed(1);

function nearest(lat, lng) {
  let best = D.hotspots[0], bd = Infinity;
  for (const h of D.hotspots) {
    const d = Math.hypot(h.lat - lat, h.lng - lng);
    if (d < bd) { bd = d; best = h; }
  }
  return { h: best, d: bd };
}

function needLatLng(p) {
  const lat = Number(p.lat), lng = Number(p.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new ApiError('lat and lng are required numbers', 422, 'INVALID_INPUT');
  return [lat, lng];
}

function predictAt(lat, lng) {
  const { h, d } = nearest(lat, lng);
  const near = d < 0.08;
  return { area: near ? h.name : 'Selected location', lat, lng, predicted_lst: Math.max(30, r1(h.lst + 0.3 - d * 12)), actual_lst: near ? h.lst : null, features: { ndvi: h.ndvi, builtup: h.builtup } };
}

const W = [['Built-up Area', 0.34], ['Impervious Surface', 0.22], ['NDVI', 0.22], ['Building Density', 0.12], ['Elevation', -0.04], ['Soil Moisture', 0.06], ['Others', 0.08]];
function localShap(lat, lng) {
  const p = predictAt(lat, lng);
  const delta = p.predicted_lst - 34;
  const contributions = W.map(([feature, w]) => ({ feature, value: r1(delta * w) }));
  const fix = r1(delta - contributions.reduce((s, c) => s + c.value, 0));
  contributions[contributions.length - 1].value = r1(contributions[contributions.length - 1].value + fix);
  return { lat, lng, predicted_lst: p.predicted_lst, base_value: 34.0, contributions };
}

const NEG = ['NDVI', 'Elevation', 'Soil Moisture'];
function shapSummary() {
  return D.shapGlobal.map((f, fi) => ({
    feature: f.feature,
    points: Array.from({ length: 40 }, (_, i) => {
      const value = ((i * 37 + fi * 11) % 40) / 39;
      const sign = NEG.includes(f.feature) ? -1 : 1;
      const shap = sign * (value - 0.5) * f.value * 2.4 + Math.sin(i * 7.1 + fi) * f.value * 0.15;
      return { value: +value.toFixed(2), shap: +shap.toFixed(3) };
    }),
  }));
}

function simulate(b) {
  const keys = ['tree', 'cool', 'green', 'water'];
  for (const k of keys) {
    const v = Number(b[k]);
    if (!Number.isFinite(v) || v < 0 || v > 100) throw new ApiError(`${k} must be between 0 and 100`, 422, 'INVALID_INPUT');
  }
  const before = b.lat != null && b.lng != null ? nearest(Number(b.lat), Number(b.lng)).h.lst : 43.2;
  const reduction = r1(Math.min(8, b.tree * 0.046 + b.cool * 0.032 + b.green * 0.035 + b.water * 0.022));
  return { before, after: r1(before - reduction), reduction };
}

function recommendations(id) {
  const h = D.hotspots.find((x) => String(x.id) === String(id));
  if (!h) throw new ApiError('Location not found', 404, 'NOT_FOUND');
  const f = Math.min(1.1, Math.max(0.4, (h.lst - 36) / 10));
  const strategies = D.strategyBase.map((s) => {
    const est = r1(s.est_cooling * f);
    return { ...s, est_cooling: est, impact: est >= 3.5 ? 'High' : est >= 2 ? 'Medium' : 'Low' };
  });
  const overall = r1(Math.max(...strategies.map((s) => s.est_cooling)) * 1.0);
  return { location: { id: h.id, name: h.name, lat: h.lat, lng: h.lng, lst: h.lst, driver: h.driver }, strategies, overall_cooling: overall };
}

// ---- auth (demo only: kept in this browser's localStorage) ----
const USERS = 'uh_mock_users';
const readUsers = () => { try { return JSON.parse(localStorage.getItem(USERS) || '[]'); } catch { return []; } };
const writeUsers = (u) => { try { localStorage.setItem(USERS, JSON.stringify(u)); } catch { /* ignore */ } };
async function sha(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
const publicUser = (u) => ({ id: u.email, name: u.name, email: u.email, organization: u.organization || '' });
const tokenFor = (email) => `mock.${btoa(encodeURIComponent(email))}`;

async function register(b) {
  const email = String(b.email || '').trim().toLowerCase();
  if (!b.name || !/^\S+@\S+\.\S+$/.test(email) || String(b.password || '').length < 8) throw new ApiError('Enter a name, a valid email and a password of at least 8 characters', 422, 'INVALID_INPUT');
  const users = readUsers();
  if (users.some((u) => u.email === email)) throw new ApiError('An account with this email already exists', 409, 'EMAIL_EXISTS');
  const u = { name: String(b.name).trim(), email, organization: b.organization || '', hash: await sha(b.password) };
  writeUsers([...users, u]);
  return { token: tokenFor(email), user: publicUser(u) };
}

async function login(b) {
  const email = String(b.email || '').trim().toLowerCase();
  const u = readUsers().find((x) => x.email === email);
  if (!u || u.hash !== (await sha(String(b.password || '')))) throw new ApiError('Incorrect email or password', 401, 'INVALID_CREDENTIALS');
  return { token: tokenFor(email), user: publicUser(u) };
}

function me(token) {
  try {
    const email = decodeURIComponent(atob(String(token || '').replace(/^mock\./, '')));
    const u = readUsers().find((x) => x.email === email);
    if (u) return publicUser(u);
  } catch { /* fall through */ }
  throw new ApiError('Please sign in again', 401, 'UNAUTHORIZED');
}

export async function mockHandle(method, path, { params = {}, body = {}, token } = {}) {
  await wait();
  switch (`${method} ${path}`) {
    case 'GET /health': return { status: 'ok', model_version: 'demo', latest_date: D.LATEST_DATE };
    case 'GET /overview': return { city: params.city || 'Delhi-NCR', date: params.date || D.LATEST_DATE, ...D.overview };
    case 'GET /hotspots': return D.hotspots.slice(0, Number(params.limit) || 50);
    case 'GET /trend': {
      const to = params.to || D.LATEST_DATE;
      return D.trendBase.map((t, i) => ({ date: addDays(to, i - (D.trendBase.length - 1)), ...t }));
    }
    case 'GET /metrics': return D.metrics;
    case 'GET /predictions/scatter':
      return Array.from({ length: Math.min(Number(params.limit) || 60, 200) }, (_, i) => {
        const actual = 26 + ((i * 17) % 29);
        return { actual, predicted: r1(actual + Math.sin(i * 12.9898) * 2.4) };
      });
    case 'POST /predict': {
      if (body.area) {
        const h = D.hotspots.find((x) => x.name === body.area);
        if (!h) return { area: body.area, lat: 28.61, lng: 77.21, predicted_lst: 34.7, actual_lst: null, features: { ndvi: 0.29, builtup: 42 } };
        return predictAt(h.lat, h.lng);
      }
      return predictAt(...needLatLng(body));
    }
    case 'GET /shap/global': return D.shapGlobal;
    case 'GET /shap/drivers': return D.shapDrivers;
    case 'GET /shap/local': return localShap(...needLatLng(params));
    case 'GET /shap/summary': return shapSummary();
    case 'POST /simulate': return simulate(body);
    case 'GET /scenarios/compare': {
      const f = params.lat != null && params.lng != null ? nearest(Number(params.lat), Number(params.lng)).h.lst / 48.7 : 0.9;
      return D.scenarioBase.map((s) => ({ name: s.name, reduction: r1(s.reduction * f) }));
    }
    case 'GET /recommendations': return recommendations(params.location_id);
    case 'GET /map/layers': return D.layers;
    case 'GET /cities': return D.cities;
    case 'GET /locations/search': {
      const q = String(params.q || '').trim().toLowerCase();
      if (!q) throw new ApiError('q is required', 422, 'INVALID_INPUT');
      return D.places.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
    }
    case 'POST /auth/register': return register(body);
    case 'POST /auth/login': return login(body);
    case 'GET /auth/me': return me(token);
    default: throw new ApiError(`No mock for ${method} ${path}`, 404, 'NOT_FOUND');
  }
}
