// Per-location explanation: red bars push the temperature up, teal bars pull it down (values in °C).
export default function LocalShap({ data }) {
  const rows = [...data.contributions].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 0.0001);
  return (
    <div className="flex flex-1 flex-col">
      <p className="muted">Starts at the average of {data.base_value.toFixed(1)} °C and ends at the predicted {data.predicted_lst.toFixed(1)} °C.</p>
      <ul className="mt-3 flex flex-1 flex-col justify-evenly gap-2">
        {rows.map((r) => (
          <li key={r.feature} className="grid grid-cols-[150px_1fr_44px] items-center gap-2 text-[13px]">
            <span className="break-words leading-tight">{r.feature}</span>
            <span className="relative h-3 rounded bg-slate-100 dark:bg-slate-800" aria-hidden="true">
              <span className="absolute inset-y-0 left-1/2 w-px bg-slate-400" />
              <span
                className={`absolute inset-y-0 rounded ${r.value >= 0 ? 'bg-red-500' : 'bg-teal-500'}`}
                style={r.value >= 0 ? { left: '50%', width: `${(r.value / max) * 50}%` } : { right: '50%', width: `${(-r.value / max) * 50}%` }}
              />
            </span>
            <span className="text-right tabular-nums">{r.value > 0 ? '+' : ''}{r.value.toFixed(1)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
