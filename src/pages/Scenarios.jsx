import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import { api, simulateLocal } from '../services/api.js';
import { BASE_LST, scenarioCompare } from '../data/mock.js';

const DEFAULTS = { tree: 30, cool: 20, green: 25, water: 10 };
const controls = [
  { k: 'tree', label: 'Increase tree cover' },
  { k: 'cool', label: 'Cool roof coverage' },
  { k: 'green', label: 'Green roof coverage' },
  { k: 'water', label: 'Water body expansion' },
];
const presets = { Low: { tree: 10, cool: 5, green: 5, water: 2 }, Moderate: DEFAULTS, High: { tree: 60, cool: 50, green: 45, water: 25 } };

export default function Scenarios() {
  const [p, setP] = useState(DEFAULTS);
  const [res, setRes] = useState(null);
  const shown = res ?? simulateLocal(p);

  const change = (next) => { setP(next); setRes(null); };
  const run = async () => setRes(await api.simulate({ ...p, baseline: BASE_LST }));

  return (
    <>
      <PageHeader title="Cooling Scenarios" subtitle="Simulate and compare the impact of different urban cooling interventions" />
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <h2 className="card-title">Intervention parameters</h2>
          <div className="mt-4 space-y-5">
            {controls.map(({ k, label }) => (
              <label key={k} className="block text-sm">
                <span className="flex justify-between"><span>{label}</span><b>{p[k]}%</b></span>
                <input type="range" min="0" max="100" value={p[k]} onChange={(e) => change({ ...p, [k]: +e.target.value })} className="mt-2 w-full accent-teal-600" />
              </label>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Quick scenarios">
            {Object.entries(presets).map(([name, v]) => <button key={name} className="chip min-h-[36px]" onClick={() => change(v)}>{name} intervention</button>)}
          </div>
          <div className="mt-5 flex gap-2">
            <button className="btn flex-1" onClick={run}>Run Simulation</button>
            <button className="btn-ghost" onClick={() => change(DEFAULTS)}>Reset</button>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="card-title">Scenario impact · Connaught Place</h2>
          <div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-xl bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 p-6 text-white">
              <div className="text-xs opacity-90">Current scenario</div><div className="text-3xl font-bold">{BASE_LST} °C</div>
            </div>
            <div className="text-center text-2xl text-slate-400" aria-hidden="true">→</div>
            <div className="rounded-xl bg-gradient-to-br from-yellow-400 via-lime-500 to-sky-500 p-6 text-white">
              <div className="text-xs opacity-90">After intervention (predicted)</div><div className="text-3xl font-bold">{shown.after} °C</div>
            </div>
          </div>
          <p className="mt-4 text-lg">Estimated temperature reduction: <b className="text-teal-600 dark:text-teal-400">−{shown.reduction} °C</b></p>
          <p className="muted mt-1">Illustrative coefficients until the model-based simulation (POST /api/simulate) is connected.</p>
          <h3 className="mt-6 text-sm font-bold">Single-measure comparison (predicted LST reduction, °C)</h3>
          <div className="mt-2 h-56">
            <ResponsiveContainer>
              <BarChart data={scenarioCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="cut" fill="#0d9488" radius={[6, 6, 0, 0]} name="Reduction (°C)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </>
  );
}
