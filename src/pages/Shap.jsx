import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import ShapBars from '../components/ShapBars.jsx';
import { useFetch } from '../services/api.js';
import { shap, drivers } from '../data/mock.js';

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
  const data = useFetch('/shap', shap);
  return (
    <>
      <PageHeader title="SHAP Explainability" subtitle="Understand which factors are most influential in predicting urban heat" />
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="card-title">Feature Importance (mean |SHAP|)</h2>
          <ShapBars data={data} />
        </div>
        <div className="card">
          <h2 className="card-title">Contribution by feature</h2>
          <div className="mt-3 h-72">
            <ResponsiveContainer>
              <BarChart data={data} layout="vertical" margin={{ left: 20, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="feature" width={110} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>{data.map((d) => <Cell key={d.feature} fill={d.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <DriverList title="Top positive drivers (raise LST)" items={drivers.positive} tone="text-red-600 dark:text-red-400" />
        <DriverList title="Top negative drivers (cool the surface)" items={drivers.negative} tone="text-teal-600 dark:text-teal-400" />
      </section>
    </>
  );
}
