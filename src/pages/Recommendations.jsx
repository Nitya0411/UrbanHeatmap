import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TreePine, Home, Droplets } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import HeatMap from '../components/HeatMap.jsx';
import { useFetch } from '../services/api.js';
import { hotspots, strategies } from '../data/mock.js';

const icons = [TreePine, Home, Droplets];
const impactClass = {
  High: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
};

export default function Recommendations() {
  const spots = useFetch('/hotspots', hotspots);
  const [sel, setSel] = useState(3);
  const loc = spots.find((s) => s.id === sel) || spots[0];
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Recommendations" subtitle="Location-specific suggestions for effective urban heat mitigation">
        <label className="text-sm">
          <span className="sr-only">Select location</span>
          <select value={sel} onChange={(e) => setSel(+e.target.value)} className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
            {spots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </PageHeader>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="card lg:col-span-2">
          <HeatMap points={spots} center={[loc.lat, loc.lng]} zoom={11} height={300} selectedId={loc.id} />
          <div className="mt-4 text-sm">
            <div className="muted">Selected location</div>
            <div className="text-lg font-bold">{loc.name}</div>
            <div className="mt-1">Current LST: <b className="text-red-600 dark:text-red-400">{loc.lst.toFixed(1)} °C</b></div>
            <div className="muted mt-1">{loc.driver}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-3">
          <div className="card">
            <h2 className="card-title">Recommended strategies</h2>
            <ol className="mt-3 space-y-3">
              {strategies.map((s, i) => {
                const Icon = icons[i];
                return (
                  <li key={s.title} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950"><Icon size={20} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <b className="text-sm">{s.title}</b>
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${impactClass[s.impact]}`}>{s.impact} impact</span>
                      </div>
                      <p className="muted mt-1">{s.desc}</p>
                      <p className="mt-1 text-xs font-medium">Est. cooling: −{s.cut} °C</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950 dark:to-slate-900">
            <div>
              <div className="muted">Overall expected cooling</div>
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">−4.2 °C</div>
              <div className="muted">with combined strategies</div>
            </div>
            <button className="btn" onClick={() => navigate('/reports')}>Get Report</button>
          </div>
        </div>
      </section>
    </>
  );
}
