const tones = {
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40',
  red: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40',
};

export default function KpiCard({ label, value, delta, bad, tone, icon: Icon }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl p-4 ${tones[tone]}`}>
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white dark:bg-slate-900">
        <Icon size={22} />
      </div>
      <div className="min-w-0 text-ink dark:text-slate-100">
        <div className="muted">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs ${bad ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>{delta}</div>
      </div>
    </div>
  );
}
