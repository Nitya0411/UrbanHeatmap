import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import ShapBars from '../components/ShapBars.jsx';
import ShapSummaryPlot from '../components/ShapSummaryPlot.jsx';
import LocalShap from '../components/LocalShap.jsx';
import Async from '../components/Async.jsx';
import { useApi } from '../hooks/useApi.js';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { SHAP_PALETTE } from '../utils/colors.js';

function DriverList({ title, items, tone }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((d) => (
          <li key={d.feature} className="flex justify-between border-t border-slate-100 pt-2 first:border-0 first:pt-0 dark:border-slate-800">
            <span>{d.feature}</span><b className={tone}>{d.value > 0 ? '+' : ''}{d.value.toFixed(2)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Shap() {
  const { cityName, date } = useApp();
  const global = useApi(() => api.shapGlobal(), []);
  const drivers = useApi(() => api.shapDrivers(), []);
  const summary = useApi(() => api.shapSummary({ limit: 300 }), []);
  const spots = useApi(() => api.hotspots({ city: cityName, date }), [cityName, date]);
  const [pick, setPick] = useState('');
  const chosen = spots.data?.find((s) => String(s.id) === pick) || spots.data?.[0];
  const local = useApi(() => (chosen ? api.shapLocal({ lat: chosen.lat, lng: chosen.lng }) : null), [chosen?.id]);

  return (
    <>
      <PageHeader title="SHAP Explainability" subtitle="Understand which factors are most influential in predicting urban heat" />
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="card-title">Feature Importance (mean |SHAP|)</h2>
          <Async state={global} height={220}>{(d) => <ShapBars data={d} />}</Async>
        </div>
        <div className="card">
          <h2 className="card-title">Contribution by feature</h2>
          <div className="mt-3 h-72">
            <Async state={global} height={288}>
              {(d) => (
                <ResponsiveContainer>
                  <BarChart data={d} layout="vertical" margin={{ left: 20, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis type="category" dataKey="feature" width={120} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>{d.map((r, i) => <Cell key={r.feature} fill={SHAP_PALETTE[i % SHAP_PALETTE.length]} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Async>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">SHAP summary plot</h2>
        <p className="muted mb-3">Each dot is one sample. Dots to the right raise the predicted temperature; red dots have a high value of that feature.</p>
        <Async state={summary} height={300}>{(d) => <ShapSummaryPlot data={d} />}</Async>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Async state={drivers} height={140}>
          {(d) => (
            <>
              <DriverList title="Top positive drivers (raise LST)" items={d.positive} tone="text-red-600 dark:text-red-400" />
              <DriverList title="Top negative drivers (cool the surface)" items={d.negative} tone="text-teal-600 dark:text-teal-400" />
            </>
          )}
        </Async>
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="card-title">Explain one location</h2>
          <label className="text-sm"><span className="sr-only">Location</span>
            <select value={chosen ? String(chosen.id) : ''} onChange={(e) => setPick(e.target.value)} className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
              {(spots.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3"><Async state={local} height={200}>{(d) => d && <LocalShap data={d} />}</Async></div>
      </section>
    </>
  );
}
