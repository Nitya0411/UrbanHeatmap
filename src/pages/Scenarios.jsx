import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import HeatMap from '../components/HeatMap.jsx';
import Async, { ErrorBox } from '../components/Async.jsx';
import { MonsoonWarning, SmallEffectNote } from '../components/AccuracyNote.jsx';
import { useApi } from '../hooks/useApi.js';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { cooling, isNum } from '../utils/format.js';

// The model only simulates vegetation. Cool roofs, high albedo and water bodies are "not modelled".
const DEFAULTS = { tree: 30, green: 25 };
const controls = [
  { k: 'tree', label: 'Increase tree cover' },
  { k: 'green', label: 'Green roof coverage' },
];
const notModelled = ['Cool roof coverage', 'Water body expansion'];
const presets = { Low: { tree: 10, green: 5 }, Moderate: DEFAULTS, High: { tree: 60, green: 45 } };

export default function Scenarios() {
  const { cityName, date } = useApp();
  const spots = useApi(() => api.hotspots({ city: cityName, date }), [cityName, date]);
  const [locId, setLocId] = useState('');
  const [p, setP] = useState(DEFAULTS);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const loc = spots.data?.find((s) => String(s.id) === locId) || spots.data?.[0];
  const compare = useApi(() => (loc ? api.scenariosCompare({ lat: loc.lat, lng: loc.lng }) : null), [loc?.id]);
  const modelled = (compare.data || []).filter((r) => isNum(r.reduction));
  const missing = (compare.data || []).filter((r) => !isNum(r.reduction)).map((r) => r.name);

  const change = (next) => { setP(next); setRes(null); };
  const run = async () => {
    setBusy(true); setError(null);
    try { setRes(await api.simulate({ tree: p.tree, green: p.green, cool: 0, water: 0, lat: loc?.lat, lng: loc?.lng })); } catch (e) { setError(e); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Cooling Scenarios" subtitle="Simulate and compare the impact of different urban cooling interventions">
        <label className="text-sm"><span className="sr-only">Location</span>
          <select value={loc ? String(loc.id) : ''} onChange={(e) => { setLocId(e.target.value); setRes(null); }} className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
            {(spots.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </PageHeader>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card flex flex-col">
          <h2 className="card-title">Intervention parameters</h2>
          <div className="mt-4 flex flex-1 flex-col justify-around gap-5">
            {controls.map(({ k, label }) => (
              <label key={k} className="block text-sm">
                <span className="flex justify-between"><span>{label}</span><b>{p[k]}%</b></span>
                <input type="range" min="0" max="100" value={p[k]} onChange={(e) => change({ ...p, [k]: +e.target.value })} className="mt-2 w-full accent-teal-600" />
              </label>
            ))}
            {notModelled.map((label) => (
              <div key={label} className="block text-sm opacity-60">
                <span className="flex items-center justify-between"><span>{label}</span><span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Not modelled</span></span>
                <input type="range" min="0" max="100" value="0" disabled aria-label={`${label} (not modelled)`} className="mt-2 w-full" />
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Quick scenarios">
            {Object.entries(presets).map(([name, v]) => <button key={name} className="chip min-h-[36px]" onClick={() => change(v)}>{name} intervention</button>)}
          </div>
          <div className="mt-5 flex gap-2">
            <button className="btn flex-1" onClick={run} disabled={busy || !loc}>{busy ? 'Simulating…' : 'Run Simulation'}</button>
            <button className="btn-ghost" onClick={() => change(DEFAULTS)}>Reset</button>
          </div>
        </div>

        <div className="card flex flex-col lg:col-span-2">
          <h2 className="card-title">Scenario impact{loc ? ` · ${loc.name}` : ''}</h2>
          <MonsoonWarning className="mt-3" />
          {error && <div className="mt-3"><ErrorBox error={error} /></div>}
          {!res && !error && <p className="muted mt-3 text-sm">Set the parameters and press Run Simulation to see the predicted temperature after the intervention.</p>}
          {res && (
            <div aria-live="polite">
              <div className="mt-3 grid items-start gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <div>
                  <div className="muted mb-1">Current scenario · {res.before} °C</div>
                  <HeatMap points={[{ ...loc, lst: res.before }]} center={[loc.lat, loc.lng]} zoom={13} height="clamp(190px, 26vh, 300px)" showLegend={false} />
                </div>
                <div className="hidden pt-24 text-center text-2xl text-slate-400 sm:block" aria-hidden="true">→</div>
                <div>
                  <div className="muted mb-1">After intervention · {res.after} °C</div>
                  <HeatMap points={[{ ...loc, lst: res.after }]} center={[loc.lat, loc.lng]} zoom={13} height="clamp(190px, 26vh, 300px)" showLegend={false} />
                </div>
              </div>
              <p className="mt-3 text-lg">Estimated temperature reduction: <b className="text-teal-600 dark:text-teal-400">{cooling(res.reduction)}</b></p>
              <SmallEffectNote value={res.reduction} className="mt-2" />
            </div>
          )}
          <h3 className="mt-5 text-sm font-bold">Single-measure comparison (predicted LST reduction, °C)</h3>
          <div className="relative mt-2 min-h-[150px] flex-1">
            <Async state={compare} height={224}>
              {() => (modelled.length > 0 ? (
                <div className="absolute inset-0"><ResponsiveContainer>
                  <BarChart data={modelled}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 'auto']} />
                    <Tooltip />
                    <Bar dataKey="reduction" fill="#0d9488" radius={[6, 6, 0, 0]} name="Reduction (°C)" />
                  </BarChart>
                </ResponsiveContainer></div>
              ) : <p className="muted text-sm">No modelled scenarios for this location.</p>)}
            </Async>
          </div>
          {missing.length > 0 && <p className="muted mt-2">Not modelled: {missing.join(', ')}.</p>}
        </div>
      </section>
    </>
  );
}
