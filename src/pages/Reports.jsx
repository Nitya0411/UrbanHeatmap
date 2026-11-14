import { Download, Printer } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import HotspotTable from '../components/HotspotTable.jsx';
import { useFetch } from '../services/api.js';
import { hotspots, metrics, strategies } from '../data/mock.js';

export default function Reports() {
  const spots = useFetch('/hotspots', hotspots);
  const m = useFetch('/metrics', metrics);

  const downloadCsv = () => {
    const head = 'name,lat,lng,lst,ndvi,builtup,risk,driver';
    const rows = spots.map((s) => [s.name, s.lat, s.lng, s.lst, s.ndvi, s.builtup, s.risk, `"${s.driver}"`].join(','));
    const url = URL.createObjectURL(new Blob([[head, ...rows].join('\n')], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'urban-heat-hotspots.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Export hotspot results and a printable summary for Delhi-NCR, 25 May 2026">
        <button className="btn" onClick={downloadCsv}><Download size={16} />Download CSV</button>
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={16} />Print / Save PDF</button>
      </PageHeader>

      <section className="card">
        <h2 className="card-title">Model summary</h2>
        <p className="mt-2 text-sm">XGBoost regression: R² {m.r2}, MAE {m.mae} °C, RMSE {m.rmse} °C. Drivers ranked with SHAP; cooling scenarios compare tree cover, green roofs, cool roofs, high albedo and water bodies.</p>
      </section>
      <section className="card"><h2 className="card-title mb-2">Priority hotspots</h2><HotspotTable rows={spots} /></section>
      <section className="card">
        <h2 className="card-title">Recommended strategies</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
          {strategies.map((s) => <li key={s.title}>{s.title}: −{s.cut} °C ({s.impact} impact)</li>)}
        </ul>
      </section>
    </>
  );
}
