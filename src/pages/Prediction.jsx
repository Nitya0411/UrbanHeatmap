import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import HeatMap from '../components/HeatMap.jsx';
import { api, useFetch } from '../services/api.js';
import { hotspots, metrics, scatter } from '../data/mock.js';

export default function Prediction() {
  const spots = useFetch('/hotspots', hotspots);
  const m = useFetch('/metrics', metrics);
  const [area, setArea] = useState('Delhi-NCR');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setResult(await api.predict(area));
    setBusy(false);
  };

  return (
    <>
      <PageHeader title="XGBoost Prediction" subtitle="Predict Land Surface Temperature using the trained XGBoost model" />
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="card-title mb-3">Predicted LST</h2>
          <HeatMap points={spots} height={340} />
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="muted mb-1 block">Select area</span>
              <select value={area} onChange={(e) => { setArea(e.target.value); setResult(null); }}
                className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
                <option>Delhi-NCR</option>
                {spots.map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </label>
            <button className="btn" onClick={run} disabled={busy}>{busy ? 'Running…' : 'Run Prediction'}</button>
            {result && (
              <div className="rounded-xl bg-teal-50 px-4 py-2 text-sm dark:bg-teal-950" aria-live="polite">
                Predicted LST for <b>{result.area}</b>: <b className="text-lg">{result.predicted} °C</b>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <h2 className="card-title">Model Performance</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[['R²', m.r2], ['MAE', m.mae], ['RMSE', m.rmse]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-100 py-3 dark:bg-slate-800"><div className="muted">{k}</div><b className="text-xl">{v}</b></div>
              ))}
            </div>
          </div>
          <div className="card flex-1">
            <h2 className="card-title">Actual vs Predicted</h2>
            <div className="mt-3 h-64">
              <ResponsiveContainer>
                <ScatterChart margin={{ left: -10, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                  <XAxis type="number" dataKey="actual" name="Actual" domain={[24, 56]} tick={{ fontSize: 11, fill: '#94a3b8' }} label={{ value: 'Actual LST (°C)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis type="number" dataKey="predicted" name="Predicted" domain={[24, 56]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <ReferenceLine segment={[{ x: 24, y: 24 }, { x: 56, y: 56 }]} stroke="#dc2626" strokeDasharray="5 4" />
                  <Scatter data={scatter} fill="#2563eb" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
