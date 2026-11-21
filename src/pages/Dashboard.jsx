import { Link } from 'react-router-dom';
import { Thermometer, Flame, Leaf, Building2, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import HeatMap from '../components/HeatMap.jsx';
import ShapBars from '../components/ShapBars.jsx';
import Gauge from '../components/Gauge.jsx';
import HotspotTable from '../components/HotspotTable.jsx';
import Async, { Skeleton } from '../components/Async.jsx';
import { MonsoonWarning } from '../components/AccuracyNote.jsx';
import { useApi } from '../hooks/useApi.js';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { addDays } from '../utils/date.js';

const MAP_H = 'clamp(340px, calc(100vh - 430px), 640px)';

function kpiProps(o) {
  const fmt = (m, unit) => ({ value: `${m.value}${unit}`, delta: `${m.change_pct >= 0 ? '↑' : '↓'} ${Math.abs(m.change_pct)}% vs. ${m.vs}` });
  return [
    { key: 'lst', label: 'Avg. LST', tone: 'orange', icon: Thermometer, bad: o.avg_lst.change_pct > 0, ...fmt(o.avg_lst, ' °C') },
    { key: 'hot', label: 'Hotspots Detected', tone: 'red', icon: Flame, bad: o.hotspot_count.change_pct > 0, ...fmt(o.hotspot_count, '') },
    { key: 'veg', label: 'Vegetation Cover', tone: 'green', icon: Leaf, bad: o.vegetation_cover.change_pct < 0, ...fmt(o.vegetation_cover, '%') },
    { key: 'built', label: 'Built-up Area', tone: 'blue', icon: Building2, bad: o.builtup_area.change_pct > 0, ...fmt(o.builtup_area, '%') },
  ];
}

export default function Dashboard() {
  const { cityName, date, effectiveDate, city } = useApp();
  const overview = useApi(() => api.overview({ city: cityName, date }), [cityName, date]);
  const spots = useApi(() => api.hotspots({ city: cityName, date }), [cityName, date]);
  const layers = useApi(() => api.layers(), []);
  const shap = useApi(() => api.shapGlobal(), []);
  const metrics = useApi(() => api.metrics(), []);
  const trend = useApi(
    () => api.trend({ city: cityName, from: effectiveDate ? addDays(effectiveDate, -180) : undefined, to: effectiveDate || undefined }),
    [cityName, effectiveDate]
  );
  const lstLayer = layers.data?.find((l) => l.id === 'lst');

  return (
    <>
      <PageHeader title="Urban Heatmap Dashboard" subtitle="Analyze | Predict | Explain | Mitigate">
        <span className="chip">{effectiveDate || 'Latest scene'}</span>
        <span className="chip">{cityName}</span>
      </PageHeader>

      <Async state={overview} height={96}>
        {(o) => (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiProps(o).map((k) => <KpiCard key={k.key} {...k} />)}
          </section>
        )}
      </Async>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="card-title mb-3">Land Surface Temperature (LST) Heatmap</h2>
          <Async state={spots} height={380}>{(d) => <HeatMap points={d} layer={lstLayer} center={city.center} zoom={city.zoom} height={MAP_H} />}</Async>
        </div>
        <div className="flex flex-col gap-4">
          <div className="card">
            <h2 className="card-title">Feature Importance (SHAP)</h2>
            <Async state={shap} height={200}>{(d) => <ShapBars data={d.slice(0, 8)} />}</Async>
          </div>
          <div className="card flex-1">
            <h2 className="card-title mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[['/prediction', 'Run Prediction'], ['/scenarios', 'View Scenarios'], ['/reports', 'Download Report']].map(([to, label], i) => (
                <Link key={to} to={to} className={`flex min-h-[44px] items-center justify-between rounded-xl border px-3.5 text-sm ${i === 0 ? 'border-blue-200 bg-blue-50 font-bold dark:border-blue-900 dark:bg-blue-950/40' : 'border-slate-200 dark:border-slate-700'}`}>
                  {label}<ChevronRight size={16} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="card flex flex-col">
          <h2 className="card-title">Temperature Trend</h2>
          <div className="relative mt-3 min-h-[224px] flex-1">
            <Async state={trend} height={224}>
              {(d) => (
                <div className="absolute inset-0"><ResponsiveContainer>
                  <LineChart data={d}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                    <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="max" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 3 }} name="Max" />
                    <Line type="monotone" dataKey="avg" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3 }} name="Avg" />
                    <Line type="monotone" dataKey="min" stroke="#2b6fb5" strokeWidth={2.5} dot={{ r: 3 }} name="Min" />
                  </LineChart>
                </ResponsiveContainer></div>
              )}
            </Async>
          </div>
        </div>
        <div className="card flex flex-col text-center">
          <h2 className="card-title text-left">Model Performance</h2>
          <Async state={metrics} height={200}>
            {(m) => (
              <div className="flex flex-1 flex-col items-center justify-center">
                <Gauge value={m.r2} />
                <div className="mt-2 font-bold">{m.model} Model</div>
                <div className="muted">MAE {m.mae} · RMSE {m.rmse}</div>
                <MonsoonWarning className="mt-3" />
              </div>
            )}
          </Async>
        </div>
        <div className="card md:col-span-2 xl:col-span-1">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="card-title">Top Hotspots</h2>
            <Link to="/heatmap" className="text-xs font-medium text-teal-600 dark:text-teal-400">View map</Link>
          </div>
          <Async state={spots} height={180}>{(d) => <HotspotTable rows={d.slice(0, 4)} compact />}</Async>
        </div>
      </section>
    </>
  );
}
