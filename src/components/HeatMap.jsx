import { Fragment, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { LEGENDS, layerColor } from '../data/mock.js';

const TILES = {
  Satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  Street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [map, center[0], center[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function HeatMap({ points, layer = 'lst', center = [28.61, 77.21], zoom = 10, height = 380, selectedId }) {
  const [tile, setTile] = useState('Satellite');
  const legend = LEGENDS[layer];

  return (
    <div className="relative isolate overflow-hidden rounded-xl" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <Recenter center={center} zoom={zoom} />
        <TileLayer key={tile} url={TILES[tile].url} attribution={TILES[tile].attribution} />
        {points.map((p) => {
          const color = layerColor(layer, p);
          return (
            <Fragment key={p.id}>
              <Circle center={[p.lat, p.lng]} radius={2500 + (p.lst - 40) * 900} pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 0 }} />
              <CircleMarker center={[p.lat, p.lng]} radius={selectedId === p.id ? 9 : 6} pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }}>
                <Tooltip>
                  <b>{p.name}</b><br />LST {p.lst.toFixed(1)} °C · NDVI {p.ndvi} · Built-up {p.builtup}%
                </Tooltip>
              </CircleMarker>
            </Fragment>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-3 left-3 z-[500] flex overflow-hidden rounded-lg bg-white text-xs shadow dark:bg-slate-900">
        {Object.keys(TILES).map((t) => (
          <button key={t} onClick={() => setTile(t)} className={`px-3 py-2 ${tile === t ? 'font-bold' : 'text-slate-500'}`}>{t}</button>
        ))}
      </div>

      <div className="absolute bottom-3 right-3 z-[500] hidden rounded-xl bg-white/95 p-2.5 text-[11px] shadow dark:bg-slate-900/95 sm:block">
        <b className="mb-1 block">{layer === 'lst' ? 'Temperature (°C)' : layer === 'ndvi' ? 'NDVI' : 'Built-up (%)'}</b>
        {legend.map(([c, l]) => (
          <div key={l} className="flex items-center gap-2 leading-5"><span className="h-3 w-3 rounded-sm" style={{ background: c }} />{l}</div>
        ))}
      </div>
    </div>
  );
}
