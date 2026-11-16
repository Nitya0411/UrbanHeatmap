import { SHAP_PALETTE } from '../utils/colors.js';

export default function ShapBars({ data }) {
  const max = Math.max(...data.map((d) => d.value), 0.0001);
  return (
    <ul className="mt-3 flex flex-1 flex-col justify-between gap-2.5">
      {data.map((d, i) => (
        <li key={d.feature} className="grid grid-cols-[110px_1fr_36px] items-center gap-2 text-xs">
          <span className="truncate" title={d.feature}>{d.feature}</span>
          <span className="h-2.5 rounded bg-slate-100 dark:bg-slate-800">
            <span className="block h-2.5 rounded" style={{ width: `${(d.value / max) * 100}%`, background: SHAP_PALETTE[i % SHAP_PALETTE.length] }} />
          </span>
          <span className="text-right tabular-nums">{d.value.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}
