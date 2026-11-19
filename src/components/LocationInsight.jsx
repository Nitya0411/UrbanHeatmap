import { MapPin } from 'lucide-react';
import Async from './Async.jsx';
import LocalShap from './LocalShap.jsx';
import { MonsoonWarning } from './AccuracyNote.jsx';
import { useApi } from '../hooks/useApi.js';
import { api } from '../services/api.js';

// Shows the model prediction and the SHAP explanation for one map point.
export default function LocationInsight({ pin }) {
  const key = [pin?.lat, pin?.lng];
  const pred = useApi(() => (pin ? api.predict({ lat: pin.lat, lng: pin.lng }) : null), key);
  const shap = useApi(() => (pin ? api.shapLocal({ lat: pin.lat, lng: pin.lng }) : null), key);

  if (!pin) {
    return (
      <div className="card flex-1">
        <h2 className="card-title">Location insight</h2>
        <p className="muted mt-2 flex items-start gap-2 text-sm"><MapPin size={16} className="mt-0.5 flex-none" />Click anywhere on the map, or search for a place, to see its predicted temperature and what drives it.</p>
      </div>
    );
  }

  return (
    <div className="card flex flex-1 flex-col">
      <h2 className="card-title">Location insight</h2>
      <p className="muted">{pin.label || `${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`}</p>
      <div className="mt-3">
        <Async state={pred} height={64}>
          {(d) => d && (
            <div className="rounded-xl bg-teal-50 p-3 dark:bg-teal-950">
              <div className="muted">Predicted LST{d.area ? ` · ${d.area}` : ''}</div>
              <div className="text-2xl font-bold">{d.predicted_lst} °C</div>
              {d.actual_lst != null && <div className="muted">Observed: {d.actual_lst} °C</div>}
              {d.features && <div className="muted mt-1">{Object.entries(d.features).map(([k, v]) => `${k}: ${v}`).join(' · ')}</div>}
            </div>
          )}
        </Async>
      </div>
      <MonsoonWarning className="mt-3" />
      <h3 className="mt-4 text-sm font-bold">Why this temperature?</h3>
      <div className="mt-2 flex flex-1 flex-col"><Async state={shap} height={160}>{(d) => d && <LocalShap data={d} />}</Async></div>
    </div>
  );
}
