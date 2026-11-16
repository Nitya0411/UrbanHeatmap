import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import HeatMap from '../components/HeatMap.jsx';
import Async, { ErrorBox } from '../components/Async.jsx';
import { useApi } from '../hooks/useApi.js';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';

export default function Prediction() {
  const { cityName, date, city } = useApp();
  const spots = useApi(() => api.hotspots({ city: cityName, date }), [cityName, date]);
  const layers = useApi(() => api.layers(), []);
  const metrics = useApi(() => api.metrics(), []);
  const scatter = useApi(() => api.scatter({ limit: 500 }), []);
  const [area, setArea] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (body) => {
    setBusy(true); setError(null);
    try { setResult(await api.predict(body)); } catch (e) { setError(e); } finally { setBusy(false); }
  };
  const lstLayer = layers.data?.find((l) => l.id === 'lst');
  const pin = result ? { lat: result.lat, lng: result.lng, label: `${result.predicted_lst} °C` } : null;

  return (
    <>
      <PageHeader title="XGBoost Prediction" subtitle="Predict Land Surface Temperature using the trained XGBoost model" />
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="card-title mb-3">Predicted LST</h2>
          <Async state={spots} height={340}>
            {(d) => <HeatMap points={d} layer={lstLayer} center={pin ? [pin.lat, pin.lng] : city.center} zoom={pin ? 12 : city.zoom} height={340} pin={pin}
              onMapClick={(lat, lng) => { setArea(''); run({ lat, lng }); }} />}
          </Async>
          <p className="muted mt-2">Choose an area below, or click any point on the map.</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="muted mb-1 block">Select area</span>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
                <option value="">Choose an area…</option>
                {(spots.data || []).map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </label>
            <button className="btn" disabled={!area || busy} onClick={() => run({ area })}>{busy ? 'Running…' : 'Run Prediction'}</button>
          </div>
          {error && <div className="mt-3"><ErrorBox error={error} /></div>}
          {result && !error && (
            <div className="mt-3 rounded-xl bg-teal-50 p-4 text-sm dark:bg-teal-950" aria-live="polite">
              Predicted LST for <b>{result.area}</b>: <b className="text-xl">{result.predicted_lst} °C</b>
              {result.actual_lst != null && <span className="muted ml-2">(observed {result.actual_lst} °C)</span>}
              {result.features && <div className="muted mt-1">{Object.entries(result.features).map(([k, v]) => `${k}: ${v}`).join(' · ')}</div>}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <h2 className="card-title">Model Performance</h2>
            <Async state={metrics} height={80}>
              {(m) => (
                <>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    {[['R²', m.r2], ['MAE', m.mae], ['RMSE', m.rmse]].map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-slate-100 py-3 dark:bg-slate-800"><div className="muted">{k}</div><b className="text-xl">{v}</b></div>
                    ))}
                  </div>
                  <p className="muted mt-2">{m.model} · {m.n_train} train / {m.n_test} test samples</p>
                </>
              )}
            </Async>
          </div>
          <div className="card flex-1">
            <h2 className="card-title">Actual vs Predicted</h2>
            <div className="mt-3 h-64">
              <Async state={scatter} height={256}>
                {(d) => (
                  <ResponsiveContainer>
                    <ScatterChart margin={{ left: -10, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                      <XAxis type="number" dataKey="actual" name="Actual" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} label={{ value: 'Actual LST (°C)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis type="number" dataKey="predicted" name="Predicted" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <ReferenceLine segment={[{ x: 24, y: 24 }, { x: 56, y: 56 }]} stroke="#dc2626" strokeDasharray="5 4" />
                      <Scatter data={d} fill="#2563eb" fillOpacity={0.7} />
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </Async>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
