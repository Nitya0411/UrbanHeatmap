import { RefreshCw, AlertTriangle } from 'lucide-react';

export function Skeleton({ height = 120, className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`} style={{ height }} aria-hidden="true" />;
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
      <AlertTriangle size={18} className="flex-none" />
      <span className="min-w-0 flex-1">{error?.message || 'Something went wrong.'}</span>
      {onRetry && (
        <button className="btn-ghost !min-h-[36px] !px-3" onClick={onRetry}><RefreshCw size={14} />Retry</button>
      )}
    </div>
  );
}

// <Async state={useApi(...)}>{(data) => ...}</Async>
export default function Async({ state, height = 120, children }) {
  const { data, loading, error, reload } = state;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (loading && !data) return <Skeleton height={height} />;
  return children(data);
}
