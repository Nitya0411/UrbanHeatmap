import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import HeatMap from '../components/HeatMap.jsx';
import HotspotTable from '../components/HotspotTable.jsx';
import LocationInsight from '../components/LocationInsight.jsx';
import Async from '../components/Async.jsx';
import { useApi } from '../hooks/useApi.js';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';

export default function HeatmapPage() {
  const { cityName, date, city, place, setPlace } = useApp();
  const spots = useApi(() => api.hotspots({ city: cityName, date }), [cityName, date]);
  const layers = useApi(() => api.layers(), []);
  const [layerId, setLayerId] = useState('lst');
  const [pin, setPin] = useState(place);

  // A place chosen from the search box becomes the selected point
  useEffect(() => { if (place) setPin(place); }, [place]);

  const onMapClick = (lat, lng) => { const p = { lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }; setPin(p); setPlace(null); };
  const layer = layers.data?.find((l) => l.id === layerId);
  const center = pin ? [pin.lat, pin.lng] : city.center;

  return (
    <>
      <PageHeader title="Heatmap" subtitle="Spatial distribution of Land Surface Temperature and urban heat hotspots">
        {layers.data && (
          <div className="flex overflow-hidden rounded-full border border-slate-200 dark:border-slate-700" role="group" aria-label="Map layer">
            {layers.data.map((l) => (
              <button key={l.id} onClick={() => setLayerId(l.id)} aria-pressed={layerId === l.id}
                className={`px-4 py-2 text-sm ${layerId === l.id ? 'bg-teal-600 font-bold text-white' : 'bg-white dark:bg-slate-900'}`}>{l.label}</button>
            ))}
          </div>
        )}
      </PageHeader>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="card lg:col-span-3">
          <Async state={spots} height={480}>
            {(d) => <HeatMap points={d} layer={layer} center={center} zoom={pin ? 12 : city.zoom} height="clamp(420px, calc(100vh - 340px), 760px)" pin={pin} onMapClick={onMapClick} />}
          </Async>
          <p className="muted mt-2">Click the map to analyse any point. Tap a marker to see its NDVI and built-up share.</p>
        </div>
        <div className="flex flex-col gap-4">
          <LocationInsight pin={pin} />
          <Async state={spots} height={120}>
            {(d) => {
              const t = d.map((s) => s.lst);
              return (
                <div className="card">
                  <h2 className="card-title">Hotspot summary</h2>
                  <dl className="mt-3 space-y-3 text-sm">
                    <div className="flex justify-between"><dt className="muted text-sm">Hotspots listed</dt><dd className="font-bold">{d.length}</dd></div>
                    <div className="flex justify-between"><dt className="muted text-sm">Max temperature</dt><dd className="font-bold text-red-600">{Math.max(...t).toFixed(1)} °C</dd></div>
                    <div className="flex justify-between"><dt className="muted text-sm">Min temperature</dt><dd className="font-bold text-blue-600">{Math.min(...t).toFixed(1)} °C</dd></div>
                  </dl>
                </div>
              );
            }}
          </Async>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title mb-2">All hotspots</h2>
        <Async state={spots} height={200}>{(d) => <HotspotTable rows={d} />}</Async>
      </section>
    </>
  );
}
