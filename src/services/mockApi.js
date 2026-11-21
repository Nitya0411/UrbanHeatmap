// Fake backend used when VITE_USE_MOCK is not "false". Mirrors docs/API_CONTRACT.md.
import { ApiError } from './errors.js';
import * as D from '../data/mock.js';
import { addDays } from '../utils/date.js';

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const r1 = (n) => +n.toFixed(1);
const r2 = (n) => +n.toFixed(2);

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
  const a = D.AREA;
  if (lat < a.minLat || lat > a.maxLat || lng < a.minLng || lng > a.maxLng) {
    throw new ApiError('This point is outside the modelled area (Delhi-NCR).', 422, 'OUTSIDE_AREA');
  }
  return [lat, lng];
}

function predictAt(lat, lng) {
  const { h, d } = nearest(lat, lng);
  const near = d < 0.03;
  return { area: near ? h.name : 'Selected location', lat, lng, predicted_lst: Math.max(30, r1(h.lst + 0.3 - d * 40)), actual_lst: near ? h.lst : null, features: { ndvi: h.ndvi, builtup: h.builtup } };
}

const W = [['Air temperature', 0.5], ['Sun elevation', 0.15], ['NDBI (built-up / bare surface)', 0.15], ['Day of year', 0.06], ['Humidity', 0.04], ['Albedo', 0.03], ['NDVI', 0.02], ['Others', 0.05]];
function localShap(lat, lng) {
  const p = predictAt(lat, lng);
  const delta = p.predicted_lst - 34;
  const contributions = W.map(([feature, w]) => ({ feature, value: r1(delta * w) }));
  const fix = r1(delta - contributions.reduce((s, c) => s + c.value, 0));
  contributions[contributions.length - 1].value = r1(contributions[contributions.length - 1].value + fix);
  return { lat, lng, predicted_lst: p.predicted_lst, base_value: 34.0, contributions };
}

const NEG = ['NDVI', 'Humidity', 'Wind speed', 'Albedo'];
function shapSummary() {
  return D.shapGlobal.slice(0, 8).map((f, fi) => ({
    feature: f.feature,
    points: Array.from({ length: 40 }, (_, i) => {
      const value = ((i * 37 + fi * 11) % 40) / 39;
      const sign = NEG.includes(f.feature) ? -1 : 1;
      const shap = sign * (value - 0.5) * f.value * 1.2 + Math.sin(i * 7.1 + fi) * f.value * 0.15;
      return { value: +value.toFixed(2), shap: +shap.toFixed(3) };
    }),
  }));
}

// Effect of the sample scenarios grows with how hot the place is.
const locFactor = (lst) => Math.min(2.6, Math.max(1, 1 + (lst - 40) / 5));

// Mean effect of 100% of each measure (see D.scenarioBase). Negative = warming.
function simulate(b) {
  for (const k of ['tree', 'cool', 'green', 'water']) {
    const v = Number(b[k]);
    if (!Number.isFinite(v) || v < 0 || v > 100) throw new ApiError(`${k} must be between 0 and 100`, 422, 'INVALID_INPUT');
  }
  const h = b.lat != null && b.lng != null ? nearest(Number(b.lat), Number(b.lng)).h : null;
  const before = h ? h.lst : 34.1;
  const f = h ? locFactor(h.lst) : 1;
  const reduction = r2(((b.tree / 100) * 0.12 + (b.cool / 100) * -0.65 + (b.green / 100) * 0.0 + (b.water / 100) * 0.52) * f);
  return { before, after: r2(before - reduction), reduction };
}

function recommendations(id) {
  const h = D.hotspots.find((x) => String(x.id) === String(id));
  if (!h) throw new ApiError('Location not found', 404, 'NOT_FOUND');
  const f = locFactor(h.lst);
  const strategies = D.strategyBase
    .map((s) => {
      const est = r2(s.est_cooling * f);
      return { ...s, est_cooling: est, impact: est >= 0.8 ? 'High' : est >= 0.3 ? 'Medium' : 'Low' };
    })
    .sort((x, y) => y.est_cooling - x.est_cooling);
  const overall = r2(strategies.filter((s) => s.est_cooling > 0).reduce((t, s) => t + s.est_cooling, 0));
  return { location: { id: h.id, name: h.name, lat: h.lat, lng: h.lng, lst: h.lst, driver: h.driver }, strategies, overall_cooling: overall };
}

function trendPoint(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const doy = (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000;
  const avg = 30.5 + 8.5 * Math.sin(((doy - 80) / 365) * 2 * Math.PI);
  return { date: iso, min: r1(avg - 4), avg: r1(avg), max: r1(avg + 10) };
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
      const from = params.from || addDays(to, -180);
      const out = [];
      for (let d = to; d >= from && out.length < 26; d = addDays(d, -7)) out.unshift(trendPoint(d));
      return out;
    }
    case 'GET /metrics': return D.metrics;
    case 'GET /predictions/scatter':
      return Array.from({ length: Math.min(Number(params.limit) || 60, 200) }, (_, i) => {
        const actual = 26 + ((i * 17) % 29);
        return { actual, predicted: r1(actual + Math.sin(i * 12.9898) * 2.8) };
      });
    case 'POST /predict': {
      if (body.area) {
        const h = D.hotspots.find((x) => x.name === body.area);
        if (!h) throw new ApiError(`Unknown area: ${body.area}`, 404, 'NOT_FOUND');
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
      const f = params.lat != null && params.lng != null ? locFactor(nearest(Number(params.lat), Number(params.lng)).h.lst) : 1;
      return D.scenarioBase.map((s) => ({ name: s.name, reduction: s.reduction == null ? null : r2(s.reduction * f) }));
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
