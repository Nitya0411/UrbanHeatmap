import { useEffect, useRef, useState } from 'react';
import { ramp } from '../utils/colors.js';

// Beeswarm-style SHAP summary: one row per feature, one dot per sample.
// Dot colour = feature value (blue low, red high); x = SHAP value (effect on LST in °C).
// The SVG is drawn at the real pixel width of its card, so text and dots keep a fixed size on any screen.
export default function ShapSummaryPlot({ data }) {
  const wrap = useRef(null);
  const [w, setW] = useState(720);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(480, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rowH = 38, right = 16, top = 8, footer = 46;
  const left = Math.min(280, Math.max(140, 20 + Math.max(...data.map((f) => f.feature.length)) * 6.6));
  const height = top + data.length * rowH + footer;
  const lim = Math.max(...data.flatMap((f) => f.points.map((p) => Math.abs(p.shap))), 0.01);
  const x = (v) => left + ((v + lim) / (2 * lim)) * (w - left - right);

  return (
    <div ref={wrap} className="overflow-x-auto">
      <svg width={w} height={height} role="img" aria-label="SHAP summary plot">
        <line x1={x(0)} x2={x(0)} y1={top} y2={top + data.length * rowH} className="stroke-slate-300 dark:stroke-slate-600" strokeDasharray="3 3" />
        {data.map((f, fi) => {
          const cy = top + fi * rowH + rowH / 2;
          return (
            <g key={f.feature}>
              <line x1={left} x2={w - right} y1={cy} y2={cy} className="stroke-slate-100 dark:stroke-slate-800" />
              <text x={left - 10} y={cy + 4} textAnchor="end" fontSize="12" className="fill-slate-700 dark:fill-slate-300">{f.feature}</text>
              {f.points.map((p, i) => (
                <circle key={i} cx={x(p.shap)} cy={cy + (((i * 13) % 9) - 4) * 1.6} r="2.6" fill={ramp(p.value)} fillOpacity="0.8" />
              ))}
            </g>
          );
        })}
        <text x={(left + w - right) / 2} y={height - 24} textAnchor="middle" fontSize="11" className="fill-slate-500 dark:fill-slate-400">SHAP value (effect on predicted LST, °C)</text>
        <defs><linearGradient id="shapramp" x1="0" x2="1"><stop offset="0" stopColor={ramp(0)} /><stop offset="1" stopColor={ramp(1)} /></linearGradient></defs>
        <text x={w - right - 126} y={height - 6} textAnchor="end" fontSize="10" className="fill-slate-500 dark:fill-slate-400">Low</text>
        <rect x={w - right - 120} y={height - 14} width="80" height="6" rx="3" fill="url(#shapramp)" />
        <text x={w - right - 34} y={height - 6} fontSize="10" className="fill-slate-500 dark:fill-slate-400">High value</text>
      </svg>
    </div>
  );
}
