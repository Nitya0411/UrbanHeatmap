import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Field({ label, error, type = 'text', hint, ...props }) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  const id = props.name;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input id={id} type={isPw && show ? 'text' : type} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
          className={`min-h-[44px] w-full rounded-lg border bg-white px-3 text-sm dark:bg-slate-900 ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} ${isPw ? 'pr-11' : ''}`} {...props} />
        {isPw && (
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-slate-500">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? <p id={`${id}-err`} className="mt-1 text-xs text-red-600">{error}</p> : hint && <p className="muted mt-1">{hint}</p>}
    </div>
  );
}
