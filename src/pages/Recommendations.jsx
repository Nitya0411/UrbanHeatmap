import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TreePine, Home, Droplets, Lightbulb } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import HeatMap from '../components/HeatMap.jsx';
import Async from '../components/Async.jsx';
import { useApi } from '../hooks/useApi.js';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { impactClass } from '../utils/colors.js';

const icons = [TreePine, Home, Droplets];

export default function Recommendations() {
  const { cityName, date } = useApp();
  const navigate = useNavigate();
  const spots = useApi(() => api.hotspots({ city: cityName, date }), [cityName, date]);
  const [sel, setSel] = useState('');
  const current = spots.data?.find((s) => String(s.id) === sel) || spots.data?.[0];
  const rec = useApi(() => (current ? api.recommendations({ location_id: current.id }) : null), [current?.id]);

  return (
    <>
      <PageHeader title="Recommendations" subtitle="Location-specific suggestions for effective urban heat mitigation">
        <label className="text-sm"><span className="sr-only">Select location</span>
          <select value={current ? String(current.id) : ''} onChange={(e) => setSel(e.target.value)} className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
            {(spots.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </PageHeader>

      <Async state={rec} height={320}>
        {(d) => d && (
          <section className="flex flex-col gap-4">
            <div className="card flex flex-1 flex-col">
              <div className="relative min-h-[300px] flex-1">
                <div className="absolute inset-0"><HeatMap points={spots.data} center={[d.location.lat, d.location.lng]} zoom={11} height="100%" selectedId={d.location.id} /></div>
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
                <div><span className="muted">Selected location </span><b className="text-lg">{d.location.name}</b></div>
                <div>Current LST: <b className="text-red-600 dark:text-red-400">{d.location.lst.toFixed(1)} °C</b></div>
                <div className="muted">{d.location.driver}</div>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Recommended strategies</h2>
              {d.strategies.length === 0 && <p className="muted mt-3 flex items-center gap-2 text-sm"><Lightbulb size={16} />No strategies available for this location yet.</p>}
              <ol className="mt-3 grid gap-3 md:grid-cols-3">
                {d.strategies.map((s, i) => {
                  const Icon = icons[i % icons.length];
                  return (
                    <li key={s.title} className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950"><Icon size={20} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <b className="text-sm">{s.title}</b>
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${impactClass[s.impact]}`}>{s.impact} impact</span>
                        </div>
                        <p className="muted mt-1">{s.description}</p>
                        <p className="mt-2 text-xs font-medium">Est. cooling: −{s.est_cooling} °C</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950 dark:to-slate-900">
              <div>
                <div className="muted">Overall expected cooling</div>
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">−{d.overall_cooling} °C</div>
                <div className="muted">with combined strategies</div>
              </div>
              <button className="btn" onClick={() => navigate('/reports')}>Get Report</button>
            </div>
          </section>
        )}
      </Async>
    </>
  );
}
