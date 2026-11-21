export default function Gauge({ value, label = 'R²' }) {
  const c = 2 * Math.PI * 40;
  return (
    <svg viewBox="0 0 100 100" className="mx-auto w-36" role="img" aria-label={`${label} ${value}`}>
      <circle cx="50" cy="50" r="40" fill="none" strokeWidth="9" className="stroke-slate-200 dark:stroke-slate-700" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#14b8a6" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${c * value} ${c}`} transform="rotate(-90 50 50)" />
      <text x="50" y="46" textAnchor="middle" fontSize="9" className="fill-slate-500 dark:fill-slate-400">{label}</text>
      <text x="50" y="62" textAnchor="middle" fontSize="18" fontWeight="700" className="fill-ink dark:fill-slate-100">{Number(value).toFixed(2)}</text>
    </svg>
  );
}
