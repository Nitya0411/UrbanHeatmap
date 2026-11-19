import { AlertTriangle, Info } from 'lucide-react';
import { useApi } from '../hooks/useApi.js';
import { api } from '../services/api.js';
import { isNum } from '../utils/format.js';

export function warningText(w) {
  if (!w) return '';
  if (typeof w === 'string') return w;
  return w.message || w.text || w.warning || '';
}

// Shows the model warning sent in /api/metrics (the monsoon warning). Renders nothing when there is none.
export function MonsoonWarning({ className = '' }) {
  const { data } = useApi(() => api.metrics(), []);
  const text = warningText(data?.warning);
  if (!text) return null;
  return (
    <div role="note" className={`flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 ${className}`}>
      <AlertTriangle size={14} className="mt-0.5 flex-none" /><span>{text}</span>
    </div>
  );
}

// Cooling estimates smaller than the model's own average error must not be read as real-world cooling.
export function SmallEffectNote({ value, className = '' }) {
  const { data } = useApi(() => api.metrics(), []);
  if (!isNum(value) || !isNum(data?.mae) || value >= data.mae) return null;
  return (
    <div role="note" className={`flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-left text-xs text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200 ${className}`}>
      <Info size={14} className="mt-0.5 flex-none" />
      <span>This estimate (−{+value.toFixed(2)} °C) is smaller than the model’s average error ({data.mae} °C). Read it as direction and relative size, not as expected real-world cooling.</span>
    </div>
  );
}
