import { ramp } from '../utils/colors.js';

// Beeswarm-style SHAP summary: one row per feature, one dot per sample.
// Dot colour = feature value (blue low, red high); x = SHAP value (effect on LST in °C).
export default function ShapSummaryPlot({ data }) {
  const rowH = 44, left = 150, right = 20, top = 12, width = 640;
  const all = data.flatMap((f) => f.points.map((p) => p.shap));
  const lim = Math.max(...all.map(Math.abs), 0.01);
  const x = (v) => left + ((v + lim) / (2 * lim)) * (width - left - right);
  const height = top + data.length * rowH + 34;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[520px] w-full" role="img" aria-label="SHAP summary plot">
        <line x1={x(0)} x2={x(0)} y1={top} y2={top + data.length * rowH} className="stroke-slate-300 dark:stroke-slate-600" strokeDasharray="3 3" />
        {data.map((f, fi) => {
          const cy = top + fi * rowH + rowH / 2;
          return (
            <g key={f.feature}>
              <line x1={left} x2={width - right} y1={cy} y2={cy} className="stroke-slate-100 dark:stroke-slate-800" />
              <text x={left - 10} y={cy + 4} textAnchor="end" fontSize="12" className="fill-slate-700 dark:fill-slate-300">{f.feature}</text>
              {f.points.map((p, i) => (
                <circle key={i} cx={x(p.shap)} cy={cy + ((i * 13) % 9 - 4) * 2.2} r="2.8" fill={ramp(p.value)} fillOpacity="0.8" />
              ))}
            </g>
          );
        })}
        <text x={(left + width - right) / 2} y={height - 14} textAnchor="middle" fontSize="11" className="fill-slate-500 dark:fill-slate-400">SHAP value (effect on predicted LST, °C)</text>
        <defs><linearGradient id="shapramp" x1="0" x2="1"><stop offset="0" stopColor={ramp(0)} /><stop offset="1" stopColor={ramp(1)} /></linearGradient></defs>
        <rect x={width - right - 110} y={height - 26} width="110" height="6" rx="3" fill="url(#shapramp)" />
        <text x={width - right - 112} y={height - 20} textAnchor="end" fontSize="10" className="fill-slate-500 dark:fill-slate-400">Low</text>
        <text x={width - right} y={height - 6} textAnchor="end" fontSize="10" className="fill-slate-500 dark:fill-slate-400">High feature value</text>
      </svg>
    </div>
  );
}
