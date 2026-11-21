import { Download, Printer } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import HotspotTable from '../components/HotspotTable.jsx';
import Async from '../components/Async.jsx';
import { useApi } from '../hooks/useApi.js';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { impactClass } from '../utils/colors.js';
import { MonsoonWarning } from '../components/AccuracyNote.jsx';
import { cooling, isNum } from '../utils/format.js';

export default function Reports() {
  const { cityName, date, effectiveDate } = useApp();
  const spots = useApi(() => api.hotspots({ city: cityName, date }), [cityName, date]);
  const metrics = useApi(() => api.metrics(), []);
  const drivers = useApi(() => api.shapDrivers(), []);
  const top = spots.data?.[0];
  const rec = useApi(() => (top ? api.recommendations({ location_id: top.id }) : null), [top?.id]);

  const csv = () => {
    const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = (spots.data || []).map((s) => [q(s.name), s.lat, s.lng, s.lst, s.ndvi, s.builtup, s.risk, q(s.driver)].join(','));
    const url = URL.createObjectURL(new Blob([['name,lat,lng,lst,ndvi,builtup,risk,driver', ...rows].join('\n')], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'urban-heat-hotspots.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Reports" subtitle={`Hotspot results and a printable summary for ${cityName}${effectiveDate ? `, ${effectiveDate}` : ''}`}>
        <button className="btn print:hidden" onClick={csv} disabled={!spots.data}><Download size={16} />Download CSV</button>
        <button className="btn-ghost print:hidden" onClick={() => window.print()}><Printer size={16} />Print / Save PDF</button>
      </PageHeader>

      <section className="card">
        <h2 className="card-title">Model summary</h2>
        <Async state={metrics} height={60}>
          {(m) => <p className="mt-2 text-sm">{m.model} regression: R² {m.r2}, MAE {m.mae} °C, RMSE {m.rmse} °C, {m.n_train ? `trained on ${Number(m.n_train).toLocaleString()} samples and tested on ${Number(m.n_test).toLocaleString()}.` : ''}</p>}
        </Async>
        <MonsoonWarning className="mt-3" />
        <Async state={drivers} height={60}>
          {(d) => <p className="mt-2 text-sm">Strongest heating drivers: {d.positive.map((x) => x.feature).join(', ')}. Strongest cooling drivers: {d.negative.map((x) => x.feature).join(', ')}.</p>}
        </Async>
      </section>

      <section className="card">
        <h2 className="card-title mb-2">Priority hotspots</h2>
        <Async state={spots} height={200}>{(d) => <HotspotTable rows={d} />}</Async>
      </section>

      <section className="card">
        <h2 className="card-title">Recommended strategies{top ? ` · ${top.name}` : ''}</h2>
        <Async state={rec} height={100}>
          {(d) => d && (
            <ul className="mt-2 space-y-1 text-sm">
              {d.strategies.map((s) => (
                <li key={s.title} className="flex flex-wrap items-center gap-2">
                  <span>{s.title}: {cooling(s.est_cooling)}</span>
                  {isNum(s.est_cooling) && s.est_cooling >= 0 && <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${impactClass[s.impact] || impactClass.Low}`}>{s.impact} impact</span>}
                </li>
              ))}
              <li className="pt-1 font-bold">Overall expected cooling: {cooling(d.overall_cooling)}</li>
            </ul>
          )}
        </Async>
      </section>
    </>
  );
}
