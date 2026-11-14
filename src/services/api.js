import { useEffect, useState } from 'react';
import { BASE_LST, hotspots } from '../data/mock.js';

// Vite proxies /api to FastAPI (localhost:8000). If the backend is not running,
// every call falls back to the sample data so the UI always works.
const BASE = import.meta.env.VITE_API_URL || '/api';

export function useFetch(path, fallback) {
  const [data, setData] = useState(fallback);
  useEffect(() => {
    let on = true;
    fetch(BASE + path)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => on && setData(d))
      .catch(() => {});
    return () => { on = false; };
  }, [path]);
  return data;
}

async function post(path, body, fallback) {
  try {
    const r = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('bad status');
    return await r.json();
  } catch {
    return fallback;
  }
}

// Illustrative coefficients (°C cooling at 100% coverage). Replace with the model-based simulation.
export function simulateLocal({ tree, cool, green, water }) {
  const reduction = Math.min(8, tree * 0.046 + cool * 0.032 + green * 0.035 + water * 0.022);
  const r = +reduction.toFixed(1);
  return { reduction: r, after: +(BASE_LST - r).toFixed(1) };
}

export const api = {
  simulate: (params) => post('/simulate', params, simulateLocal(params)),
  predict: (area) => {
    const h = hotspots.find((x) => x.name === area);
    const predicted = h ? +(h.lst + 0.3).toFixed(1) : 34.7;
    return post('/predict', { area }, { area, predicted });
  },
};
