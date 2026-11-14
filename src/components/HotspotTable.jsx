import { riskClass } from '../data/mock.js';

export default function HotspotTable({ rows, compact = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-left text-sm">
        <thead className="muted">
          <tr>
            <th className="py-2 pr-3 font-medium">Location</th>
            <th className="py-2 pr-3 font-medium">LST</th>
            {!compact && <th className="hidden py-2 pr-3 font-medium sm:table-cell">Main driver</th>}
            <th className="py-2 font-medium">Risk</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
              <td className="py-2.5 pr-3 font-medium">{r.name}</td>
              <td className="py-2.5 pr-3 tabular-nums">{r.lst.toFixed(1)} °C</td>
              {!compact && <td className="hidden py-2.5 pr-3 text-slate-500 dark:text-slate-400 sm:table-cell">{r.driver}</td>}
              <td className="py-2.5"><span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${riskClass[r.risk]}`}>{r.risk}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
