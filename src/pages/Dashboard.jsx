import { Link } from 'react-router-dom';
import { Thermometer, Flame, Leaf, Building2, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import HeatMap from '../components/HeatMap.jsx';
import ShapBars from '../components/ShapBars.jsx';
import Gauge from '../components/Gauge.jsx';
import HotspotTable from '../components/HotspotTable.jsx';
import { useFetch } from '../services/api.js';
import { kpis, hotspots, shap, metrics, trend } from '../data/mock.js';

const icons = { lst: Thermometer, hot: Flame, veg: Leaf, built: Building2 };

export default function Dashboard() {
  const spots = useFetch('/hotspots', hotspots);
  const drivers = useFetch('/shap', shap);
  const m = useFetch('/metrics', metrics);

  return (
    <>
      <PageHeader title="Urban Heatmap Dashboard" subtitle="Analyze | Predict | Explain | Mitigate">
        <span className="chip">25 May 2026</span>
        <span className="chip">Delhi-NCR</span>
      </PageHeader>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => <KpiCard key={k.key} {...k} icon={icons[k.key]} />)}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="card-title mb-3">Land Surface Temperature (LST) Heatmap</h2>
          <HeatMap points={spots} height={380} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="card">
            <h2 className="card-title">Feature Importance (SHAP)</h2>
            <ShapBars data={drivers} />
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

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="card-title">Temperature Trend</h2>
          <div className="mt-3 h-56">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[25, 50]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="max" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 3 }} name="Max" />
                <Line type="monotone" dataKey="avg" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3 }} name="Avg" />
                <Line type="monotone" dataKey="min" stroke="#2b6fb5" strokeWidth={2.5} dot={{ r: 3 }} name="Min" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card text-center">
          <h2 className="card-title text-left">Model Performance</h2>
          <div className="mt-3"><Gauge value={m.r2} /></div>
          <div className="mt-2 font-bold">XGBoost Model</div>
          <div className="muted">MAE {m.mae} · RMSE {m.rmse}</div>
        </div>
        
        <div className="card md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="card-title">Top Hotspots</h2>
            <Link to="/heatmap" className="text-xs font-medium text-teal-600 dark:text-teal-400">View map</Link>
          </div>
          <HotspotTable rows={spots.slice(0, 4)} compact />
        </div>
      </section>
    </>
  );
}
