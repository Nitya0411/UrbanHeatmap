import { Fragment, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { LEGENDS, layerColor } from '../utils/colors.js';

const BASES = {
  Satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: 'Tiles &copy; Esri' },
  Street: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap contributors' },
};

function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [map, center[0], center[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function Clicks({ onClick }) {
  useMapEvents({ click: (e) => onClick?.(e.latlng.lat, e.latlng.lng) });
  return null;
}

/**
 * points   : hotspots from /api/hotspots
 * layer    : one item of /api/map/layers. If layer.tile_url is set it is drawn as a raster overlay,
 *            otherwise hotspot circles are drawn (used while the backend has no tiles yet).
 * pin      : {lat, lng, label} marker for the searched / clicked place
 * onMapClick(lat, lng) : called when the user clicks the map
 */
export default function HeatMap({ points = [], layer, center = [28.61, 77.21], zoom = 10, height = 380, selectedId, pin, onMapClick }) {
  const [base, setBase] = useState('Satellite');
  const layerId = layer?.id || 'lst';
  const tileUrl = layer?.tile_url;
  const legend = layer?.legend?.length ? layer.legend.map((l) => [l.color, l.label]) : LEGENDS[layerId] || LEGENDS.lst;
  const title = layer?.label || 'Temperature (°C)';

  return (
    <div className="relative isolate overflow-hidden rounded-xl" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%', cursor: onMapClick ? 'crosshair' : undefined }}>
        <Recenter center={center} zoom={zoom} />
        <Clicks onClick={onMapClick} />
        <TileLayer key={base} url={BASES[base].url} attribution={BASES[base].attribution} />
        {tileUrl && <TileLayer key={tileUrl} url={tileUrl} opacity={0.75} attribution={layer.attribution || ''} />}
        {points.map((p) => {
          const color = layerColor(layerId, p);
          return (
            <Fragment key={p.id}>
              {!tileUrl && <Circle center={[p.lat, p.lng]} radius={2500 + (p.lst - 40) * 900} pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 0 }} />}
              <CircleMarker center={[p.lat, p.lng]} radius={selectedId === p.id ? 9 : 6} pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }}>
                <Tooltip><b>{p.name}</b><br />LST {p.lst.toFixed(1)} °C · NDVI {p.ndvi} · Built-up {p.builtup}%</Tooltip>
              </CircleMarker>
            </Fragment>
          );
        })}
        {pin && (
          <CircleMarker center={[pin.lat, pin.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#0e7c7b', fillOpacity: 1 }}>
            <Tooltip permanent direction="top">{pin.label || 'Selected point'}</Tooltip>
          </CircleMarker>
        )}
      </MapContainer>

      <div className="absolute bottom-3 left-3 z-[500] flex overflow-hidden rounded-lg bg-white text-xs shadow dark:bg-slate-900">
        {Object.keys(BASES).map((t) => (
          <button key={t} onClick={() => setBase(t)} aria-pressed={base === t} className={`px-3 py-2 ${base === t ? 'font-bold' : 'text-slate-500'}`}>{t}</button>
        ))}
      </div>

      <div className="absolute bottom-3 right-3 z-[500] hidden rounded-xl bg-white/95 p-2.5 text-[11px] shadow dark:bg-slate-900/95 sm:block">
        <b className="mb-1 block">{title}</b>
        {legend.map(([c, l]) => (
          <div key={l} className="flex items-center gap-2 leading-5"><span className="h-3 w-3 rounded-sm" style={{ background: c }} />{l}</div>
        ))}
      </div>
    </div>
  );
}
