import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import HeatMap from '../components/HeatMap.jsx';
import HotspotTable from '../components/HotspotTable.jsx';
import { useFetch } from '../services/api.js';
import { hotspots } from '../data/mock.js';

const layers = [['lst', 'LST'], ['ndvi', 'NDVI'], ['builtup', 'Built-up']];

export default function HeatmapPage() {
  const spots = useFetch('/hotspots', hotspots);
  const [layer, setLayer] = useState('lst');
  const temps = spots.map((s) => s.lst);

  return (
    <>
      <PageHeader title="Heatmap" subtitle="Spatial distribution of Land Surface Temperature and urban heat hotspots">
        <div className="flex overflow-hidden rounded-full border border-slate-200 dark:border-slate-700" role="group" aria-label="Map layer">
          {layers.map(([k, l]) => (
            <button key={k} onClick={() => setLayer(k)} aria-pressed={layer === k}
              className={`px-4 py-2 text-sm ${layer === k ? 'bg-teal-600 font-bold text-white' : 'bg-white dark:bg-slate-900'}`}>{l}</button>
          ))}
        </div>
      </PageHeader>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="card lg:col-span-3"><HeatMap points={spots} layer={layer} height={520} /></div>
        <div className="card">
          <h2 className="card-title">Hotspot summary</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="muted text-sm">Hotspot count</dt><dd className="font-bold">{spots.length}</dd></div>
            <div className="flex justify-between"><dt className="muted text-sm">Max temperature</dt><dd className="font-bold text-red-600">{Math.max(...temps).toFixed(1)} °C</dd></div>
            <div className="flex justify-between"><dt className="muted text-sm">Min temperature</dt><dd className="font-bold text-blue-600">{Math.min(...temps).toFixed(1)} °C</dd></div>
          </dl>
          <p className="muted mt-4">Tap a marker for NDVI and built-up values. Circles scale with temperature.</p>
        </div>
      </section>

      <section className="card"><h2 className="card-title mb-2">All hotspots</h2><HotspotTable rows={spots} /></section>
    </>
  );
}
